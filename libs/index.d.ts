type TabStatus = "loading" | "complete"
interface WindowCommonData {
	state?: chrome.windows.WindowStateEnum
	type?: chrome.windows.createTypeEnum
	focused?: boolean
	incognito?: boolean
	height?: number
	width?: number
	top?: number
	left?: number
}

export interface TabData {
	id?: number
	windowId?: number
	status?: TabStatus
	index: number
	title?: string
	url?: string
	pinned?: boolean
	highlighted?: boolean
	active?: boolean
	favIconUrl?: string | undefined
	incognito?: boolean
	discarded?: boolean
	autoDiscardable?: boolean
	mutedInfo?: chrome.tabs.MutedInfo
	groupId?: number
}

interface WindowCreateData extends WindowCommonData {
	id?: number
	url?: string | string[]
}

interface WindowStoredData extends WindowCommonData {
	id?: number
	tabs?: TabData[] | chrome.TabsTab[]
}
