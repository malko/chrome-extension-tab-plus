//@ts-check
import { WindowWindow, WindowSessionWindow } from "./elements/WindowWindow.js"
import { SVGs } from "./assets/svgs.js"
import { getSavedWindows } from "./libs/db.js"
const activesContainer = /**@type{HTMLDivElement}*/ (document.querySelector("#windowsActive"))
const savedContainer = /**@type{HTMLDivElement}*/ (document.querySelector("#windowsSaved"))
const sessionTabId = await chrome.runtime.sendMessage("get-session-tab-id")

/* #region Theme */
const theme =
	localStorage.getItem("theme") || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
const themeEl = /**@type{import("./elements/InputBoolean.js").InputBoolean}*/ (
	document.querySelector("[name=theme-selector]")
)
themeEl.value = theme === "dark"
const updateTheme = () => {
	localStorage.setItem("theme", themeEl.checked ? "dark" : "light")
	document.querySelector("html").classList.toggle("dark", themeEl.checked)
	document.querySelector("html").classList.toggle("light", !themeEl.checked)
}
themeEl.addEventListener("change", updateTheme)
updateTheme()
/* #endregion */
/* #region show titles */
const showTitles = localStorage.getItem("show-titles") === "true"
const showTitlesEl = /**@type{import("./elements/InputBoolean.js").InputBoolean}*/ (
	document.querySelector("[name=show-titles-selector]")
)
const updateShowTitles = () => {
	localStorage.setItem("show-titles", String(showTitlesEl.checked))
	document.querySelector("html").classList.toggle("show-titles", showTitlesEl.checked)
}
showTitlesEl.addEventListener("change", updateShowTitles)
showTitlesEl.value = showTitles
updateShowTitles()
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
				//@ts-expect-error
				const winEl = new WindowWindow(win)
				activesContainer.appendChild(winEl)
			})
		})
		.then(() => {
			const newWinButton = document.createElement("div")
			newWinButton.className = "window window-new"
			newWinButton.innerHTML = /*html*/ `
				<div class="window-title">New</div>
				<div class="window-tabs" style="--stroke:var(--fg)">
					<span class="window-tab" title="Window" data-action="tab">
						${SVGs.tabNew}
					</span>
					<span class="window-tab" title="Incognito window" data-action="tab-incognito">
						${SVGs.incognito}
					</span>
				</div>
			`
			activesContainer.appendChild(newWinButton)
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
chrome.tabs.onCreated.addListener((tab) => rerender({ type: "tab-create", tabId: tab.id }))
chrome.tabs.onRemoved.addListener((tabId, removeInfo) => rerender({ type: "tab-remove", tabId }))
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => rerender({ type: "tab-update", tabId }))
window.addEventListener("tab+session-window-saved", rerender)
export {}
