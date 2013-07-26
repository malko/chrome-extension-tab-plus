
function restore_options() {
	document.getElementById('desc').innerHTML = chrome.i18n.getMessage('desc');
	var options = ['alwaysLast','bringToFront'],
	i=0,l=options.length,container = document.getElementById('options');
	for(i=0;i<l;i++){
		var label = document.createElement('label'),
		input = document.createElement('input'),
		text  = document.createTextNode(chrome.i18n.getMessage(options[i]));
		input.id = options[i];
		input.type = 'checkbox';
		input.onchange= function(){ localStorage['tab+'+this.id] = this.checked?1:'';};
		container.appendChild(label);
		label.appendChild(input);
		label.appendChild(text);
		if( localStorage['tab+'+input.id]){
			input.checked = true;
		}
	}
}

if(document.readyState.match(/complete|loaded|interactive/)){
	restore_options();
}else{
	document.addEventListener('DOMContentLoaded', restore_options, false);
}