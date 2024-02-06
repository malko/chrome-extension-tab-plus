//@ts-check
const dbName = "windows-tabs-db"
const dbVersion = 1

/**
 * return a promise of a transaction resolution
 * @template T
 * @param {IDBTransaction} tx
 * @param {T extends ()=>unknown} [resolver]
 * @returns {Promise<ReturnType<T>|void>}
 */
const txPromise = (tx, resolver) => {
	return new Promise((resolve, reject) => {
		tx.oncomplete = () => resolve(resolver() || void 0)
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
					db.createObjectStore("windows", { keyPath: "id", autoIncrement: true })
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
const windowToStoredWindow = ({
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
	return { state, type, focused, incognito, height, width, top, left, tabs: tabs.map(tabToTabStoredData) }
}

export const saveWindow = async (/**@type {chrome.windows.Window}*/ window) => {
	const db = await openDB()
	const tx = db.transaction(["windows"], "readwrite")
	const windowsStore = tx.objectStore("windows")
	/** @type {Omit<import("./index").WindowStoredData, "id">} */
	const rawWindow = windowToStoredWindow(window)
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

export const deleteWindow = async (/**@type {number}*/ windowId) => {
	const db = await openDB()
	const tx = db.transaction(["windows"], "readwrite")
	const windowsStore = tx.objectStore("windows")
	const winRequest = windowsStore.delete(windowId)
	return txPromise(tx)
}
