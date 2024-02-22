//@ts-check
import { WindowWindow, WindowSessionWindow } from "./elements/WindowWindow.js"
import { WindowTab } from "./elements/WindowTab.js"
import { SVGs } from "./assets/svgs.js"
import { getSavedWindows } from "./libs/db.js"
import { bindPageActions } from "./libs/bindPageActions.js"
import { keyMap } from "./libs/keyMaps.js"
const rootElmt = document.querySelector("html")
const activesContainer = /**@type{HTMLDivElement}*/ (document.querySelector("#windowsActive"))
const savedContainer = /**@type{HTMLDivElement}*/ (document.querySelector("#windowsSaved"))
const { sessionTabId, prevActiveTabId } = await chrome.runtime.sendMessage({ type: "get-session-tab-ids" })
const loadingSettings = await chrome.storage.local.get(["darkmode", "show-titles"])
const searchInput = document.getElementById("search")

bindPageActions()
const relayout = () => {
	;[...activesContainer.children, ...savedContainer.children].forEach((element) => {
		//@ts-expect-error
		element.calculateGridRowEnd()
	})
}
//#region new window
document.querySelector("header .actions-new")?.addEventListener("click", (evt) => {
	//@ts-expect-error
	const action = evt.target?.getAttribute("name")
	if (!action) return
	chrome.windows.create({ focused: true, incognito: action === "tabNewIncognito" })
	window.close()
})
//#endregion

//#region Theme
const themeEl = /**@type{import("./elements/BooleanSettings.js").BooleanSettings}*/ (
	document.querySelector("boolean-settings[key=darkmode]")
)
themeEl.addEventListener("change", () => {
	rootElmt.classList.toggle("dark", themeEl.checked)
	rootElmt.classList.toggle("light", !themeEl.checked)
})
"darkmode" in loadingSettings && rootElmt.classList.add(themeEl.checked ? "dark" : "light")
//#endregion Theme

//#region show titles
const showTitlesEl = /**@type{import("./elements/BooleanSettings.js").BooleanSettings}*/ (
	document.querySelector("boolean-settings[key=show-titles]")
)
showTitlesEl.addEventListener("change", () => {
	rootElmt.classList.toggle("show-titles", showTitlesEl.checked)
	relayout()
})
loadingSettings["show-titles"] && rootElmt.classList.add("show-titles")
//#endregion show titles

//#region search
/**
 * tagged template string to safely escape parameters when you compose your regexp strings
 * example: ```new RegExp(regSafeString`^${param}`, 'i')``
 */
const regSafeString = (strings, ...params) =>
	strings
		.map((string, i) => string + (params[i] ? String(params[i]).replace(/[.*+\-?^${}()|[\]\\]/g, "\\$&") : ""))
		.join("")
/** @returns {WindowTab[]} */
const getTabsEl = () =>
	Array.from(document.querySelectorAll("window-window, window-session-window")).reduce((acc, el) => {
		acc.push(...el.shadowRoot.querySelectorAll("window-tab"))
		return acc
	}, [])
searchInput?.addEventListener("input", (evt) => {
	//@ts-expect-error
	const query = evt.target.value
	const queryRegExp = new RegExp(query.split("").join("[\\s\\S]*"), "i")
	getTabsEl().forEach((element) => {
		element.style.display = queryRegExp.test(element.title) ? "" : "none"
	})
	relayout()
})
//#endregion search
const debounced = (fn, delay = 250) => {
	let lastExec = 0
	let timer = 0
	return (...args) => {
		const now = Date.now()
		const elapsed = now - lastExec
		if (elapsed < delay) {
			clearTimeout(timer)
			timer = setTimeout(() => {
				lastExec = now
				fn(...args)
			}, delay - elapsed)
		} else {
			lastExec = now
			fn(...args)
		}
	}
}
const isValidWindowType = (/**@type{{type?:chrome.windows.windowTypeEnum}}*/ { type }) =>
	type === "normal" || type === "popup"
const renderActiveWindows = debounced(async () => {
	activesContainer.innerHTML = ""
	await chrome.windows
		.getAll({ populate: true })
		.then((windows) => {
			windows.forEach((win) => {
				if (!isValidWindowType(win)) return
				win.tabs = win.tabs.filter((tab) => tab.id !== sessionTabId)
				win.tabs.some((tab) => tab.id === prevActiveTabId && (tab.active = true))
				//@ts-expect-error
				const winEl = new WindowWindow(win)
				win.focused && winEl.classList.add("focused")
				activesContainer.appendChild(winEl)
			})
		})
		.catch(console.error)
})
const renderSavedWindows = debounced(async () => {
	savedContainer.innerHTML = ""
	await getSavedWindows()
		.then((windows) => {
			windows.forEach((win) => {
				const winEl = new WindowSessionWindow(win)
				savedContainer.appendChild(winEl)
			})
		})
		.catch(console.error)
})

const render = async ({ type: evtType, ...evtDetails }) => {
	renderActiveWindows()
	renderSavedWindows()
	relayout()
}

const rerender = async (evt) => {
	const { type: evtType, ...evtDetails } = evt
	// avoid to rerender on this tab udpate
	if (evtType === "tab-updated" && evtDetails.tabId === sessionTabId) {
		return
	}
	const getWinEl = () =>
		/**@type{WindowWindow|null}*/ (document.querySelector(`window-window#window-${evtDetails.winId}`))
	const getTabEl = () => getWinEl()?.shadowRoot.querySelector(`window-tab#tab-${evtDetails.tabId}`)

	switch (evtType) {
		case "window-create":
			// if the window is a popup or not a normal window, ignore it
			if (!isValidWindowType(evtDetails)) return
			return renderActiveWindows()
		case "window-remove": {
			const winEl = getWinEl()
			winEl ? winEl.remove() : renderActiveWindows()
			return relayout()
		}
		case "window-focus": {
			if (evtDetails.winId === -1) return
			const winEl = getWinEl()
			if (!winEl) return renderActiveWindows()
			document.querySelector("window-window.focused")?.classList.remove("focused")
			return winEl?.classList.add("focused")
		}
		case "tab-activated": {
			if (evtDetails.tabId === sessionTabId) return
			const tabEl = getTabEl()
			if (!tabEl) {
				return renderActiveWindows()
			}
			tabEl.parentNode.querySelectorAll("window-tab.active").forEach((el) => el.classList.remove("active"))
			return tabEl.classList.add("active")
		}
		case "tab-detached":
		case "tab-remove": {
			const tabEl = getTabEl()
			tabEl ? tabEl.remove() : renderActiveWindows()
			return relayout()
		}
		case "tab-update": {
			const tabEl = getTabEl()
			if (tabEl && evtDetails.tab && !evtDetails.groupId) {
				return tabEl.replaceWith(new WindowTab(evtDetails.tab))
			} else {
				return renderActiveWindows()
			}
		}
		case "tab-attached": {
			const winEl = getWinEl()
			const tab = await chrome.tabs.get(evtDetails.tabId)
			winEl && tab ? winEl.appendTab(tab) : renderActiveWindows()
			return relayout()
		}
		case "tab-create": {
			const winEl = getWinEl()
			winEl ? winEl.appendTab(evtDetails.tab) : renderActiveWindows()
			return relayout()
		}
		case "tab-move": {
			const tabEl = getTabEl()
			if (!tabEl) return renderActiveWindows()
			const { fromIndex, toIndex } = evtDetails.moveInfo
			if (toIndex === 0) {
				tabEl.parentNode.prepend(tabEl)
			} else if (fromIndex < toIndex) {
				// move to the right
				tabEl.parentNode.insertBefore(tabEl, tabEl.parentNode.children[toIndex + 1])
			} else {
				// move to the left
				tabEl.parentNode.insertBefore(tabEl, tabEl.parentNode.children[toIndex])
			}
			return relayout()
		}
		case "tab+session-window-saved":
			renderSavedWindows()
			return relayout()
		default:
			console.error("Unknown render event type", evtType, evtDetails)
	}
	render({ type: evtType, ...evtDetails })
}

render({ type: "init" })
chrome.windows.onCreated.addListener((win) => rerender({ type: "window-create", winId: win.id }))
chrome.windows.onRemoved.addListener((winId) => rerender({ type: "window-remove", winId }))
chrome.windows.onFocusChanged.addListener((winId) => rerender({ type: "window-focus", winId }))
chrome.tabs.onCreated.addListener((tab) => rerender({ type: "tab-create", tabId: tab.id, tab, winId: tab.windowId }))
chrome.tabs.onRemoved.addListener((tabId, removeInfo) =>
	rerender({ type: "tab-remove", tabId, winId: removeInfo.windowId, isWindowClosing: removeInfo.isWindowClosing })
)
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) =>
	rerender({ type: "tab-update", tabId, winId: tab.windowId, tab, changeInfo })
)
chrome.tabs.onMoved.addListener((tabId, moveInfo) =>
	rerender({ type: "tab-move", tabId, winId: moveInfo.windowId, moveInfo })
)
chrome.tabs.onDetached.addListener((tabId, detachInfo) =>
	rerender({ type: "tab-detached", tabId, winId: detachInfo.oldWindowId, oldPosition: detachInfo.oldPosition })
)
chrome.tabs.onAttached.addListener((tabId, attachInfo) =>
	rerender({ type: "tab-attached", tabId, winId: attachInfo.newWindowId, newPosition: attachInfo.newPosition })
)
chrome.tabs.onActivated.addListener((activeInfo) =>
	rerender({ type: "tab-activated", tabId: activeInfo.tabId, winId: activeInfo.windowId })
)
window.addEventListener("tab+session-window-saved", rerender)
window.addEventListener("resize", relayout)
window.addEventListener(
	"keydown",
	keyMap(
		{
			"Ctrl+f": () => searchInput?.focus(),
		},
		{ preventDefault: true, stopPropagation: true }
	)
)
export {}
