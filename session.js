//@ts-check
import { WindowWindow, WindowSessionWindow } from "./elements/WindowWindow.js"
import { SVGs } from "./assets/svgs.js"
import { getSavedWindows } from "./libs/db.js"
import { bindPageActions } from "./libs/bindPageActions.js"
const activesContainer = /**@type{HTMLDivElement}*/ (document.querySelector("#windowsActive"))
const savedContainer = /**@type{HTMLDivElement}*/ (document.querySelector("#windowsSaved"))
const { sessionTabId, prevActiveTabId } = await chrome.runtime.sendMessage("get-session-tab-ids")
const loadingSettings = await chrome.storage.local.get(["darkmode", "show-titles", "restore-discarded"])

bindPageActions()
/* #region new window */
document.querySelector("header .actions-new")?.addEventListener("click", (evt) => {
	//@ts-expect-error
	const action = evt.target?.getAttribute("name")
	if (!action) return
	chrome.windows.create({ focused: true, incognito: action === "tabNewIncognito" })
	window.close()
})
/* #endregion new window */
/* #region Theme */
const darkMode =
	"darkmode" in loadingSettings ? !!loadingSettings.darkmode : window.matchMedia("(prefers-color-scheme: dark)").matches
const themeEl = /**@type{import("./elements/InputBoolean.js").InputBoolean}*/ (
	document.querySelector("[name=theme-selector]")
)
themeEl.value = darkMode
const updateTheme = async () => {
	chrome.storage.local.set({ darkmode: themeEl.checked })
	document.querySelector("html").classList.toggle("dark", themeEl.checked)
	document.querySelector("html").classList.toggle("light", !themeEl.checked)
}
themeEl.addEventListener("change", updateTheme)
updateTheme()
/* #endregion */
/* #region show titles */
const showTitles = !!loadingSettings["show-titles"]
const showTitlesEl = /**@type{import("./elements/InputBoolean.js").InputBoolean}*/ (
	document.querySelector("[name=show-titles-selector]")
)
const updateShowTitles = () => {
	chrome.storage.local.set({ "show-titles": showTitlesEl.checked })
	document.querySelector("html").classList.toggle("show-titles", showTitlesEl.checked)
}
showTitlesEl.addEventListener("change", updateShowTitles)
showTitlesEl.value = showTitles
updateShowTitles()
/* #endregion */
/* #region restore discarded */
const restoreDiscarded = !!loadingSettings["restore-discarded"]
const restoreDiscardedEl = /**@type{import("./elements/InputBoolean.js").InputBoolean}*/ (
	document.querySelector("[name=restore-discarded]")
)
const updateRestoreDiscarded = () => {
	chrome.storage.local.set({ "restore-discarded": restoreDiscardedEl.checked })
}
restoreDiscardedEl.addEventListener("change", updateRestoreDiscarded)
restoreDiscardedEl.value = restoreDiscarded
updateRestoreDiscarded()
/* #endregion */

let renderTimer = 0
const rerender = async ({ type: evtType, ...evtDetails }) => {
	// avoid to rerender on this tab udpate
	if (evtType === "tab-updated" && evtDetails.tabId === sessionTabId) {
		return
	}
	// debounce tail call to render
	if (renderTimer) {
		clearTimeout(renderTimer)
	}
	renderTimer = setTimeout(() => {
		renderTimer = 0
		render({ type: evtType, ...evtDetails })
	}, 250)
}
const isValidWindowType = (/**@type{{type?:chrome.windows.windowTypeEnum}}*/ { type }) =>
	type === "normal" || type === "popup"
const render = async ({ type: evtType, ...evtDetails }) => {
	activesContainer.innerHTML = ""
	savedContainer.innerHTML = ""
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
	await getSavedWindows()
		.then((windows) => {
			windows.forEach((win) => {
				const winEl = new WindowSessionWindow(win)
				savedContainer.appendChild(winEl)
			})
		})
		.catch(console.error)
	return
}

render({ type: "init" })
chrome.windows.onCreated.addListener((win) => rerender({ type: "window-create", winId: win.id }))
chrome.windows.onRemoved.addListener((winId) => rerender({ type: "window-remove", winId }))
chrome.windows.onFocusChanged.addListener((winId) => rerender({ type: "window-focus", winId }))
chrome.tabs.onCreated.addListener((tab) => rerender({ type: "tab-create", tabId: tab.id }))
chrome.tabs.onRemoved.addListener((tabId, removeInfo) => rerender({ type: "tab-remove", tabId }))
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => rerender({ type: "tab-update", tabId }))
window.addEventListener("tab+session-window-saved", rerender)
export {}
