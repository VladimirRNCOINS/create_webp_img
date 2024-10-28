<template>
    <div class="container">
      
      <div id="wrap_tools_panel">
        <div id="plus" @click.prevent.stop="plusElement()">
          <div id="signPlus">+</div>
        </div>
        <div id="minus" @click.prevent.stop="minusElement()" :class="{minusView: resultSelect.length}">
          <div id="signMinus">-</div>
        </div>
        <div id="select_template">
          <select v-model="selectType" @change="selectTemplate()" :disabled="checkSelectedItem">
            <option value="c2">c2</option>
            <option value="g2">g2</option>
            <option value="c1">c1</option>
            <option value="g1">g1</option>
          </select>
        </div>
        <div id="btn_save">
          <a id="a_btn">
            <button @click.stop.prevent="download()" id="save_btn">
                save
            </button>
          </a>
        </div>
      </div>
      
      <div v-for="(el, i) in dropTarget" :key="i" :data-layout="i">
          <div class="layout" v-if="!el.delete">
            
              <div id="checkboxItem">
                  <input type="checkbox" id="checkboxInput" v-model="dropTarget[i].selected" @change="checkCheckbox(el.item)" />
              </div>
              <div class="num">File-{{el.item}}-Index-{{el.index}}-Temp_{{el.template}}</div>
              <div class="dropTarget" v-if="(el.template == 'c2') || (el.template == 'g2')">
                  <DropTargetComponentC2G2 />
              </div>
              <div class="dropTarget" v-if="(el.template == 'c1') || (el.template == 'g1')">
                  <DropTargetComponentC1G1 />
              </div>
          </div>
      </div>

    </div>
</template>

<script>
import DropTargetComponentC2G2 from '@/components/DropTargetComponentC2G2.vue'
import DropTargetComponentC1G1 from '@/components/DropTargetComponentC1G1.vue'
import html2canvas from 'html2canvas';
export default {
  components: {
    DropTargetComponentC2G2,
    DropTargetComponentC1G1
  },
  data () {
    return {
      dropTarget: [
                    {
                      item: 1,
                      template: 'c1',
                      index: 0,
                      selected: false,
                      delete: false
                    }
                  ],
      fileName: '',
      localTargetElement: {},
      selectType: 'c2',
      loadedPromiseImages: [],
      ctxSettings: {
          dx: 0,
          dy: 0,
          width: null,
          height: null,
          shadowOffsetX: 10,
          shadowOffsetY: 10,
          shadowColor: 'black',
          shadowBlur: 20
      },
      srcWidth: null,
      srcHeight: null,

      loadOneElementWidth: null,
      loadOneElementHeight: null,
      ratioOneElement: null,
      coordXOneElement: null,
      coordYOneElement: null,
      elementSharpen: 7,

      max_src_c2_width: 871,
      max_src_c2_height: 880,
      max_c2_width: 772,
      max_c2_height: 772,

      fullLoadItemImg: false,
      resultSelect: []
    }
  },
  computed: {
    checkSelectedItem() {
      let selectedItemsArr = this.dropTarget.filter((el) => el.selected == true && el.delete == false)
      if (selectedItemsArr.length == 1 ) {
          return false
      }
      return true
    }
  },
  methods: {
    loadItemImage(elem, elemId) {
        return new Promise( (resolve) => {
            let loadId = "#" + elemId
            let loadImgElement = elem.querySelector(loadId)
            let newImg = new window.Image();
            newImg.setAttribute("src", loadImgElement.src)
            newImg.onload = () => {
                resolve(newImg)
            }
        })
    },
    checkFullImgLoadsInItemLoadElements(itemElements) {
        let countItemElements = itemElements.length
        let countLoadImgItem = 0
        this.fullLoadItemImg = false
        
        itemElements.forEach((el) => {
            let elemImg = el.querySelector('img')
            if (elemImg.src) {
                countLoadImgItem += 1
            }
        })
        if (countItemElements == countLoadImgItem) {
            this.fullLoadItemImg = true
        }
    },
    getItemLoadElements(itemElements) {
        this.checkFullImgLoadsInItemLoadElements(itemElements)
        if (this.fullLoadItemImg) {
            if (itemElements.length) {
                itemElements.forEach( (elem) => {
                    let elemImg = elem.querySelector('img')
                    let elemId = elemImg.id
                    this.loadedPromiseImages.push(this.loadItemImage(elem, elemId))
                })
            }
        }
    },
    getLocalDropTargetElement(index) {
        this.dropTarget.forEach( (el) => {
            if (el.index == index) {
                this.localTargetElement = el
            }
        })
    },
    sharpen(ctx, w, h, mix) {
        var weights = [0, -1, 0, -1, 5, -1, 0, -1, 0],
          katet = Math.round(Math.sqrt(weights.length)),
          half = (katet * 0.5) | 0,
          dstData = ctx.createImageData(w, h),
          dstBuff = dstData.data,
          srcBuff = ctx.getImageData(0, 0, w, h).data,
          y = h;

        while (y--) {

            var x = w;

            while (x--) {

                var sy = y,
                    sx = x,
                    dstOff = (y * w + x) * 4,
                    r = 0,
                    g = 0,
                    b = 0,
                    a = 0;

                for (var cy = 0; cy < katet; cy++) {
                    for (var cx = 0; cx < katet; cx++) {

                        var scy = sy + cy - half;
                        var scx = sx + cx - half;

                        if (scy >= 0 && scy < h && scx >= 0 && scx < w) {

                            var srcOff = (scy * w + scx) * 4;
                            var wt = weights[cy * katet + cx];

                            r += srcBuff[srcOff] * wt;
                            g += srcBuff[srcOff + 1] * wt;
                            b += srcBuff[srcOff + 2] * wt;
                            a += srcBuff[srcOff + 3] * wt;
                        }
                    }
                }

                dstBuff[dstOff] = r * mix + srcBuff[dstOff] * (1 - mix);
                dstBuff[dstOff + 1] = g * mix + srcBuff[dstOff + 1] * (1 - mix);
                dstBuff[dstOff + 2] = b * mix + srcBuff[dstOff + 2] * (1 - mix)
                dstBuff[dstOff + 3] = srcBuff[dstOff + 3];
            }
        }

        ctx.putImageData(dstData, 0, 0);
    },
    download() {
      let imgElements = document.querySelectorAll("#wrapDropTarget")
      imgElements.forEach( (elem, index) => {
        this.localTargetElement = {}
        this.getLocalDropTargetElement(index)
        //обнулить массив с промисами для одого элемента
        this.loadedPromiseImages = []
        this.getItemLoadElements(elem.childNodes)
        if (this.loadedPromiseImages.length) {
            elem.style.width = '1742px'
            elem.style.height = '880px'
            Promise.all(this.loadedPromiseImages)
            .then( (image) => {
                if (elem.childNodes.length) {
                    elem.childNodes.forEach( (item, ind) => {
                        this.srcWidth = image[ind].naturalWidth
                        this.srcHeight = image[ind].naturalHeight

                        let itemCanvas = item.querySelector("canvas")
                        itemCanvas.width = this.srcWidth
                        itemCanvas.height = this.srcHeight
                        
                        if (this.localTargetElement.template == 'c2' || this.localTargetElement.template == 'g2') {
                            this.ratioOneElement = Math.min(this.max_c2_width / itemCanvas.width, this.max_c2_height / itemCanvas.height);
                            this.loadOneElementWidth = parseInt(itemCanvas.width * this.ratioOneElement)
                            this.loadOneElementHeight = parseInt(itemCanvas.height * this.ratioOneElement)
                            this.coordXOneElement = parseInt((this.max_src_c2_width - this.loadOneElementWidth) / 2)
                            this.coordYOneElement = parseInt((this.max_src_c2_height - this.loadOneElementHeight) / 2)

                            itemCanvas.width = this.loadOneElementWidth
                            itemCanvas.height = this.loadOneElementHeight

                            this.ctxSettings.dx = this.coordXOneElement
                            this.ctxSettings.dy = this.coordYOneElement

                            itemCanvas.width = 871
                            itemCanvas.height = 880
                        }

                        let ctx = itemCanvas.getContext('2d');
                        ctx.imageSmoothingQuality = "high";
                        ctx.imageSmoothingEnabled = false;
                        ctx.scale(1, 1);
                        ctx.shadowOffsetX = this.ctxSettings.shadowOffsetX;
                        ctx.shadowOffsetY = this.ctxSettings.shadowOffsetY;
                        ctx.shadowColor = this.ctxSettings.shadowColor;
                        ctx.shadowBlur = this.ctxSettings.shadowBlur;
                        this.ctxSettings.width = this.loadOneElementWidth
                        this.ctxSettings.height = this.loadOneElementHeight
                        ctx.drawImage(image[ind], parseInt(this.ctxSettings.dx), parseInt(this.ctxSettings.dy), parseInt(this.ctxSettings.width), parseInt(this.ctxSettings.height)/*parseInt(this.ctxSettings.width), parseInt(this.ctxSettings.height)*/)
                        this.sharpen(ctx, this.ctxSettings.width, this.ctxSettings.height, this.elementSharpen * 0.01)
                    }) 
                }
                return elem
            })
            .then( (elem) => {
                this.switchDisplayElements(elem, 'none')
                let layoutParent = elem.closest(".layout")
                let numElement = layoutParent.querySelector(".num")
                this.fileName = ''
                this.fileName = numElement.innerHTML
                
                return elem
            })
            .then( (elem) => {
                let fileName = this.fileName
                html2canvas(elem, {logging : true, allowTaint: true, backgroundColor: "rgba(0,0,0,0)"})
                .then(function (canvas) {
                  let canvasImage = canvas.toDataURL("image/webp", 1)
                  let anchor = document.createElement('a')
                  anchor.setAttribute("href", canvasImage)
                  anchor.setAttribute("download", fileName + ".webp")
                  anchor.click()
                  anchor.remove()
                })
                this.switchDisplayElements(elem, '')
                return elem
            })
            .then( (elem) => {
                elem.style.width = ''
                elem.style.height = ''
                let canvases = elem.querySelectorAll("canvas")
                if (canvases.length) {
                      canvases.forEach( (canvas) => {
                      let ctx = canvas.getContext("2d");
                      ctx.clearRect(0, 0, canvas.width, canvas.height)
                  })
                }
            })
        }
      })
    },
    switchDisplayElements(elem, disp) {
      let imgsElements = elem.querySelectorAll("img")
      if ( imgsElements.length ) {
          imgsElements.forEach( (img) => {
              img.style.display = disp
        })
      }
    },
    plusElement() {
      let lastElem = this.dropTarget[this.dropTarget.length - 1]
      let newItemValue = lastElem.item + 1
      let newIndexValue = lastElem.index +1
      this.dropTarget.push({
        item: newItemValue,
        template: this.selectType,
        index: newIndexValue,
        selected: false,
        delete: false
      })
      this.$nextTick(function () {
          let addHtmlElement = document.querySelector('div[data-layout="'+newIndexValue+'"]')
          addHtmlElement.scrollIntoView()
      })
    },
    minusElement() {
        this.dropTarget.forEach((el) => {
            if (el.selected == true) {
                el.delete = true
            }
        })
        this.resultSelect = []
    },
    selectTemplate() {
      let selectTemp = this.dropTarget.find((el) => el.selected == true && el.delete == false)
      selectTemp.template = this.selectType
      selectTemp.selected = false
    },
    checkCheckbox(item) {
        this.resultSelect = []
        this.dropTarget.forEach((el) => {
            if (el.selected == true) {
              this.resultSelect.push(el)
            }
        })
    }
  }
}

</script>

<style>

</style>
