import { getPartialTabDataFromUrl } from "./libs/db.js"
import { SVGs } from "./assets/svgs.js"
	; (async () => {
		const url = window.location.href.replace(new RegExp(`^(chrome-extension:\/\/[^/]+/discarded.html#)+`), "")
		document.title = url
		document.querySelector("h1")?.insertAdjacentHTML("afterend", SVGs.reload)

		const tab = await chrome.tabs.getCurrent()
		const activateHandler = (activeInfo) => {
			if (activeInfo.tabId === tab.id) {
				chrome.tabs.update(tab.id, { url })
				chrome.tabs.onActivated.removeListener(activateHandler)
			}
		}
		document.body.addEventListener("click", () => activateHandler({ tabId: tab.id }))
		chrome.tabs.onActivated.addListener(activateHandler)

		getPartialTabDataFromUrl(url).then(({ favIconUrl = null, title }) => {
			title && (document.title = title)
			favIconUrl &&
				document.head.appendChild(
					Object.assign(document.createElement("link"), {
						rel: "icon",
						href: favIconUrl,
					})
				)
		})
	})()
