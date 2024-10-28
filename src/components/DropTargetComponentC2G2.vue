<template>
    <div id="outerWrapDropTarget">
        <div id="wrapDropTarget">
            <div id="leftDropTarget" @dragover.prevent="overLeftFile($event)" @dragleave.prevent="leaveLeftFile($event)" @drop="dropFile($event)">
                <div id="wrapLeftInput">
                    <input type="file" multiple accept="image/*" id="inputLeftDropTarget" @change="loadFile">
                </div>
                <div class="wrapLoadImg">
                    <img class="loadImageResult" id="loadedLeftResult" />
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
                    <img class="loadImageResult" id="loadedRightResult" />
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