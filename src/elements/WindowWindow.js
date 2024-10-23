//@ts-check
import { SVGs } from "../assets/svgs.js"
import { saveWindow, deleteWindow, updateSavedWindow } from "../libs/db.js"
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
const quitHandler = (handler) =>
	prevDflt((/**@type{Event}*/ evt) => {
		if (handler(evt) === false) return
		//@ts-expect-error
		if (!evt.ctrlKey) {
			window.close()
		} else {
			grabFocus()
		}
	})

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
	#dragenterHandler
	#dragoverHandler
	#dragleaveHandler
	#dropHandler
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
					background-color: var(--bg);
					padding: .5rem;
					margin:.4rem;
					max-width: 350px;
					min-width: 250px;
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
					height: 2rem;
					padding: .2rem .4rem;
					justify-content: center;
					align-items: center;
					margin: 0;
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
				.window-title > span:first-child {
					overflow: hidden;
				}

				.window-name {
					display: inline;
					padding:.2em;
					overflow: hidden;
					text-overflow: ellipsis;
					white-space: nowrap;
					&:focus {
						overflow: visible;
					}
				}
				.window-name:empty:not(:focus) {
					display: none;
				}
				.window-name:empty + .winwow-name-separator {
					display: none;
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
					--size:24px;
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
					cursor: pointer;
				}
				:host .window-actions button:hover{
					opacity: 1;
					background-color: #ffff;
				}
				:host .window-actions button:hover color-svg{
					transform: scale(1.33);
				}
				:host(.maximized) .window-maximize,
				:host(.minimized) .window-minimize {
					opacity: .5;
				}
				::slotted(window-tab[data-group-title]:hover)::before{
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
					text-overflow: ellipsis;
					white-space: nowrap;
					overflow: hidden;
				}
			</style>
			<div class="window-title">
				<span>
					${windowData.incognito ? '<color-svg name="incognito"></color-svg>' : ""}
					<span class="window-name">${windowData?.name || ''}</span>
					<span class="winwow-name-separator"> - </span>
					<t-msg msgId="tabCount${windowData.tabs.length > 1 ? "Plural" : ""}" params="${windowData.tabs.length}" ></t-msg>
				</span>
				<span class="window-actions">
					${
			//@ts-expect-error
			this.constructor?.actionButtons
			}
				</span>
			</div>
			<div class="window-tabs" id="window-tabs-container-${this._id}"><slot></slot></div>
		`
		const groupTabs = {}
		windowData.tabs.forEach((tab) => {
			const tabElmt = this.appendTab(tab)
			if (tab.groupId > 0) {
				; (groupTabs[tab.groupId] = groupTabs[tab.groupId] || []).push(tabElmt)
			}
		})

			// display groups info
			; (async () => {
				if (Object.keys(groupTabs).length > 0) {
					let groupsData = []
					// get groups info from windowData or from chrome.tabGroups
					if (windowData.groups) {
						groupsData = windowData.groups
					} else {
						groupsData = (await chrome.tabGroups.query({ windowId: windowData.id })).map((group) => {
							const { color, title, id } = group
							return { color: color, title, id }
						})
					}
					//@ts-expect-error
					groupsData.forEach(({ id, color, title }) => {
						color in groupColors && (color = groupColors[color])
						groupTabs[id].forEach((tabElmt, index) => {
							if (index === 0) {
								title && (tabElmt.dataset.groupTitle = title)
								tabElmt.style.setProperty("--group-color", color)
							}
							tabElmt.style.boxShadow = `0 0 0 2px ${color}`
						})
					})
				}
			})()

		//#region window actions handlers
		if (this.tagName === "WINDOW-WINDOW") {
			const winToggleStateHandler = (stateName) => async () => {
				const win = await chrome.windows.get(this._id)
				const state = win.state !== stateName ? stateName : "normal"
				await chrome.windows
					.update(this._id, { state })
					.then(() => setWindowState(this._id, state))
					.then(grabFocus)
					.catch(console.error)
			}
			this.close = () => chrome.windows.remove(this._id)
			this.toggleMaximize = winToggleStateHandler("maximized")
			this.toggleMinimize = winToggleStateHandler("minimized")
			this.createNewTab = () => chrome.tabs.create({ windowId: this._id }).catch(console.error)

			this.#winCloseHandler = prevDflt((/**@type{MouseEvent}*/ evt) => this.close())
			this.#winMaximizeHandler = prevDflt(this.toggleMaximize)
			this.#winMinimizeHandler = prevDflt(this.toggleMinimize)
			this.#winNewTabHandler = quitHandler(this.createNewTab)
			this.#winFocusHandler = quitHandler(() => {
				chrome.windows.update(this._id, { focused: true }).catch(console.error)
			})
			this.#winSaveHandler = prevDflt(async (evt) => {
				const win = await chrome.windows.get(this._id, { populate: true })
				const sessionTabId = await getSessionTabId()
				win.tabs = win.tabs.filter((tab) => tab.id !== sessionTabId)
				saveWindow(win).then(() => {
					window.dispatchEvent(new CustomEvent("tab+session-window-saved"))
					evt.ctrlKey && this.close()
				})
			})
			//#endregion window actions handlers

			//#region drag and drop handlers
			/**@type {HTMLElement} */
			let dragPlaceholder
			const delegatedTabHandler = (handler) => (evt) => {
				evt.target.tagName === "WINDOW-TAB" && handler(evt)
			}
			const insertDragPlaceholder = delegatedTabHandler(({ target, clientX, clientY }) => {
				if (target === dragPlaceholder) return
				if (!dragPlaceholder) {
					dragPlaceholder = new WindowTab({ index: 0, title: "", favIconUrl: null })
					dragPlaceholder.style.backgroundColor = "rgba(200,200	,0,.5)"
				}
				const isVerticalMove = this.matches(`.show-titles ${this.tagName}`)
				const rect = target.getBoundingClientRect()
				let isOverEnd
				if (isVerticalMove) {
					isOverEnd = clientY > rect.y + rect.height / 2
				} else {
					isOverEnd = clientX > rect.x + rect.width / 2
				}
				if (isOverEnd) {
					if (target.nextElementSibling) {
						this.insertBefore(dragPlaceholder, target.nextElementSibling)
					} else {
						this.appendChild(dragPlaceholder)
					}
				} else {
					this.insertBefore(dragPlaceholder, target)
				}
			})
			const removeDragPlaceholder = () => {
				dragPlaceholder?.remove()
				dragPlaceholder = null
			}
			this.#dragenterHandler = prevDflt(insertDragPlaceholder)
			this.#dragoverHandler = prevDflt(insertDragPlaceholder)
			this.#dragleaveHandler = prevDflt((/**@type{DragEvent}*/ evt) => {
				//@ts-expect-error
				this.contains(evt.relatedTarget) || removeDragPlaceholder()
			})
			this.#dropHandler = prevDflt((/**@type{DragEvent}*/ evt) => {
				if (!dragPlaceholder) return
				const { tabId, windowId } = JSON.parse(evt.dataTransfer.getData("text/plain"))
				const index = Array.from(dragPlaceholder.parentElement.children)
					.filter((el) => el.id !== `tab-${tabId}`)
					.indexOf(dragPlaceholder)
				removeDragPlaceholder()
				return chrome.tabs.move(tabId, { windowId: this._id, index })
			})
			//#endregion drag and drop handlers
		}
	}

	calculateGridRowEnd() {
		const grid = this.parentElement
		const gridStyle = window.getComputedStyle(grid)
		const rowHeight = parseInt(gridStyle.getPropertyValue("grid-auto-rows"))
		const rowGap = parseInt(gridStyle.getPropertyValue("grid-row-gap"))
		this.style.gridRowEnd = "span " + Math.ceil((this.getBoundingClientRect().height + rowGap) / (rowHeight + rowGap))
	}

	connectedCallback() {
		this.shadowRoot.querySelector(".window-close").addEventListener("click", this.#winCloseHandler)
		this.shadowRoot.querySelector(".window-minimize").addEventListener("click", this.#winMinimizeHandler)
		this.shadowRoot.querySelector(".window-maximize").addEventListener("click", this.#winMaximizeHandler)
		this.shadowRoot.querySelector(".window-new-tab").addEventListener("click", this.#winNewTabHandler)
		this.shadowRoot.querySelector(".window-title").addEventListener("click", this.#winFocusHandler)
		this.shadowRoot.querySelector(".window-save").addEventListener("click", this.#winSaveHandler)
		this.addEventListener("dragenter", this.#dragenterHandler)
		this.addEventListener("dragover", this.#dragoverHandler)
		this.addEventListener("dragleave", this.#dragleaveHandler)
		this.addEventListener("drop", this.#dropHandler)
		this.calculateGridRowEnd()
	}

	disconnectedCallback() {
		this.shadowRoot.querySelector(".window-close").removeEventListener("click", this.#winCloseHandler)
		this.shadowRoot.querySelector(".window-minimize").removeEventListener("click", this.#winMinimizeHandler)
		this.shadowRoot.querySelector(".window-maximize").removeEventListener("click", this.#winMaximizeHandler)
		this.shadowRoot.querySelector(".window-new-tab").removeEventListener("click", this.#winNewTabHandler)
		this.shadowRoot.querySelector(".window-title").removeEventListener("click", this.#winFocusHandler)
		this.shadowRoot.querySelector(".window-save").removeEventListener("click", this.#winSaveHandler)
		this.removeEventListener("dragenter", this.#dragenterHandler)
		this.removeEventListener("dragover", this.#dragoverHandler)
		this.removeEventListener("dragleave", this.#dragleaveHandler)
		this.removeEventListener("drop", this.#dropHandler)
	}
	appendTab(/**@type{import("../libs/index.d.ts").TabData|chrome.tabs.Tab}*/ tab) {
		const { index } = tab
		return this.insertBefore(new WindowTab(tab), this.children[index] || null)
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
		if (windowData.incognito) { // add notice that we won't preserve incognito mode
			this.shadowRoot.querySelector(".window-restore")?.setAttribute("title", chrome.i18n.getMessage("windowActionRestoreIncognito"))
		}
		this.#restoreHandler = prevDflt(async (/**@type {MouseEvent}*/evt) => {
			const settings = await chrome.storage.local.get(["restore-discarded"])
			const restoreActive = !settings["restore-discarded"]
			// for now we remove the incognito flag as it is not well handled for tabs creation
			const { id, tabs, groups, state, top, left, height, width, name, incognito, ...rest } = this.#winData
			const groupTabs = {}
			/** @type{import("../libs/index.js").WindowCreateData} */
			let createData = { ...rest }
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
				.then(() => {
					if (evt.ctrlKey) {
						deleteWindow(this.#winData.id).then(() => {
							window.dispatchEvent(new CustomEvent("tab+session-window-deleted", { detail: { windowId: id } }))
							this.remove()
						})
					}
				})
		})
		this.#deleteHandler = prevDflt(async () => {
			const askConfirmation = await chrome.storage.local
				.get(["confirm-delete"])
				.then((settings) => settings["confirm-delete"])
			if (askConfirmation && !confirm(chrome.i18n.getMessage("sessionConfirmDeleteMessage"))) return
			deleteWindow(this.#winData.id).then(() => {
				window.dispatchEvent(new CustomEvent("tab+session-window-deleted", { detail: { windowId: this.#winData.id } }))
				this.remove()
			})
		})
		const nameContainer = /**@type HTMLElement*/(this.shadowRoot.querySelector(".window-name"))
		const spaceOrEnterListener = (evt) => {
			if (evt.ctrlKey || evt.shiftKey || evt.altKey) return
			if (evt.key === " " || evt.key === "Enter") {
				evt.preventDefault()
				evt.stopPropagation()
				if (evt.key === " ") {
					document.execCommand("insertText", false, " ")
				} else {
					nameContainer.blur()
				}
			}
		}
		nameContainer.parentElement.addEventListener("click", () => {
			nameContainer.contentEditable = "plaintext-only"
			// for mozilla browsers only true is supported
			if (!nameContainer.isContentEditable) { nameContainer.contentEditable = "true" }
			// grab focus and listen for space key
			if (document.activeElement !== nameContainer) {
				nameContainer.focus()
				nameContainer.addEventListener("keydown", spaceOrEnterListener)
			}
		})
		nameContainer?.addEventListener("blur", () => {
			nameContainer.contentEditable = "false"
			nameContainer.removeEventListener("keydown", spaceOrEnterListener)
			if (this.#winData.name === nameContainer.textContent) return
			updateSavedWindow(this.#winData?.id, { name: nameContainer.textContent })
				.then(() => { this.#winData.name = nameContainer.textContent })
		})
	}
	connectedCallback() {
		this.shadowRoot.querySelector(".window-restore").addEventListener("click", this.#restoreHandler)
		this.shadowRoot.querySelector(".window-delete").addEventListener("click", this.#deleteHandler)
		this.calculateGridRowEnd()
	}
	disconnectedCallback() {
		this.shadowRoot.querySelector(".window-restore").removeEventListener("click", this.#restoreHandler)
		this.shadowRoot.querySelector(".window-delete").removeEventListener("click", this.#deleteHandler)
	}
}

customElements.define("window-window", WindowWindow)
customElements.define("window-session-window", WindowSessionWindow)
