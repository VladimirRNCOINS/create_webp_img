export default {
    beforeUnmount() {
        this.cleanupLoadedImageUrls()
    },
    methods: {
        revokeObjectUrlForImage(imgElement) {
            if (!imgElement || !imgElement.dataset) {
                return
            }
            var activeObjectUrl = imgElement.dataset.objectUrl
            if (activeObjectUrl) {
                URL.revokeObjectURL(activeObjectUrl)
                delete imgElement.dataset.objectUrl
            }
        },
        cleanupLoadedImageUrls() {
            if (!this.$el) {
                return
            }
            var loadedImages = this.$el.querySelectorAll('.loadImageResult')
            if (loadedImages.length) {
                loadedImages.forEach((imgElement) => {
                    this.revokeObjectUrlForImage(imgElement)
                    imgElement.onload = null
                    imgElement.onerror = null
                })
            }
        },
        loadFile(event) {
            var input = event.target
            var file = input.files && input.files[0]
            if (!file) {
                return
            }
            var wrapInput = input.parentNode
            var imgWrapElement = wrapInput.nextElementSibling
            if (wrapInput.previousElementSibling) {
                wrapInput.previousElementSibling.remove()
            }
            var imgLoaded = imgWrapElement.querySelector(".loadImageResult")
            this.revokeObjectUrlForImage(imgLoaded)
            var imageObjectUrl = URL.createObjectURL(file)
            imgLoaded.dataset.objectUrl = imageObjectUrl
            var clearLoadHandlers = () => {
                imgLoaded.onload = null
                imgLoaded.onerror = null
            }
            imgLoaded.onload = () => {
                clearLoadHandlers()
                imgLoaded.removeAttribute('width')
                imgLoaded.removeAttribute('height')
                if ((wrapInput.parentNode.id == 'centerDropTargetC1G1') ||
                    (wrapInput.parentNode.id == 'rightDropTargetC1G1') ||
                    (imgLoaded.naturalWidth > imgLoaded.naturalHeight)) {
                    imgLoaded.style.removeProperty("height")
                    imgLoaded.style.width = 88 + '%'
                }
                else if (wrapInput.parentNode.id == 'centerDropTargetC3G3') {
                    imgLoaded.style.removeProperty("height")
                    imgLoaded.style.width = 42 + '%'
                    imgLoaded.style.position = 'absolute'
                    imgLoaded.style.top = 34 + 'px'
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
            imgLoaded.onerror = () => {
                clearLoadHandlers()
                this.revokeObjectUrlForImage(imgLoaded)
                imgLoaded.removeAttribute('src')
            }
            imgLoaded.src = imageObjectUrl
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
        overSlabFile(event) {
            event.stopPropagation()
            if (!event.currentTarget.classList.contains('slab_coin_green')) {
                event.currentTarget.classList.add('slab_coin_green')
            }
        },
        leaveSlabFile(event) {
            event.stopPropagation()
            event.currentTarget.classList.remove('slab_coin_green');
        },
        dropFile(event) {
            event.stopPropagation()
            event.currentTarget.classList.remove('face_coin_magenta');
            event.currentTarget.classList.remove('back_coin_blue');
            event.currentTarget.classList.remove('slab_coin_green');
        }
    }
}