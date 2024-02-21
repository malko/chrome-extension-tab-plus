//@ts-check
import { SVGs } from "../assets/svgs.js"
import { saveWindow, deleteWindow, windowToStoredWindow } from "../libs/db.js"
import htmlEntties from "../libs/htmlEntties.js"
import { WindowTab } from "./WindowTab.js"

const actionsTitles = {
	save: chrome.i18n.getMessage("windowActionSave"),
	delete: chrome.i18n.getMessage("windowActionDeleteSavedWindow"),
	newTab: chrome.i18n.getMessage("windowActionNewTab"),
	restore: chrome.i18n.getMessage("windowActionRestore"),
	minimize: chrome.i18n.getMessage("windowActionToggleMinimize"),
	maximize: chrome.i18n.getMessage("windowActionToggleMaximize"),
	close: chrome.i18n.getMessage("windowActionClose"),
}
const getSessionTabId = async () => (await chrome.runtime.sendMessage({ type: "get-session-tab-ids" }))?.sessionTabId
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
const groupColors = {
	grey: "#dadce0",
	blue: "#92b3f7",
	red: "#e79184",
	yellow: "#f8d767",
	green: "#8dc795",
	pink: "#f492cc",
	purple: "#c08df8",
	cyan: "#8bd6eb",
	orange: "#f3b173",
}
export class WindowWindow extends HTMLElement {
	#winCloseHandler
	#winMaximizeHandler
	#winMinimizeHandler
	#winNewTabHandler
	#winFocusHandler
	#winSaveHandler
	static actionButtons = /* html */ `
	<button title="${actionsTitles.save}" class="window-save"><color-svg name="save"></color-svg></button>
	<button title="${actionsTitles.newTab}" class="window-new-tab"><color-svg name="tabNew"></color-svg></button>
	<button title="${actionsTitles.minimize}" class="window-minimize"><color-svg name="minimize"></color-svg></button>
	<button title="${actionsTitles.maximize}" class="window-maximize"><color-svg name="maximize"></color-svg></button>
	<button title="${actionsTitles.close}" class="window-close"><color-svg name="x"></color-svg></button>`
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
					border-radius: calc(var(--radius) * 2);
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
				:host(.focused) {
					border-color: orange;
					box-shadow: none;
					box-shadow: 2px 2px 3px #000;
				}
				:host-context(#windowsSaved):host(:not(:hover)){
						opacity:.6;
						border-style: dashed;
						box-shadow: none;
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
					border-radius: var(--radius);
				}
				:host(window-window) {
					cursor: pointer;
				}
				.window-title > span {
					display: inline-flex;
					gap: .2rem;
					--svg-color: var(--title-fg);
					flex-wrap: nowrap;
					align-items: center;
					white-space: nowrap;
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
					--size:20px;
					display:inline-flex;
					box-sizing: border-box;
					justify-content: center;
					align-items: center;
					width: var(--size);
					height: var(--size);
					border:none;
					border-radius: 50%;
					background-color: #fff8;
					padding:0;
				}
				:host .window-actions button:hover{
					opacity: 1;
					background-color: #ffff;
				}
				:host(.maximized) .window-maximize,
				:host(.minimized) .window-minimize {
					opacity: .5;
				}
				window-tab[data-group-title]::before{
					position: absolute;
					display: block;
					top: calc(-1rem - 2px);
					left: -2px;
					border-radius: inherit;
					color: #000;
					content: attr(data-group-title);
					padding: .1rem;
					font-size: .8rem;
					background-color: var(--group-color, inherit);
				}
				:host-context(.show-titles) window-tab[data-group-title]{
					margin-top:1rem;
				}
			</style>
			<div class="window-title">
				<span>
					${windowData.incognito ? '<color-svg name="incognito"></color-svg>' : ""}
					${windowData.name ? `<span>${windowData?.name} - </span>` : ""}
					<t-msg msgId="tabCount${windowData.tabs.length > 1 ? "Plural" : ""}" params="${windowData.tabs.length}" ></t-msg>
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
		const groupTabs = {}
		windowData.tabs.forEach((tab) => {
			const tabElmt = new WindowTab(tab)
			if (tab.groupId > 0) {
				tabElmt.dataset.groupId = "" + tab.groupId
				;(groupTabs[tab.groupId] = groupTabs[tab.groupId] || []).push(tabElmt)
			}
			this.tabsContainer.appendChild(tabElmt)
		})

		// display groups info
		;(async () => {
			if (Object.keys(groupTabs).length > 0) {
				let groupsData = []
				// get groups info from windowData or from chrome.tabGroups
				if (windowData.groups) {
					groupsData = windowData.groups
				} else {
					groupsData = (await chrome.tabGroups.query({ windowId: windowData.id })).map((group) => {
						const { color, title, id } = group
						return { color: groupColors[color] || color, title, id }
					})
				}
				//@ts-expect-error
				groupsData.forEach(({ id, color, title }) => {
					groupTabs[id].forEach((tabElmt, index) => {
						if (index === 0) {
							title && (tabElmt.dataset.groupTitle = title)
							tabElmt.style.setProperty("--group-color", color)
						}
						tabElmt.style.boxShadow = `0 0 0 2px ${color}`
						tabElmt.title = title
					})
				})
			}
		})()

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
				window.dispatchEvent(new CustomEvent("tab+session-window-saved"))
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
		<button title="${actionsTitles.restore}" class="window-restore"><color-svg name="restore"></color-svg></button>
		<button title="${actionsTitles.delete}" class="window-delete"><color-svg name="delete"></color-svg></button>
	`
	#winData
	#restoreHandler
	#deleteHandler
	constructor(/**@type{import("../libs/index.js").WindowStoredData}*/ windowData) {
		super(windowData)
		this.#winData = windowData
		this.#restoreHandler = prevDflt(async () => {
			const settings = await chrome.storage.local.get(["restore-discarded"])
			const restoreActive = !settings["restore-discarded"]
			const { id, tabs, groups, state, top, left, height, width, ...rest } = this.#winData
			const groupTabs = {}
			/** @type{import("../libs/index.js").WindowCreateData} */
			let createData = { ...rest, state }
			if (state === "normal") {
				createData = { ...createData, state, top, left, height, width }
			}
			chrome.windows
				.create({
					...createData,
				})
				.then(async (windowInstance) => {
					const windowId = windowInstance.id
					const tabIdToRemove = windowInstance.tabs[0]?.id
					await Promise.all(
						tabs.map(async (tabData) => {
							const { active, index, pinned, url, groupId } = tabData
							const { id: tabId } = await chrome.tabs.create({
								windowId,
								active,
								index,
								pinned,
								url: active || restoreActive ? url : "./discarded.html#" + url,
							})
							if (tabData.groupId > 0) {
								groupTabs[groupId] = groupTabs[groupId] || []
								groupTabs[groupId].push(tabId)
							}
							return
						})
					)
					groups.forEach(async ({ id, collapsed, color, title }) => {
						const groupId = await chrome.tabs.group({ createProperties: { windowId }, tabIds: groupTabs[id] })
						chrome.tabGroups.update(groupId, { collapsed, color, title })
					})
					// remove the empty new tab
					tabIdToRemove && chrome.tabs.remove(tabIdToRemove)
				})
		})
		this.#deleteHandler = prevDflt(() => {
			deleteWindow(this.#winData.id).then(() => {
				window.dispatchEvent(new CustomEvent("tab+session-window-deleted", { detail: { windowId: this.#winData.id } }))
				this.remove()
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
