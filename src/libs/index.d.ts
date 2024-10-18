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

export interface TabGroupData {
	id: number
	collapsed: boolean
	color: chrome.tabGroups.ColorEnum
	title?: string
	windowId?: number
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

export interface WindowCreateData extends WindowCommonData {
	id?: number
	url?: string | string[]
}

export interface WindowStoredData extends WindowCommonData {
	id?: number
	name?: string
	tabs?: TabData[] | chrome.TabsTab[]
	groups?: TabGroupData[] | chrome.tabGroups.TabGroup[]
}
