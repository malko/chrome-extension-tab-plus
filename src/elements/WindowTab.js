//@ts-check
import {
	getLastChild,
	getLastMatchingSibling,
	getNthNextMatchingSibling,
	getNthPrevMatchingSibling,
} from "../libs/getNthSibling.js"
import htmlEntties from "../libs/htmlEntties.js"
import { keyMap } from "../libs/keyMaps.js"
import { ColorSvg } from "./ColorSvg.js"

const nextTabHandler = async (evt) => {
	const tab = evt.target
	const next = tab.parentElement.querySelector(`window-tab#${tab.id} ~ window-tab:not(.hidden)`)
	if (next) return next.focus()
	const winEl = evt.target.parentElement
	const nextWindow = getNthNextMatchingSibling({
		elmt: winEl,
		selector: "window-window:has(window-tab:not(.hidden))",
	})
	if (nextWindow) {
		const firstTab = /**@type {HTMLElement}*/ (nextWindow.querySelector("window-tab:not(.hidden)"))
		if (firstTab) return firstTab.focus()
	}
	const firstWindow = winEl.parentElement.querySelector("window-window:has(window-tab:not(.hidden))")
	if (firstWindow) {
		const firstTab = firstWindow.querySelector("window-tab:not(.hidden)")
		if (firstTab) return firstTab.focus()
	}
}
const prevTabHandler = (evt) => {
	const tab = evt.target
	const prev = [...tab.parentElement.querySelectorAll(`window-tab:not(.hidden):has(~window-tab#${tab.id})`)].at(-1)
	if (prev) return prev.focus()
	const winEl = evt.target.parentElement
	const prevWindow = getNthPrevMatchingSibling({
		elmt: winEl,
		selector: "window-window:has(window-tab:not(.hidden))",
	})
	if (prevWindow) {
		const lastTab = getLastChild(prevWindow, "window-tab:not(.hidden)")
		if (lastTab) return lastTab.focus()
	}
	const lastWindow = getLastMatchingSibling({
		elmt: winEl,
		selector: "window-window:has(window-tab:not(.hidden))",
	})
	if (lastWindow) {
		const lastTab = getLastChild(lastWindow, "window-tab:not(.hidden)")
		if (lastTab) return lastTab.focus()
	}
}
const clickHandler = (evt) => {
	evt.target.click()
}
const keyDownHandler = keyMap(
	/**@type {Record<string, (evt: KeyboardEvent & {target:WindowTab})=>void>} */ ({
		ArrowUp: prevTabHandler,
		ArrowLeft: prevTabHandler,
		ArrowDown: nextTabHandler,
		ArrowRight: nextTabHandler,
		Enter: clickHandler,
		" ": clickHandler,
		Delete: (evt) => evt.target.close(),
		Escape: () => /**@type {HTMLElement}*/ (document.querySelector("[autofocus]"))?.focus(),
	}),
	{ preventDefault: true, stopPropagation: true }
)
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
			:host(.hidden){display:none;}
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
					? `<img src="${iconUrl}" class="window-tab-icon"/>`
					: `<color-svg name="earth" style="opacity:${iconUrl === null ? 0 : 1}"></color-svg>`
			}
			<span class="window-tab-title">${htmlEntties.encode(tab.title)}</span>
		`
		if (iconUrl) {
			const icon = this.shadowRoot.querySelector(".window-tab-icon")
			icon.addEventListener("error", () => {
				icon.replaceWith(new ColorSvg({ name: "earth", color: "#888" }))
			})
		}

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
		this.addEventListener("keydown", keyDownHandler)
	}

	disconnectedCallback() {
		if (!this._windowId) {
			return
		}
		this.removeEventListener("dragstart", this.#dragstartHandler)
		this.removeEventListener("dragend", this.#dragendHandler)
		this.removeEventListener("click", this.#clickHandler)
		this.removeEventListener("mousedown", this.#middleClickHandler)
		this.removeEventListener("keydown", keyDownHandler)
	}

	async close() {
		let nextFocusTab = null
		if (document.activeElement === this) {
			nextFocusTab =
				getNthNextMatchingSibling({ elmt: this, selector: "window-tab:not(.hidden)" }) ||
				getNthPrevMatchingSibling({ elmt: this, selector: "window-tab:not(.hidden)" })
		}
		return this._id && chrome.tabs.remove(this._id).then(() => nextFocusTab?.focus())
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
		switch (evt.button) {
			case 0: // left click select tab
				await chrome.runtime.sendMessage({ type: "switch-to-tab", id: _id, windowId: _windowId })
				return window.close()
		}
	}
	async #middleClickHandler(/**@type{MouseEvent}*/ evt) {
		if (evt.button !== 1) return
		return this.close()
	}
}
customElements.define("window-tab", WindowTab)
