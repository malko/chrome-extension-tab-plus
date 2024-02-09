//@ts-check
import htmlEntties from "../libs/htmlEntties.js"

export class WindowTab extends HTMLElement {
	constructor(/**@type{import("../libs/index.d.ts").TabData}*/ tab) {
		super()
		this.attachShadow({ mode: "open" })
		const iconUrl = tab.favIconUrl
		this.id = `tab-${tab.id}`
		this.classList.toggle("active", tab.active)
		this.shadowRoot.innerHTML = /*html*/ `
			<style>
			:host{
				display: flex;
				padding: .4rem;
				margin: 0;
				cursor: pointer;
				position: relative;
				border-radius: var(--radius);
				border: solid var(--border-color) 1px;
				align-items: center;
				background-color: var(--tab-bg);
				color: var(--tab-fg);
			}
			.window-tab-title {
				position: absolute;
				display: none;
				white-space: nowrap;
				background-color: inherit;
				color: inherit;
				border-radius: var(--radius);
				padding: .2rem;
				left: 0;
				top: calc(100% + .2rem);
				text-overflow: ellipsis;
				z-index: 2;
			}
			:host(:hover) .window-tab-title {
				display: inline-block;
			}
			${
				tab.windowId
					? /*css*/ `
			:host(:hover) {
				background-color: var(--tab-hover-bg);
				color: var(--tab-hover-fg);
			}
			:host(.active) {
				background-color: var(--tab-active-bg);
				color: var(--tab-active-fg);
			}`
					: ""
			}
			.window-tab-icon {
				display: inline-flex;
				width:1rem;
				height:1rem;
				margin: 0 0;
			}
			:host-context(.show-titles){
				width: 100%;
				flex-wrap: nowrap;
				gap:.2rem;
			}
			:host-context(.show-titles) .window-tab-title {
				overflow: hidden;
				text-overflow: ellipsis;
				position: static;
				display: inline;
			}
			</style>
			${
				iconUrl
					? `<img src="${iconUrl}" class="window-tab-icon" />`
					: `<color-svg name="earth" style="opacity:.7"></color-svg>`
			}
			<span class="window-tab-title">${htmlEntties.encode(tab.title)}</span>
		`
		this._id = tab.id
		this._windowId = tab.windowId
	}

	connectedCallback() {
		this._windowId && this.addEventListener("mousedown", this.#clickHandler)
	}

	disconnectedCallback() {
		this._windowId && this.removeEventListener("mousedown", this.#clickHandler)
	}

	async #clickHandler(/**@type{MouseEvent}*/ evt) {
		const { _id, _windowId } = this
		evt.preventDefault()
		switch (evt.button) {
			case 0: // left click select tab
				window.close()
				return Promise.all([
					chrome.tabs.update(_id, { active: true }),
					chrome.windows.update(_windowId, { focused: true }),
				])
			case 1: // middle click close selected tab
				return chrome.tabs.remove(_id)
		}
	}
}
customElements.define("window-tab", WindowTab)
