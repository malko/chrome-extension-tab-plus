
function restore_options() {
	document.getElementById('desc').innerHTML = chrome.i18n.getMessage('desc');
	const options = {
		alwaysLast: function () { localStorage['tab+alwaysLast'] = this.checked ? 1 : '' },
		bringToFront: function () {
			localStorage['tab+bringToFront'] = this.checked ? 1 : '';
			chrome.contextMenus.update("tab+contextOpen", {
				title: chrome.i18n.getMessage(this.checked ? 'contextOpenBackground' : 'contextOpenForeground')
			});
		},
	};
	const container = document.getElementById('options');
	Object.keys(options).forEach((option) => {
		const label = document.createElement('label');
		const input = document.createElement('input');
		const text  = document.createTextNode(chrome.i18n.getMessage(option));
		input.id = option;
		input.type = 'checkbox';
		input.onchange = options[option];
		container.appendChild(label);
		label.appendChild(input);
		label.appendChild(text);
		if( localStorage['tab+'+input.id]){
			input.checked = true;
		}
	});
}

if(document.readyState.match(/complete|loaded|interactive/)){
	restore_options();
}else{
	document.addEventListener('DOMContentLoaded', restore_options, false);
}