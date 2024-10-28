export default {
    methods: {
        loadFile(event) {
            var input = event.target
            var wrapInput = input.parentNode
            var imgWrapElement = wrapInput.nextElementSibling
            var imgLoaded = imgWrapElement.querySelector(".loadImageResult")
            imgLoaded.src = URL.createObjectURL(event.target.files[0])
        },
    }
}