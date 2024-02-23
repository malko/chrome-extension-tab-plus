//@ts-check
const entityEncoderDecoder = document.createElement("p")
const encode = (string) => {
	entityEncoderDecoder.innerText = string
	return entityEncoderDecoder.innerHTML
}
const decode = (string) => {
	entityEncoderDecoder.innerHTML = string
	return entityEncoderDecoder.innerText
}
export default {
	encode,
	decode,
}
