import htmlEntities from "../libs/htmlEntties.js"

export class TMsg extends HTMLElement {
	constructor() {
		super()
		const msgId = this.getAttribute("msgid") || this.innerHTML
		const params = this.getAttribute("params")?.split(",") || []
		if (msgId) {
			this.innerHTML = htmlEntities.encode(
				chrome.i18n.getMessage(
					msgId,
					params.map((p) => p.trim())
				) || msgId
			)
		}
	}
}
customElements.define("t-msg", TMsg)
