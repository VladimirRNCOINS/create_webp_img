export default {
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
    }
}