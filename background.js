

	var listenedWindow = listenedWindow || {};

	//delay at start before listening windows
	if( ! listenedWindow.initialized ){
		listenedWindow.initialized = true;
		setTimeout(function(){
			chrome.windows.getAll(function(windows){
				for( var i=0,l=windows.length;i<l;i++ ){
					listenedWindow[windows[i].id] = true;
				}
			});
		},750);
	}

	chrome.windows.onCreated.addListener(function(window){
		//delay before starting listening newly created window
		if(! listenedWindow.initialized ){
			return;
		}
		setTimeout(function(){
			console.log('startListening window',window.id);
			listenedWindow[window.id] = true;
		},750);
	});

	chrome.windows.onRemoved.addListener(function(windowId){
		listenedWindow[windowId] && (delete listenedWindow[windowId]);
	});

	chrome.tabs.onCreated.addListener(function(tab) {
		//-- move created tab to the latest position.
		if(! listenedWindow[tab.windowId] ){
			console.log('rejected');
			return;
		}
		if( localStorage['tab+alwaysLast'] ){
			chrome.tabs.getAllInWindow(tab.windowId, function(tabs){
				var tCount = tabs.length;
				if( (tab.index+1) < tCount ){
					chrome.tabs.move(tab.id,{'index':-1});
				}
			});
		}
		//-- focused tab only if not new to avoid loose focus in address bar on newly created tabs.
		if( localStorage['tab+bringToFront'] && tab.url !== "chrome://newtab/" ){
			chrome.tabs.update(tab.id,{"selected":true});
		}
	});