const winOpening = {}
chrome.windows.onCreated.addListener((window) => {
	winOpening[`_:${window.id}`] = Date.now()
})

chrome.tabs.onCreated.addListener(async (tab) => {
	const windowId = tab.windowId
	const winOpeningKey = `_:${windowId}`
	// avoid to work on windows opening, arbitrary choosing 500ms delay
	// because we have no way to know the window is restoring or not (this is crap)
	if (winOpening?.[winOpeningKey]) {
		if (Date.now() - winOpening[winOpeningKey] < 500) {
			return
		}
		delete winOpening[winOpeningKey]
	}
	// read user settings
	const { alwaysLast, bringToFront, ignoreBringToFront } = await chrome.storage.local.get([
		"alwaysLast",
		"bringToFront",
		"ignoreBringToFront",
	])

	// optionnaly move tab to last position
	if (alwaysLast) {
		await chrome.tabs.query({ windowId: windowId }).then((tabs) => {
			var tCount = tabs.filter((t) => t.hidden !== true).length // this is for sideckick
			if (tab.index + 1 < tCount) {
				chrome.tabs.move(tab.id, { index: -1 })
			}
		})
	}

	// active settings is already correct for tabs opened by context menu
	if (ignoreBringToFront) {
		await chrome.storage.local.set({ ignoreBringToFront: false })
		return
	}

	// add focus to tabs that are not chrome://newtab
	if (bringToFront && tab.url !== "chrome://newtab/") {
		chrome.tabs.update(tab.id, { active: true })
	}
})

//#region contextMenu
// add contextual menus
chrome.storage.local.get("bringToFront", ({ bringToFront }) => {
	chrome.contextMenus.removeAll()
	chrome.contextMenus.create({
		id: "tab+contextOpen",
		contexts: ["link"],
		title: chrome.i18n.getMessage(bringToFront === true ? "contextOpenBackground" : "contextOpenForeground"),
		visible: true,
	})
})

// listen for click on context menu
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
	if (info.menuItemId == "tab+contextOpen") {
		const { bringToFront } = await chrome.storage.local.get("bringToFront")
		await chrome.storage.local.set({ ignoreBringToFront: true })
		chrome.tabs.create({ url: info.linkUrl, active: !bringToFront })
	}
})

// update context menu on settings change
chrome.storage.onChanged.addListener((changes, namespace) => {
	for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
		if (key == "bringToFront") {
			chrome.contextMenus.update("tab+contextOpen", {
				title: chrome.i18n.getMessage(newValue ? "contextOpenBackground" : "contextOpenForeground"),
			})
		}
	}
})
//#endregion contextMenu

//#region session management
//-- session management related --//
let sessionTabId = null
let prevActiveTabId = null

// bind onclick event to extension icon
chrome.action.onClicked.addListener(async (tab) => {
	const sessionTabIsActiveTab = tab.id === sessionTabId
	// if session tab is already open removeIt
	if (sessionTabId) {
		await chrome.tabs.remove(sessionTabId).catch(() => {})
	}
	// if the active tab is the session tab, just stop here
	if (sessionTabIsActiveTab) {
		if (prevActiveTabId) {
			chrome.tabs.update(prevActiveTabId, { active: true }).catch(() => {})
			prevActiveTabId = null
		}
		sessionTabId = null
		return
	}
	// open a new session tab
	prevActiveTabId = tab.id
	sessionTabId = (await chrome.tabs.create({ url: "./session.html", active: true })).id
})
// reset sessiontab when closed
chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
	if (sessionTabId !== tabId) {
		return
	}
	if (removeInfo.isWindowClosing) {
		sessionTabId = null
		prevActiveTabId = null
		return
	}
	if (prevActiveTabId) {
		chrome.tabs.update(prevActiveTabId, { active: true }).catch(() => {})
		prevActiveTabId = null
	}
	sessionTabId = null
})
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	switch (message) {
		case "get-session-tab-ids":
			sendResponse({ sessionTabId, prevActiveTabId })
			break
	}
})
//#endregion session management
