
async function restore_options() {
	document.getElementById('desc').innerHTML = chrome.i18n.getMessage('desc')
	const storedOptions = await chrome.storage.local.get(["bringToFront", "alwaysLast"])
	const container = document.getElementById('options');
	["bringToFront", "alwaysLast"].forEach((option) => {
		const label = document.createElement('label')
		const input = document.createElement('input')
		const text  = document.createTextNode(chrome.i18n.getMessage(option))
		input.id = option
		input.type = 'checkbox'
		input.onchange = () => {
			chrome.storage.local.set({[option]: input.checked})
		}
		container.appendChild(label)
		label.appendChild(input)
		label.appendChild(text)
		input.checked = storedOptions[option]
	});
}

if(document.readyState.match(/complete|loaded|interactive/)){
	restore_options();
}else{
	document.addEventListener('DOMContentLoaded', restore_options, false);
}