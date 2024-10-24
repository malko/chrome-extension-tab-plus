//@ts-check
import { WindowWindow, WindowSessionWindow } from "./elements/WindowWindow.js"
import { WindowTab } from "./elements/WindowTab.js"
import { SVGs } from "./assets/svgs.js"
import { getSavedWindows } from "./libs/db.js"
import { bindPageActions } from "./libs/bindPageActions.js"
import { keyMap, keysHandler } from "./libs/keyMaps.js"
import { debounced } from "./libs/debounced.js"
const rootElmt = document.querySelector("html")
const activesContainer = /**@type{HTMLDivElement}*/ (document.querySelector("#windowsActive > .container"))
const savedContainer = /**@type{HTMLDivElement}*/ (document.querySelector("#windowsSaved > .container"))
const { sessionTabId, prevActiveTabId } = await chrome.runtime.sendMessage({ type: "get-session-tab-ids" })
const loadingSettings = await chrome.storage.local.get(["darkmode", "show-titles"])
const searchInput = /**@type {HTMLInputElement}*/(document.getElementById("search"))
const searchMode = /** @type {HTMLInputElement}*/(document.querySelector("boolean-settings[key=fuzzySearch]"))
const duplicateTabs = /** @type {HTMLInputElement}*/(document.querySelector("boolean-settings[key=highlight-duplicates]"))
// const duplicateTabs = /** @type {HTMLInputElement}*/(document.querySelector("color-svg[name=highlightDuplicates]"))

bindPageActions()
const grabFocus = () => {
	sessionTabId &&
		chrome.tabs
			.get(sessionTabId)
			.then((tab) => chrome.windows.update(tab.windowId, { focused: true }))
			.catch(console.error)
}

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
	//@ts-expect-error
	if (evt.ctrlKey) {
		grabFocus()
	} else {
		window.close()
	}
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
const escapeExpChars = (/**@type {string}*/s) => s.replace(/[.*+?^${}()|[\]\\-]/g, "\\$&")
const escapeRegCharsWithStars = (/**@type {string}*/s) => s.replace(/[.+?^${}()|[\]\\-]/g, "\\$&").replace(/\*/g, ".*?")
/** @returns {WindowTab[]} */
const getTabsEl = ({ activeWindowOnly = false, visibleOnly = false } = {}) =>
	Array.from(document.querySelectorAll(`window-window${activeWindowOnly ? "" : ", window-session-window"}`)).reduce(
		(acc, el) => {
			acc.push(...el.querySelectorAll(`window-tab${visibleOnly ? ":not(.hidden)" : ""}`))
			return acc
		},
		[]
	)
const performSearch = () => {
	const query = searchInput.value
	if (!query) {
		getTabsEl().forEach((element) => element.classList.remove("hidden"))
		relayout()
		return
	}
	const isFuzzy = searchMode.value
	const queryRegExp = isFuzzy
		? new RegExp(query.split("").map(escapeExpChars).join(".*?"), "i")
		: new RegExp(escapeRegCharsWithStars(query), "i")
	getTabsEl().forEach((element) => {
		const match = queryRegExp.test(element.tabData.title + element.tabData.url)
		element.classList.toggle("hidden", !match)
	})
	relayout()
}
searchInput?.addEventListener("input", debounced((evt) => { performSearch() }, 500))
searchMode.addEventListener("change", () => { searchInput.value && performSearch() })
searchInput?.addEventListener(
	"keydown",
	keysHandler("ArrowDown|Enter", (evt) => getTabsEl({ activeWindowOnly: true, visibleOnly: true })[0]?.focus(), {
		preventDefault: true,
		stopPropagation: true,
	})
)

//#endregion search

//#region duplicate tabs
const discardedUrlExp = new RegExp(`^(chrome-extension:\/\/[^/]+/discarded.html#)+`)
const discardedUrlCleaner = (/**@type {string}*/url) => url.replace(discardedUrlExp, "")
/** highlight duplicate tabs if duplicateTabs settings is on */
const highlightDuplicateTabs = debounced(async () => {
	const tabs = getTabsEl({ activeWindowOnly: true, visibleOnly: false })
	const urls = new Map()
	tabs.forEach((tab) => {
		const url = discardedUrlCleaner(tab.tabData.url)
		urls.set(url, (urls.get(url) || 0) + 1)
	})
	tabs.forEach((tab) => {
		tab.classList.toggle("duplicate", urls.get(discardedUrlCleaner(tab.tabData.url)) > 1)
	})
})
duplicateTabs.addEventListener("change", () => {
	duplicateTabs.checked ? highlightDuplicateTabs() : document.querySelectorAll("window-tab.duplicate").forEach((el) => el.classList.remove("duplicate"))
})
//#endregion duplicate tabs

const isValidWindowType = (/**@type{{type?:chrome.windows.windowTypeEnum}}*/ { type }) =>
	type === "normal" || type === "popup"
const renderActiveWindows = debounced(async () => {
	activesContainer.innerHTML = ""
	return chrome.windows
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
	return getSavedWindows()
		.then((windows) => {
			windows.forEach((win) => {
				const winEl = new WindowSessionWindow(win)
				savedContainer.appendChild(winEl)
			})
		})
		.catch(console.error)
})

const render = async ({ type: evtType, ...evtDetails }) => {
	await Promise.all([renderActiveWindows(), renderSavedWindows()])
	relayoutAndHighlightDuplicates()
}

const relayoutAndHighlightDuplicates = () => {
	duplicateTabs.checked && highlightDuplicateTabs()
	relayout()
}

const rerender = async (evt) => {
	const { type: evtType, ...evtDetails } = evt
	// avoid to rerender on this tab udpate
	if (evtType === "tab-updated" && evtDetails.tabId === sessionTabId) {
		return
	}
	const getWinEl = () =>
		/**@type{WindowWindow|null}*/(document.querySelector(`window-window#window-${evtDetails.winId}`))
	const getTabEl = () => getWinEl()?.querySelector(`window-tab#tab-${evtDetails.tabId}`)

	switch (evtType) {
		case "window-create":
			// if the window is a popup or not a normal window, ignore it
			if (!isValidWindowType(evtDetails)) return
			return renderActiveWindows().then(() => { relayout() })
		case "window-remove": {
			const winEl = getWinEl()
			await (winEl ? winEl.remove() : renderActiveWindows())
			return relayoutAndHighlightDuplicates()
		}
		case "window-focus": {
			if (evtDetails.winId === -1) return
			const winEl = getWinEl()
			if (!winEl) return renderActiveWindows().then(relayoutAndHighlightDuplicates)
			document.querySelector("window-window.focused")?.classList.remove("focused")
			return winEl?.classList.add("focused")
		}
		case "tab-activated": {
			if (evtDetails.tabId === sessionTabId) return
			const tabEl = getTabEl()
			if (!tabEl) {
				return renderActiveWindows().then(relayoutAndHighlightDuplicates)
			}
			tabEl.parentNode.querySelectorAll("window-tab.active").forEach((el) => el.classList.remove("active"))
			return tabEl.classList.add("active")
		}
		case "tab-detached":
		case "tab-remove": {
			const tabEl = getTabEl()
			tabEl ? tabEl.remove() : renderActiveWindows()
			return relayoutAndHighlightDuplicates()
		}
		case "tab-update": {
			const tabEl = getTabEl()
			if (tabEl && evtDetails.tab && !evtDetails.groupId) {
				tabEl.replaceWith(new WindowTab(evtDetails.tab))
			} else {
				await renderActiveWindows()
			}
			return duplicateTabs.checked && highlightDuplicateTabs()
		}
		case "tab-attached": {
			const winEl = getWinEl()
			const tab = await chrome.tabs.get(evtDetails.tabId)
			await (winEl && tab ? winEl.appendTab(tab) : renderActiveWindows())
			return relayoutAndHighlightDuplicates()
		}
		case "tab-create": {
			const winEl = getWinEl()
			winEl ? winEl.appendTab(evtDetails.tab) : renderActiveWindows()
			return relayoutAndHighlightDuplicates()
		}
		case "tab-move": {
			const tabEl = getTabEl()
			if (!tabEl) return renderActiveWindows().then(relayoutAndHighlightDuplicates)
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
			return relayoutAndHighlightDuplicates()
		}
		case "tab+session-window-saved":
			renderSavedWindows()
			return relayout()
		default:
			console.error("Unknown render event type", evtType, evtDetails)
	}
	render({ type: evtType, ...evtDetails })
}

// silence debounced errors
window.addEventListener("unhandledrejection", (evt) => {
	const { name, message } = evt.reason || {}
	if (name === "AbortError" && message === "Debounced") {
		evt.preventDefault()
	}
})

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
const keyboardClickHandler = (evt) => evt.target.getAttribute("tabIndex") === "0" && evt.target.click()
window.addEventListener(
	"keydown",
	keyMap(
		{
			"Ctrl+f": () => searchInput?.focus(),
			"Ctrl+l": () => showTitlesEl.toggle(),
			//@ts-expect-error
			"Ctrl+o": () => document.querySelector('header .actions [data-action="settings"]').click(),
			Enter: keyboardClickHandler,
			" ": keyboardClickHandler,
		},
		{ preventDefault: true, stopPropagation: true }
	)
)
// for drag and drop tabs
activesContainer.addEventListener("dragover", (evt) => {
	evt.preventDefault()
})
activesContainer.addEventListener("drop", (evt) => {
	evt.preventDefault()
	try {
		const { tabId, windowId } = JSON.parse(evt.dataTransfer.getData("text/plain"))
		if (!(tabId && windowId)) return
		chrome.windows.create({ focused: false, tabId }).then(grabFocus).catch(console.error)
	} catch (e) {
		console.error(e)
	}
})
export { }
