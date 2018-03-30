let ignoreBringToFront = false;

chrome.tabs.onCreated.addListener((tab) => {
	const windowId = tab.windowId;
	if( localStorage['tab+alwaysLast'] ){
		chrome.tabs.getAllInWindow(windowId, (tabs) => {
			var tCount = tabs.length;
			if( (tab.index+1) < tCount ){
				chrome.tabs.move(tab.id,{'index':-1});
			}
		});
	}
	//-- focused tab only if not new to avoid loose focus in address bar on newly created tabs.
	if (ignoreBringToFront) {
		ignoreBringToFront = false;
		return;
	}
	if( localStorage['tab+bringToFront'] && tab.url !== "chrome://newtab/" ){
		chrome.tabs.update(tab.id,{"active":true});
	}
});

// add contextual menus
chrome.contextMenus.create({
	title: chrome.i18n.getMessage('contextOpenBackground'),
	id: "tab+contextOpen",
	contexts: ['link'],
	visible: true,
	onclick: (info, tab) => {
		ignoreBringToFront = true;
		chrome.tabs.create({url: info.linkUrl, active: !localStorage['tab+bringToFront']});
	}
});