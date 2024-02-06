//@ts-check
import { SVGs } from "../assets/svgs.js"
import { saveWindow, deleteWindow } from "../libs/db.js"
import htmlEntties from "../libs/htmlEntties.js"
import { WindowTab } from "./WindowTab.js"

const getSessionTabId = async () => chrome.runtime.sendMessage("get-session-tab-id")
const prevDflt = (handler) => (/**@type{MouseEvent}*/ evt) => {
	evt.preventDefault()
	evt.stopPropagation()
	handler(evt)
}
const quitHandler = (handler) => prevDflt((/**@type{Event}*/ evt) => handler(evt) !== false && window.close())

const setWindowState = async (/**@type{number|{id:number}}*/ windowOrWindowId, state) => {
	const window = await chrome.windows.get(typeof windowOrWindowId === "number" ? windowOrWindowId : windowOrWindowId.id)
	const { id } = window
	const winEl = document.querySelector(`#window-${id}`)
	winEl.classList.toggle("minimized", state === "minimized")
	winEl.classList.toggle("maximized", state === "maximized")
	winEl.classList.toggle("normal", state === "normal")
}

const grabFocus = async () => {
	const sessionTabId = await getSessionTabId()
	chrome.tabs
		.get(sessionTabId)
		.then((tab) => chrome.windows.update(tab.windowId, { focused: true }))
		.catch(console.error)
}

const tabMapper = (/**@type{chrome.tabs.Tab}*/ tab) => {
	const {
		active,
		audible,
		autoDiscardable,
		discarded,
		favIconUrl,
		groupId,
		highlighted,
		id,
		incognito,
		index,
		mutedInfo,
		pinned,
		status,
		title,
		url,
		pendingUrl,
	} = tab
	return {
		active,
		audible,
		autoDiscardable,
		discarded,
		favIconUrl,
		groupId,
		highlighted,
		id,
		incognito,
		index,
		mutedInfo,
		pinned,
		title,
		url: status !== "complete" && pendingUrl ? pendingUrl : url,
	}
}
export class WindowWindow extends HTMLElement {
	#winCloseHandler
	#winMaximizeHandler
	#winMinimizeHandler
	#winNewTabHandler
	#winFocusHandler
	#winSaveHandler
	static actionButtons = `
	<button title="Save window" class="window-save"><img src="./assets/save.svg"></button>
	<button title="Open a new tab" class="window-new-tab"><img src="./assets/tab-new.svg"></button>
	<button title="Toggle minimized state" class="window-minimize"><img src="./assets/minimize.svg"></button>
	<button title="Toggle maximized state" class="window-maximize"><img src="./assets/maximize.svg"></button>
	<button title="Close the window" class="window-close"><img src="./assets/x.svg"></button>`
	constructor(/**@type{import("../libs/index.js").WindowStoredData}}*/ windowData) {
		super()
		this._id = windowData.id
		this.id = "window-" + windowData.id
		this.className = `window ${windowData.state} ${windowData.incognito ? "incognito" : ""}`
		this.attachShadow({ mode: "open" })
		this.shadowRoot.innerHTML = /*html*/ `
			<style>
				:host, * {box-sizing: border-box;}
				:host{
					display: flex;
					flex-direction: column;
					position: relative;
					flex-basis: content;
					flex-grow: 0;
					flex-shrink: 1;
					border: solid var(--border-color) 1px;
					border-radius: var(--radius);
					padding: .5rem;
					margin:.4rem;
					max-width: 350px;
					flex-wrap: wrap;
					justify-content: flex-start;
					align-items: flex-start;
					align-self: flex-start;
					gap: .5rem;
				}
				:host(.incognito) {
					border-color: #f00;
				}
				.window-title {
					display: flex;
					flex-wrap: nowrap;
					width: 100%;
					height: 1.5rem;
					padding: .2rem .4rem;
					justify-content: center;
					align-items: center;
					margin: 0 0 .5rem 0;
					background-color: var(--title-bg);
					color: var(--title-fg);
					border-radius: calc(var(--radius) / 2);
				}
				.window-title > span {
					display: inline-flex;
					gap: .2rem;
					--stroke: var(--title-fg);
					flex-wrap: nowrap;
					align-items: center;
				}
				.window-tabs {
					display: flex;
					flex-wrap: wrap;
					gap: .2rem;
					justify-content: flex-start;
					align-items: flex-start;
					width: 100%;
				}
				.window-actions {
					margin-left: auto;
					padding-left: .5rem;
				}
				.window-actions button {
					--size: 1.1rem;
					width: var(--size);
					height: var(--size);
					border:none;
					border-radius: 50%;
					padding: .1rem;
					background-color: #ccc8;
				}
				:host .window-actions button:hover{
					opacity: 1;
					background-color: #ffff;
				}
				.window-actions button > img {
					width: 100%;
					height: 100%;
				}
				:host(.maximized) .window-maximize,
				:host(.minimized) .window-minimize {
					opacity: .5;
				}
			</style>
			<div class="window-title">
				<span>
					${windowData.incognito ? SVGs.incognito : ""}
					${windowData.tabs.length} tabs
				</span>
				<span class="window-actions">
					${
						//@ts-expect-error
						this.constructor?.actionButtons
					}
				</span>
			</div>
			<div class="window-tabs"></div>
		`
		this.tabsContainer = this.shadowRoot.querySelector(".window-tabs")
		windowData.tabs.forEach((tab) => {
			this.tabsContainer.appendChild(new WindowTab(tab))
		})

		const winToggleStateHandler = (stateName) =>
			prevDflt(async (/**@type{MouseEvent}*/ evt) => {
				const win = await chrome.windows.get(this._id)
				const state = win.state !== stateName ? stateName : "normal"
				await chrome.windows
					.update(this._id, { state })
					.then(() => setWindowState(this._id, state))
					.then(grabFocus)
					.catch(console.error)
			})

		this.#winCloseHandler = prevDflt((/**@type{MouseEvent}*/ evt) => {
			chrome.windows.remove(this._id)
		})
		this.#winMaximizeHandler = winToggleStateHandler("maximized")
		this.#winMinimizeHandler = winToggleStateHandler("minimized")
		this.#winNewTabHandler = quitHandler(() => {
			chrome.tabs.create({ windowId: this._id }).catch(console.error)
		})
		this.#winFocusHandler = quitHandler(() => {
			chrome.windows.update(this._id, { focused: true }).catch(console.error)
		})
		this.#winSaveHandler = prevDflt(async (evt) => {
			const win = await chrome.windows.get(this._id, { populate: true })
			const sessionTabId = await getSessionTabId()
			win.tabs = win.tabs.filter((tab) => tab.id !== sessionTabId)
			saveWindow(win).then(() => {
				window.dispatchEvent(new Event("tab+session-window-saved"))
			})
		})
	}

	connectedCallback() {
		this.shadowRoot.querySelector(".window-close").addEventListener("click", this.#winCloseHandler)
		this.shadowRoot.querySelector(".window-minimize").addEventListener("click", this.#winMinimizeHandler)
		this.shadowRoot.querySelector(".window-maximize").addEventListener("click", this.#winMaximizeHandler)
		this.shadowRoot.querySelector(".window-new-tab").addEventListener("click", this.#winNewTabHandler)
		this.shadowRoot.querySelector(".window-title").addEventListener("click", this.#winFocusHandler)
		this.shadowRoot.querySelector(".window-save").addEventListener("click", this.#winSaveHandler)
	}

	disconnectedCallback() {
		this.shadowRoot.querySelector(".window-close").removeEventListener("click", this.#winCloseHandler)
		this.shadowRoot.querySelector(".window-minimize").removeEventListener("click", this.#winMinimizeHandler)
		this.shadowRoot.querySelector(".window-maximize").removeEventListener("click", this.#winMaximizeHandler)
		this.shadowRoot.querySelector(".window-new-tab").removeEventListener("click", this.#winNewTabHandler)
		this.shadowRoot.querySelector(".window-title").removeEventListener("click", this.#winFocusHandler)
		this.shadowRoot.querySelector(".window-save").removeEventListener("click", this.#winSaveHandler)
	}
}

export class WindowSessionWindow extends WindowWindow {
	static actionButtons = /*html*/ `
		<button title="restore window" class="window-restore"><img src="./assets/restore.svg"></button>
		<button title="delete window" class="window-delete"><img src="./assets/delete.svg"></button>
	`
	#winData
	#restoreHandler
	#deleteHandler
	constructor(/**@type{import("../libs/index.js").WindowStoredData}*/ windowData) {
		super(windowData)
		this.#winData = windowData
		this.#restoreHandler = quitHandler(() => {
			const { id, tabs, state, top, left, height, width, ...rest } = this.#winData
			/** @type{import("../libs/index.js").WindowCreateData} */
			let createData = { ...rest, state }
			if (state === "normal") {
				createData = { ...createData, state, top, left, height, width }
			}
			chrome.windows.create({
				...createData,
				url: windowData.tabs.map((tab) => tab.url),
			})
		})
		this.#deleteHandler = prevDflt(() => {
			deleteWindow(this.#winData.id).then(() => {
				window.dispatchEvent(new Event("tab+session-window-deleted"))
			})
		})
	}
	connectedCallback() {
		this.shadowRoot.querySelector(".window-restore").addEventListener("click", this.#restoreHandler)
		this.shadowRoot.querySelector(".window-delete").addEventListener("click", this.#deleteHandler)
	}
	disconnectedCallback() {
		this.shadowRoot.querySelector(".window-restore").removeEventListener("click", this.#restoreHandler)
		this.shadowRoot.querySelector(".window-delete").removeEventListener("click", this.#deleteHandler)
	}
}

customElements.define("window-window", WindowWindow)
customElements.define("window-session-window", WindowSessionWindow)
