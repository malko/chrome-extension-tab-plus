//@ts-check
import { InputBoolean } from "./InputBoolean.js"
import { TMsg } from "./TMsg.js"
import { ColorSvg } from "./ColorSvg.js"

class BooleanSeettings extends HTMLElement {
	/**@type {InputBoolean} */
	#input
	#key
	#changeHandler
	constructor() {
		super()
		this.#key = this.getAttribute("key")
		const msgId = this.hasAttribute("msgId") ? this.getAttribute("msgId") : this.#key
		this.attachShadow({ mode: "open" })
		const beforeSvg = this.getAttribute("beforeSvg")
		const afterSvg = this.getAttribute("afterSvg")
		this.shadowRoot.innerHTML = `
			<style>
				:host, label {
					display: flex;
					width:100%;
					align-items: center;
					justify-content: space-between;
					gap: .2rem;
				}
				label{
					padding: .2rem;
					margin: .2rem;
				}
			</style>
			<label>
				<t-msg>${msgId}</t-msg>${
			!(beforeSvg || afterSvg)
				? `<input-boolean name="${this.#key}"></input-boolean>`
				: `<span>
						${beforeSvg ? `<color-svg name="${beforeSvg}"></color-svg>` : ""}
						<input-boolean name="${this.#key}"></input-boolean>
						${afterSvg ? `<color-svg name="${afterSvg}"></color-svg>` : ""}
					</span>`
		}
			</label>
		`
		this.#input = this.shadowRoot.querySelector("input-boolean")
		this.#restoreSetting()
		this.#changeHandler = async (e) => {
			chrome.storage.local.set({ [this.#key]: e.target.checked })
		}
	}
	async #restoreSetting() {
		const checked = (await chrome.storage.local.get(this.#key))[this.#key]
		this.#input.value = checked
	}
	connectedCallback() {
		this.#input.addEventListener("change", this.#changeHandler)
	}
	disconnectedCallback() {
		this.#input.removeEventListener("change", this.#changeHandler)
	}
	get value() {
		return this.#input.checked
	}
	set value(val) {
		this.#input.value = val
	}
	get checked() {
		return this.#input.checked
	}
	addEventListener(evtName, handler, options) {
		return this.#input.addEventListener(evtName, handler, options)
	}
	removeEventListener(evtName, handler, options) {
		return this.#input.removeEventListener(evtName, handler, options)
	}
}

customElements.define("boolean-settings", BooleanSeettings)
