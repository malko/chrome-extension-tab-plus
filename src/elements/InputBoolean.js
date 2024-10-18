const dispatchCustomEvent = (emitter, type, detail, options) => {
	options = { cancelable: false, bubbles: true, composed: true, ...(options || {}) }
	const evt = new CustomEvent(type, { ...options, detail: detail })
	emitter.dispatchEvent(evt)
	return evt
}

export class InputBoolean extends HTMLElement {
	static formAssociated = true
	static observedAttributes = ["aria-checked", "disabled"]

	constructor() {
		super()
		this._label = null
		this._internals = this.attachInternals()
		this._internals.setFormValue(false)
		this.attachShadow({ mode: "open" })
		this.shadowRoot.innerHTML = /*html*/ `<style>
			:host {
				--bg: var(--input-boolean-bg, #555);
				--color: var(--input-boolean-color, currentColor);
				--color-on: var(--input-boolean-color-on, var(--color));
				--height: var(--input-boolean-height, 1rem);
				cursor: pointer;
				display:inline-flex;
				align-self:center;
			}
			:host([disabled]){
				opacity: 0.6;
				cursor: not-allowed;
			}
			span {display: inline-block;}
			.indicator {
				border-radius: calc(var(--height) / 2);
				width: calc(var(--height) * 2);
				height: var(--height);
				position: relative;
				background-color: var(--bg);
				opacity: .8;
				transition: opacity 150ms ease-in-out;
			}
			.indicator > span {
				height: var(--height);
				width: var(--height);
				position: absolute;
				border-radius: 50%;
				background-color: var(--color);
				left: 0;
				transition: all 150ms ease-in-out;
			}
			.indicator[aria-checked=true] {
				opacity: 1;
			}
			.indicator[aria-checked=true] > span {
				left: calc(100% -  var(--height));
				background-color: var(--color-on);
			}

		</style>
			<span class="indicator" role="switch" tabIndex="0"><span></span></span>
		`
		this._parentClickHandler = (evt) => {
			evt.target !== this && this.toggle()
		}
		this.indicator = this.shadowRoot.querySelector("span")
		this.indicator.addEventListener("click", () => this.toggle())
		this.indicator.addEventListener("keydown", (evt) => {
			if (evt.key === "Enter" || evt.key === " ") {
				this.toggle()
				evt.preventDefault()
				evt.stopPropagation()
			}
		})
	}
	get form() {
		return this._internals.form
	}
	get name() {
		return this.getAttribute("name")
	}
	get type() {
		return this.localName
	}
	get value() {
		return this.checked
	}
	set value(val) {
		this.setAttribute("aria-checked", val === true || val === "true")
	}
	get checked() {
		return this.getAttribute("aria-checked") === "true"
	}

	toggle() {
		if (this.hasAttribute("disabled") && this.getAttribute("disabled") !== "false") return
		const evt = dispatchCustomEvent(this, "toggle", { checked: !this.checked }, { cancelable: true })
		if (evt.defaultPrevented) return
		this.setAttribute("aria-checked", !this.checked)
		dispatchCustomEvent(this, "toggled")
		this.dispatchEvent(new Event("change"))
	}

	connectedCallback() {
		const parent = this.parentElement
		this._label = parent.tagName === "LABEL" || parent.tagName === "SETTING-LABEL" ? parent : parent.closest("label")
		this._label?.addEventListener("click", this._parentClickHandler)
	}

	disconnectedCallback() {
		this._label?.removeEventListener("click", this._parentClickHandler)
		this._label = null
	}

	attributeChangedCallback(name, oldValue, newValue) {
		if (name === "aria-checked") {
			this.indicator.setAttribute("aria-checked", newValue)
			this._internals.setFormValue(newValue)
		} else if (name === "disabled") {
			if (newValue !== null && newValue !== "") {
				newValue === "false" ? this.removeAttribute(name) : this.setAttribute(name, "")
			}
		}
	}
}

customElements.define("input-boolean", InputBoolean)
