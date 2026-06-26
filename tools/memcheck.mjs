// Автономный тест на утечки памяти для webp_loader.
// Управляет headless Chrome по Chrome DevTools Protocol (встроенный WebSocket Node 22).
// Запуск: node tools/memcheck.mjs   (dev-сервер должен быть поднят на APP_URL)
//
// Что проверяет:
//  1. Баланс URL.createObjectURL / revokeObjectURL при повторной загрузке файлов (mixin loadFile.js).
//  2. Рост JS-heap и числа DOM-узлов после множества циклов mount+load+destroy компонентов.
//  3. Остаточные ("живые") object URL и detached <img> после полной очистки.

import { spawn } from 'node:child_process'
import { mkdtempSync, rmSync, writeFileSync, readFileSync, existsSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { setTimeout as sleep } from 'node:timers/promises'

const APP_URL = process.env.APP_URL || 'http://localhost:5173/'
const CHROME = process.env.CHROME_BIN || '/usr/bin/google-chrome'
const PORT = 9000 + Math.floor(Math.random() * 1000)
const LOAD_CYCLES = Number(process.env.LOAD_CYCLES || 40)   // повторные загрузки в один input
const CHURN_CYCLES = Number(process.env.CHURN_CYCLES || 25) // циклы добавления/удаления компонента

const profileDir = mkdtempSync(join(tmpdir(), 'webp-memcheck-'))
const imgPath = join(profileDir, 'test.bmp')
// Несколько РАЗНЫХ изображений: setFileInputFiles шлёт change только если набор файлов изменился,
// поэтому для честной проверки повторного выбора в один input чередуем разные файлы.
const imgVariants = [0, 1, 2, 3].map((i) => join(profileDir, `test_${i}.bmp`))

// --- Генерация реального тестового изображения (24-bit BMP, ~1.4 МБ) ---
function makeBmp(path, w, h, tint = 0) {
  const rowSize = Math.floor((24 * w + 31) / 32) * 4
  const pixelArraySize = rowSize * h
  const fileSize = 54 + pixelArraySize
  const buf = Buffer.alloc(fileSize)
  buf.write('BM', 0)
  buf.writeUInt32LE(fileSize, 2)
  buf.writeUInt32LE(54, 10)
  buf.writeUInt32LE(40, 14)
  buf.writeInt32LE(w, 18)
  buf.writeInt32LE(h, 22)
  buf.writeUInt16LE(1, 26)
  buf.writeUInt16LE(24, 28)
  buf.writeUInt32LE(pixelArraySize, 34)
  for (let y = 0; y < h; y++) {
    const rowStart = 54 + (h - 1 - y) * rowSize
    for (let x = 0; x < w; x++) {
      const o = rowStart + x * 3
      buf[o] = ((x * 255 / w) + tint) & 255        // B
      buf[o + 1] = ((y * 255 / h) + tint) & 255    // G
      buf[o + 2] = (((x + y) * 255 / (w + h)) + tint) & 255 // R
    }
  }
  writeFileSync(path, buf)
}
makeBmp(imgPath, 800, 600)
imgVariants.forEach((p, i) => makeBmp(p, 800, 600, (i + 1) * 37))

// --- Запуск Chrome ---
const chrome = spawn(CHROME, [
  '--headless=new',
  '--disable-gpu',
  '--no-first-run',
  '--no-default-browser-check',
  '--disable-extensions',
  `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${profileDir}`,
  APP_URL,
], { stdio: 'ignore' })

let ws
const pending = new Map()
let msgId = 0
const events = []

function send(method, params = {}) {
  const id = ++msgId
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject })
    ws.send(JSON.stringify({ id, method, params }))
  })
}

async function getPageTarget() {
  for (let i = 0; i < 50; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json`)
      const list = await res.json()
      const page = list.find((t) => t.type === 'page' && t.url.includes('5173'))
      if (page?.webSocketDebuggerUrl) return page.webSocketDebuggerUrl
    } catch { /* chrome ещё не готов */ }
    await sleep(200)
  }
  throw new Error('Не удалось найти page target в Chrome')
}

async function evaluate(expression, awaitPromise = true) {
  const r = await send('Runtime.evaluate', {
    expression, awaitPromise, returnByValue: true,
  })
  if (r.exceptionDetails) {
    throw new Error('eval: ' + (r.exceptionDetails.exception?.description || r.exceptionDetails.text))
  }
  return r.result.value
}

async function getInputObjectId(selector) {
  const r = await send('Runtime.evaluate', { expression: `document.querySelector(${JSON.stringify(selector)})` })
  return r.result.objectId
}

async function setFile(selector, file = imgPath) {
  const objectId = await getInputObjectId(selector)
  if (!objectId) throw new Error('input не найден: ' + selector)
  await send('DOM.setFileInputFiles', { objectId, files: [file] })
}

async function gcAndHeap() {
  await send('HeapProfiler.collectGarbage')
  await sleep(100)
  const r = await send('Runtime.getHeapUsage')
  return r.usedSize
}

function fmt(bytes) { return (bytes / 1048576).toFixed(2) + ' MB' }

async function main() {
  const wsUrl = await getPageTarget()
  ws = new WebSocket(wsUrl)
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej })
  ws.onmessage = (e) => {
    const m = JSON.parse(e.data)
    if (m.id && pending.has(m.id)) {
      const { resolve, reject } = pending.get(m.id)
      pending.delete(m.id)
      m.error ? reject(new Error(m.error.message)) : resolve(m.result)
    } else if (m.method) {
      events.push(m)
    }
  }

  await send('Page.enable')
  await send('Runtime.enable')
  await send('DOM.enable')
  await send('HeapProfiler.enable')

  // Дождаться монтирования Vue-приложения.
  for (let i = 0; i < 50; i++) {
    const ready = await evaluate(`!!document.querySelector('#plus') && !!document.querySelector('#inputLeftDropTarget')`)
    if (ready) break
    await sleep(200)
  }

  // Инструментируем object URL, чтобы посчитать created/revoked/live.
  await evaluate(`(() => {
    window.__co = 0; window.__rv = 0; window.__live = new Set();
    const c = URL.createObjectURL.bind(URL);
    const r = URL.revokeObjectURL.bind(URL);
    URL.createObjectURL = (b) => { const u = c(b); window.__co++; window.__live.add(u); return u; };
    URL.revokeObjectURL = (u) => { window.__rv++; window.__live.delete(u); return r(u); };
    return true;
  })()`)

  const results = {}
  const baseHeap = await gcAndHeap()

  // ---- Тест 1: повторная загрузка в один и тот же input (mixin должен revoke предыдущий URL) ----
  for (let i = 0; i < LOAD_CYCLES; i++) {
    await setFile('#inputLeftDropTarget', imgVariants[i % imgVariants.length])
    await sleep(40)
  }
  await sleep(200)
  results.test1 = await evaluate(`({created: window.__co, revoked: window.__rv, live: window.__live.size})`)
  results.test1.heapAfter = fmt(await gcAndHeap())

  // ---- Тест 2: churn — добавить компонент, загрузить 3 картинки, удалить (beforeDestroy cleanup) ----
  const heapBeforeChurn = await gcAndHeap()
  const nodesBeforeChurn = await evaluate(`document.getElementsByTagName('*').length`)
  const coBefore = await evaluate(`window.__co`)

  for (let i = 0; i < CHURN_CYCLES; i++) {
    // добавить новый блок (по умолчанию c3 => 3 input/canvas)
    await evaluate(`document.querySelector('#plus').click()`)
    await sleep(60)
    // загрузить картинки во все input последнего блока
    const inputCount = await evaluate(`(() => {
      const layouts = document.querySelectorAll('[data-layout]');
      const last = layouts[layouts.length - 1];
      window.__lastLayout = last;
      return last ? last.querySelectorAll('input[type=file]').length : 0;
    })()`)
    for (let k = 0; k < inputCount; k++) {
      const oid = (await send('Runtime.evaluate', {
        expression: `window.__lastLayout.querySelectorAll('input[type=file]')[${k}]`,
      })).result.objectId
      if (oid) await send('DOM.setFileInputFiles', { objectId: oid, files: [imgPath] })
      await sleep(30)
    }
    // выбрать чекбокс последнего блока и удалить
    await evaluate(`(() => {
      const cb = window.__lastLayout.querySelector('#checkboxInput');
      if (cb && !cb.checked) { cb.click(); }
      return true;
    })()`)
    await sleep(30)
    await evaluate(`document.querySelector('#minus').click()`)
    await sleep(60)
  }
  await sleep(300)

  const heapAfterChurn = await gcAndHeap()
  const nodesAfterChurn = await evaluate(`document.getElementsByTagName('*').length`)
  const liveAfter = await evaluate(`window.__live.size`)
  const coAfter = await evaluate(`window.__co`)

  // detached <img>, удерживаемые JS, после полной очистки
  const detachedImgs = await evaluate(`(() => {
    // эвристика: <img> с object URL src, не находящиеся в документе — здесь все в документе,
    // поэтому считаем общее число img-элементов как индикатор остаточных компонентов.
    return document.querySelectorAll('img.loadImageResult').length;
  })()`)

  results.test2 = {
    cyclesWithImages: CHURN_CYCLES,
    createdDuringChurn: coAfter - coBefore,
    liveObjectUrlsAfter: liveAfter,
    nodesBeforeChurn, nodesAfterChurn,
    nodeDelta: nodesAfterChurn - nodesBeforeChurn,
    remainingLoadImgElements: detachedImgs,
    heapBeforeChurn: fmt(heapBeforeChurn),
    heapAfterChurn: fmt(heapAfterChurn),
    heapDelta: fmt(heapAfterChurn - heapBeforeChurn),
  }

  results.baselineHeap = fmt(baseHeap)

  console.log('\n================ MEMORY LEAK REPORT ================\n')
  console.log('Test 1 — повторная загрузка в один input (' + LOAD_CYCLES + ' раз):')
  console.log('  createObjectURL вызван : ' + results.test1.created)
  console.log('  revokeObjectURL вызван : ' + results.test1.revoked)
  console.log('  ЖИВЫХ object URL       : ' + results.test1.live + '  (ожидается ~1)')
  console.log('  JS heap после          : ' + results.test1.heapAfter)
  const t1leak = results.test1.live > 2 || (results.test1.created - results.test1.revoked) > 2
  console.log('  ВЕРДИКТ                : ' + (t1leak ? '⚠️  ВОЗМОЖНА УТЕЧКА object URL' : '✅ OK, URL освобождаются'))

  console.log('\nTest 2 — churn компонентов с картинками (' + CHURN_CYCLES + ' циклов):')
  console.log('  createObjectURL за churn: ' + results.test2.createdDuringChurn)
  console.log('  ЖИВЫХ object URL после  : ' + results.test2.liveObjectUrlsAfter + '  (ожидается ~1, от Test 1)')
  console.log('  DOM-узлов до/после      : ' + results.test2.nodesBeforeChurn + ' -> ' + results.test2.nodesAfterChurn + ' (Δ ' + results.test2.nodeDelta + ')')
  console.log('  loadImageResult в DOM   : ' + results.test2.remainingLoadImgElements)
  console.log('  JS heap до/после        : ' + results.test2.heapBeforeChurn + ' -> ' + results.test2.heapAfterChurn + ' (Δ ' + results.test2.heapDelta + ')')
  const t2urlLeak = results.test2.liveObjectUrlsAfter > 3
  const t2nodeLeak = results.test2.nodeDelta > 10
  const t2heapLeak = (heapAfterChurn - heapBeforeChurn) > 5 * 1048576
  console.log('  ВЕРДИКТ object URL      : ' + (t2urlLeak ? '⚠️  УТЕЧКА (URL не освобождены при destroy)' : '✅ OK'))
  console.log('  ВЕРДИКТ DOM-узлы        : ' + (t2nodeLeak ? '⚠️  УТЕЧКА (узлы не удаляются)' : '✅ OK'))
  console.log('  ВЕРДИКТ JS heap         : ' + (t2heapLeak ? '⚠️  ПОДОЗРЕНИЕ на рост heap' : '✅ OK (рост в пределах нормы)'))
  console.log('\n===================================================\n')

  await send('Browser.close').catch(() => {})
}

main()
  .catch((e) => { console.error('ОШИБКА ТЕСТА:', e.message) })
  .finally(async () => {
    try { ws?.close() } catch {}
    try { chrome.kill('SIGKILL') } catch {}
    await sleep(200)
    try { rmSync(profileDir, { recursive: true, force: true }) } catch {}
    process.exit(0)
  })
