//@ts-check
const dbName = "windows-tabs-db"
const dbVersion = 1
/**
 * return a promise of a transaction resolution
 * @template T
 * @param {IDBTransaction} tx
 * @param {T extends ()=>unknown} resolver?
 * @returns {Promise<ReturnType<T>|void>}
 */
const txPromise = (tx, resolver = void 0) => {
	return new Promise((resolve, reject) => {
		tx.oncomplete = () => resolve(resolver ? resolver() : void 0)
		tx.onerror = () => reject(tx.error)
		tx.onabort = () => reject(tx.error)
	})
}

/**
 * @returns {Promise<IDBDatabase>}
 */
function openDB() {
	return new Promise((resolve, reject) => {
		const request = indexedDB.open(dbName, dbVersion)
		request.onerror = () => reject(request.error)
		request.onsuccess = () => resolve(request.result)
		request.onupgradeneeded = (event) => {
			const db = request.result
			switch (event.oldVersion) {
				case 0: // db init
					const windowStore = db.createObjectStore("windows", { keyPath: "id", autoIncrement: true })
				case 1: // db-upgrade from v1 to v2
				// nothing to do right now
			}
		}
	})
}

const tabToTabStoredData = ({
	index = undefined,
	title = undefined,
	url = undefined,
	pinned = undefined,
	highlighted = undefined,
	active = undefined,
	favIconUrl = undefined,
	incognito = undefined,
	discarded = undefined,
	autoDiscardable = undefined,
	mutedInfo = undefined,
	groupId = undefined,
	pendingUrl = undefined,
	status = undefined,
}) => {
	return {
		index,
		title,
		url: status !== "complete" && pendingUrl ? pendingUrl || url : url,
		pinned,
		highlighted,
		active,
		favIconUrl,
		incognito,
		discarded,
		autoDiscardable,
		mutedInfo,
		groupId,
	}
}
export const windowToStoredWindow = async ({
	state = undefined,
	type = undefined,
	focused = undefined,
	incognito = undefined,
	height = undefined,
	width = undefined,
	top = undefined,
	left = undefined,
	tabs = undefined,
}) => {
	tabs = tabs?.map(tabToTabStoredData) || []
	let groups = []
	const groupIds = new Set()
	tabs.forEach(({ groupId }) => {
		groupId !== null && groupId !== undefined && groupId > 0 && groupIds.add(groupId)
	})
	if (groupIds.size > 0) {
		groups = await Promise.all(
			Array.from(groupIds).map(async (groupId) => {
				const { windowId, ...group } = await chrome.tabGroups.get(groupId)
				return group
			})
		)
	}
	return { state, type, focused, incognito, height, width, top, left, tabs, groups }
}

export const saveWindow = async (/**@type {chrome.windows.Window}*/ window) => {
	/** @type {Omit<import("./index").WindowStoredData, "id">} */
	const rawWindow = await windowToStoredWindow(window)
	const db = await openDB()
	const tx = db.transaction(["windows"], "readwrite")
	const windowsStore = tx.objectStore("windows")
	const winRequest = windowsStore.put(rawWindow)
	return txPromise(tx, () => ({ ...window, id: winRequest.result }))
}

export const getSavedWindows = async () => {
	const db = await openDB()
	const tx = db.transaction(["windows"], "readonly")
	const windowsStore = tx.objectStore("windows")
	const windowRequest = windowsStore.getAll()
	return txPromise(tx, () => windowRequest.result)
}

export const getPartialTabDataFromUrl = async (/**@type {string}*/ url) => {
	const db = await openDB()
	const tx = db.transaction(["windows"], "readonly")
	const windowsStore = tx.objectStore("windows")
	const cursorRequest = windowsStore.openCursor()
	return new Promise((resolve, reject) => {
		cursorRequest.onerror = (event) => {
			reject(cursorRequest.error)
		}
		cursorRequest.onsuccess = (event) => {
			const cursor = cursorRequest.result
			if (cursor) {
				/** @type {import("./index").TabData|undefined} */
				const tabData = cursor.value.tabs.find((tab) => tab.url === url)
				if (!tabData) {
					cursor.continue()
				} else {
					const { favIconUrl, title } = tabData
					resolve({ favIconUrl, title })
				}
			} else {
				resolve(null)
			}
		}
	})
}

export const deleteWindow = async (/**@type {number}*/ windowId) => {
	const db = await openDB()
	const tx = db.transaction(["windows"], "readwrite")
	const windowsStore = tx.objectStore("windows")
	const winRequest = windowsStore.delete(windowId)
	return txPromise(tx)
}

export const updateSavedWindow = async (
	/**@type {number}*/ windowId,
	/**@type{Partial<import("./index").WindowStoredData>}*/ partialWindowData
) => {
	const db = await openDB()
	const tx = db.transaction(["windows"], "readwrite")
	const windowsStore = tx.objectStore("windows")
	const winRequest = windowsStore.get(windowId)
	winRequest.onsuccess = () => {
		const win = winRequest.result
		windowsStore.put({ ...win, ...partialWindowData })
	}
	return txPromise(tx)
}
