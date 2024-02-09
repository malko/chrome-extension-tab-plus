import { SVGs } from "../assets/svgs.js"
export const bindPageActions = async () => {
	/* replace title:msg */
	Array.from(document.querySelectorAll('[title^="msg:"')).forEach(async (el) => {
		el.setAttribute("title", await chrome.i18n.getMessage(el.getAttribute("title").replace(/^msg:/, "")))
	})

	/* page action buttons */
	const quitButton = document.querySelector('header .actions [data-action="session-close"]')
	quitButton?.addEventListener("click", () => window.close())
	const settingsButton = document.querySelector('header .actions [data-action="settings"]')
	settingsButton?.addEventListener("click", () => {
		window.close()
		chrome.runtime.openOptionsPage()
	})
}
