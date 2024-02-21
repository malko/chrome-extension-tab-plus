//@ts-check
import { bindPageActions } from "./libs/bindPageActions.js"

// close any opened session tab
const { sessionTabId } = await chrome.runtime.sendMessage({ type: "get-session-tab-ids" })
sessionTabId && chrome.tabs.remove(sessionTabId)

bindPageActions()

// read settings from storage
const loadingSettings = await chrome.storage.local.get(["darkmode", "show-titles", "restore-discarded"])

const darkMode =
	"darkmode" in loadingSettings ? !!loadingSettings.darkmode : window.matchMedia("(prefers-color-scheme: dark)").matches
const themeEl = /**@type{import("./elements/InputBoolean.js").InputBoolean}*/ (
	document.querySelector("boolean-settings[key=darkmode]")
)
themeEl.value = darkMode
const updateTheme = async () => {
	chrome.storage.local.set({ darkmode: themeEl.checked })
	document.querySelector("html").classList.toggle("dark", themeEl.checked)
	document.querySelector("html").classList.toggle("light", !themeEl.checked)
}
themeEl.addEventListener("change", updateTheme)
updateTheme()
