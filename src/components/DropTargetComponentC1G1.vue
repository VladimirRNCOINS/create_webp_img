<template>
    <div id="outerWrapDropTarget">
        <div id="wrapDropTarget">
            <div id="leftDropTargetC1G1" @dragover.prevent="overSlabFile($event)" @dragleave.prevent="leaveSlabFile($event)" @drop="dropFile($event)">
                <div class="side_sign">
                    <span>L</span>
                </div>
                <div id="wrapLeftInput">
                    <input type="file" multiple accept="image/*" id="inputLeftDropTarget" @change="loadFile">
                </div>
                <div class="wrapLoadImg">
                    <img class="loadImageResult" id="loadedLeftResult" style="margin-left: 20px;" width='88%' height='88%' />
                </div>
                <div class="wrapCanvasLeft">
                    <canvas id="mainCanvasLeft"></canvas>
                </div>
            </div>
            <div id="centerDropTargetC1G1" @dragover.prevent="overLeftFile($event)" @dragleave.prevent="leaveLeftFile($event)" @drop="dropFile($event)">
                <div class="side_sign">
                    <span>C</span>
                </div>
                <div id="wrapLeftInput">
                    <input type="file" multiple accept="image/*" id="inputCenterDropTarget" @change="loadFile">
                </div>
                <div class="wrapLoadImg">
                    <img class="loadImageResult" id="loadedCenterResult" width='88%' height='88%' />
                </div>
                <div class="wrapCanvasCenter">
                    <canvas id="mainCanvasCenter"></canvas>
                </div>
            </div>
            <div id="rightDropTargetC1G1" @dragover.prevent="overRightFile($event)" @dragleave.prevent="leaveRightFile($event)" @drop="dropFile($event)">
                <div class="side_sign">
                    <span>R</span>
                </div>
                <div id="wrapRightInput">
                    <input type="file" multiple accept="image/*" id="inputRightDropTarget" @change="loadFile">
                </div>
                <div class="wrapLoadImg">
                    <img class="loadImageResult" id="loadedRightResult" style="padding-left: 15px; margin-right: 30px;" width='88%' height='88%' />
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
        },
        mixins: [loadFile]
    }
</script>