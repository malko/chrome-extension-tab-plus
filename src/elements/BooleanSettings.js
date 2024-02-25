//@ts-check
import { InputBoolean } from "./InputBoolean.js"
import { TMsg } from "./TMsg.js"
import { ColorSvg } from "./ColorSvg.js"

export class BooleanSettings extends HTMLElement {
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
					display: inline-flex;
					align-items: center;
					justify-content: space-between;
					gap: .2rem;
					cursor: pointer;
				}
				:host-context(fieldset):host, :host-context(fieldset) label {
					width: 100%;
				}
				label{
					padding: .2rem;
					margin: .2rem;
				}
				label > span {
					display: inline-flex;
					flex-wrap: nowrap;
				}
				color-svg:first-child {
					opacity: 1;
				}
				color-svg:first-child:has(+input-boolean[aria-checked=true]) {
					opacity: .25;
				}
				input-boolean + color-svg {
					opacity: .25;
				}
				input-boolean[aria-checked=true] + color-svg {
					opacity: 1;
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
		if (this.hasAttribute("noLabel")) {
			const label = this.shadowRoot.querySelector("t-msg")
			//@ts-expect-error
			this.title = label.innerText
			label.remove()
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
	toggle() {
		return this.#input.toggle()
	}
	addEventListener(evtName, handler, options) {
		return this.#input.addEventListener(evtName, handler, options)
	}
	removeEventListener(evtName, handler, options) {
		return this.#input.removeEventListener(evtName, handler, options)
	}
}

customElements.define("boolean-settings", BooleanSettings)
