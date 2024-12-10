export default {
    methods: {
        loadFile(event) {
            var input = event.target
            var wrapInput = input.parentNode
            var imgWrapElement = wrapInput.nextElementSibling
            if (wrapInput.previousElementSibling) {
                wrapInput.previousElementSibling.remove()
            }
            var imgLoaded = imgWrapElement.querySelector(".loadImageResult")
            imgLoaded.src = URL.createObjectURL(event.target.files[0])
            imgLoaded.onload = () => {
                imgLoaded.removeAttribute('width')
                imgLoaded.removeAttribute('height')
                if ((wrapInput.parentNode.id == 'centerDropTargetC1G1') ||
                    (wrapInput.parentNode.id == 'rightDropTargetC1G1') ||
                    (imgLoaded.naturalWidth > imgLoaded.naturalHeight)) {
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