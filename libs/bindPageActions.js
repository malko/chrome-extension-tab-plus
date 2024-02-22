import { SVGs } from "../assets/svgs.js"
const msgAttributeReplacer = (attrName) => {
	Array.from(document.querySelectorAll(`[${attrName}^="msg:"]`)).forEach(async (el) => {
		el.setAttribute(attrName, await chrome.i18n.getMessage(el.getAttribute(attrName).replace(/^msg:/, "")))
	})
}
export const bindPageActions = async () => {
	/* replace title:msg */
	msgAttributeReplacer("title")
	/* replace placeholder:msg */
	msgAttributeReplacer("placeholder")

	/* page action buttons */
	const quitButton = document.querySelector('header .actions [data-action="session-close"]')
	quitButton?.addEventListener("click", () => window.close())
	const settingsButton = document.querySelector('header .actions [data-action="settings"]')
	settingsButton?.addEventListener("click", () => {
		window.close()
		chrome.runtime.openOptionsPage()
	})
}
