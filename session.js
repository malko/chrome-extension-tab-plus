//@ts-check
import { WindowWindow, WindowSessionWindow } from "./elements/WindowWindow.js"
import { SVGs } from "./assets/svgs.js"
import { getSavedWindows } from "./libs/db.js"
import { bindPageActions } from "./libs/bindPageActions.js"
const activesContainer = /**@type{HTMLDivElement}*/ (document.querySelector("#windowsActive"))
const savedContainer = /**@type{HTMLDivElement}*/ (document.querySelector("#windowsSaved"))
const { sessionTabId, prevActiveTabId } = await chrome.runtime.sendMessage({ type: "get-session-tab-ids" })
const loadingSettings = await chrome.storage.local.get(["darkmode", "show-titles", "restore-discarded"])
const rootElmt = document.querySelector("html")

bindPageActions()
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
})
loadingSettings["show-titles"] && rootElmt.classList.add("show-titles")
//#endregion show titles

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
