<template>
    <div id="outerWrapDropTarget">
        <div id="wrapDropTarget">
            <div id="leftDropTarget" @dragover.prevent="overLeftFile($event)" @dragleave.prevent="leaveLeftFile($event)" @drop="dropFile($event)">
                <div id="wrapLeftInput">
                    <input type="file" multiple accept="image/*" id="inputLeftDropTarget" @change="loadFile">
                </div>
                <div class="wrapLoadImg">
                    <img class="loadImageResult" id="loadedLeftResult" width='88%' height='88%' />
                </div>
                <div class="wrapCanvasLeft">
                    <canvas id="mainCanvasLeft"></canvas>
                </div>
            </div>
            <div id="rightDropTarget" @dragover.prevent="overRightFile($event)" @dragleave.prevent="leaveRightFile($event)" @drop="dropFile($event)">
                <div id="wrapRightInput">
                    <input type="file" multiple accept="image/*" id="inputRightDropTarget" @change="loadFile">
                </div>
                <div class="wrapLoadImg">
                    <img class="loadImageResult" id="loadedRightResult" width='88%' height='88%' />
                </div>
                <div class="wrapCanvas">
                    <canvas id="mainCanvasRight"></canvas>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import loadFile from '@/mixins/loadFile.js'

    export default {
        name: 'DropTargetComponentC2G2',
        methods: {
            loadFile(event) {
                var input = event.target
                var wrapInput = input.parentNode
                var imgWrapElement = wrapInput.nextElementSibling
                var imgLoaded = imgWrapElement.querySelector(".loadImageResult")
                imgLoaded.src = URL.createObjectURL(event.target.files[0])
                imgLoaded.onload = () => {
                    imgLoaded.removeAttribute('width')
                    imgLoaded.removeAttribute('height')
                    if (imgLoaded.naturalWidth > imgLoaded.naturalHeight) {
                        imgLoaded.style.removeProperty("height")
                        imgLoaded.style.width = 88 + '%'
                    }
                    else if (imgLoaded.naturalWidth < imgLoaded.naturalHeight) {
                        imgLoaded.style.removeProperty("width")
                        imgLoaded.style.height = 88 + '%'
                    }
                    else {
                        imgLoaded.style.removeProperty("height")
                        imgLoaded.style.width = 88 + '%'
                    }
                }
            },
            overLeftFile(event) {
                event.stopPropagation()
                if (!event.currentTarget.classList.contains('face_coin_magenta')) {
                    event.currentTarget.classList.add('face_coin_magenta')
                }
            },
            leaveLeftFile(event) {
                event.stopPropagation()
                event.currentTarget.classList.remove('face_coin_magenta');
            },
            overRightFile(event) {
                event.stopPropagation()
                if (!event.currentTarget.classList.contains('back_coin_blue')) {
                    event.currentTarget.classList.add('back_coin_blue')
                }
            },
            leaveRightFile(event) {
                event.stopPropagation()
                event.currentTarget.classList.remove('back_coin_blue');
            },
            dropFile(event) {
                event.stopPropagation()
                event.currentTarget.classList.remove('face_coin_magenta');
                event.currentTarget.classList.remove('back_coin_blue');
            }
        },
        mixins: [loadFile]
    }
</script>