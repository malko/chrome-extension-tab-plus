//@ts-check
import htmlEntties from "../libs/htmlEntties.js"

export class WindowTab extends HTMLElement {
	constructor(/**@type{import("../libs/index.d.ts").TabData|chrome.tabs.Tab}*/ tab) {
		super()
		this.tabData = tab
		if (tab.groupId > 0) {
			this.dataset.groupId = "" + tab.groupId
		}
		this.attachShadow({ mode: "open" })
		const iconUrl = tab.favIconUrl
		if (tab.id) {
			this.id = `tab-${tab.id}`
			this.hasAttribute("tabindex") || this.setAttribute("tabindex", "0")
			tab.windowId && this.setAttribute("draggable", "true")
		}
		this.classList.toggle("active", tab.active)
		this.shadowRoot.innerHTML = /*html*/ `
			<style>
			:host{
				display: flex;
				padding: .4rem;
				margin: 0;
				position: relative;
				border-radius: var(--radius);
				border: solid var(--border-color) 1px;
				align-items: center;
				background-color: var(--tab-bg);
				color: var(--tab-fg);
				cursor: ${tab.windowId ? "pointer" : "default"};
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
			.window-tab-title {
				position: absolute;
				display: none;
				white-space: nowrap;
				color: inherit;
				border-radius: var(--radius);
				padding: .2rem;
				left: 0;
				top: calc(100% + .2rem);
				overflow: hidden;
				text-overflow: ellipsis;
				z-index: 2;
			}
			
			:host-context(.show-titles){
				width: 100%;
				flex-wrap: nowrap;
				gap:.2rem;
			}
			:host-context(.show-titles) .window-tab-title {
				position: static;
				display: inline;
			}
			</style>
			${
				iconUrl
					? `<img src="${iconUrl}" class="window-tab-icon" />`
					: `<color-svg name="earth" style="opacity:${iconUrl === null ? 0 : 0.7}"></color-svg>`
			}
			<span class="window-tab-title">${htmlEntties.encode(tab.title)}</span>
		`
		this.title = tab.title
		this._id = tab.id
		this._windowId = tab.windowId
	}

	connectedCallback() {
		if (!this._windowId) {
			return
		}
		this.setAttribute("draggable", "true")
		this.addEventListener("dragstart", this.#dragstartHandler)
		this.addEventListener("dragend", this.#dragendHandler)
		this.addEventListener("click", this.#clickHandler)
		this.addEventListener("mousedown", this.#middleClickHandler)
	}

	disconnectedCallback() {
		if (!this._windowId) {
			return
		}
		this.removeEventListener("dragstart", this.#dragstartHandler)
		this.removeEventListener("dragend", this.#dragendHandler)
		this.removeEventListener("click", this.#clickHandler)
		this.removeEventListener("mousedown", this.#middleClickHandler)
	}

	async #dragstartHandler(/**@type{DragEvent}*/ evt) {
		evt.dataTransfer.setData("text/plain", JSON.stringify({ tabId: this._id, windowId: this._windowId }))
		evt.dataTransfer.effectAllowed = "move"
		evt.dataTransfer.dropEffect = "move"
		// request animation frame to get the drop effect to work properly
		requestAnimationFrame(() => (this.style.display = "none"))
		this.parentElement.classList.add("dragging")
	}

	async #dragendHandler(/**@type{DragEvent}*/ evt) {
		this.style.display = "flex"
		this.parentElement.classList.remove("dragging")
	}

	async #clickHandler(/**@type{MouseEvent}*/ evt) {
		const { _id, _windowId } = this
		evt.preventDefault()
		switch (evt.button) {
			case 0: // left click select tab
				await chrome.runtime.sendMessage({ type: "switch-to-tab", id: _id, windowId: _windowId })
				return window.close()
		}
	}
	async #middleClickHandler(/**@type{MouseEvent}*/ evt) {
		if (evt.button !== 1) return
		const { _id } = this
		evt.preventDefault()
		return chrome.tabs.remove(_id)
	}
}
customElements.define("window-tab", WindowTab)
