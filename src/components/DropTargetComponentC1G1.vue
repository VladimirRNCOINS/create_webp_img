<template>
    <div id="outerWrapDropTarget">
        <div id="wrapDropTarget">
            <div id="leftDropTargetC1G1">
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
            <div id="centerDropTargetC1G1">
                <div id="wrapLeftInput">
                    <input type="file" multiple accept="image/*" id="inputCenterDropTarget" @change="loadFile">
                </div>
                <div class="wrapLoadImg">
                    <img class="loadImageResult" id="loadedLeftResult" />
                </div>
                <div class="wrapCanvasLeft">
                    <canvas id="mainCanvasLeft"></canvas>
                </div>
            </div>
            <div id="rightDropTargetC1G1">
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
        },
        mixins: [loadFile]
    }
</script>