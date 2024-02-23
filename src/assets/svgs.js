const svg24 = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">'
const stroke = `stroke:var(--svg-color, #000);`
const fill = `fill:var(--svg-color, #000);`
const roundStroke = `${stroke}stroke-linecap:round;stroke-linejoin:round;`
const roundMiterStroke = `${stroke}stroke-linecap:round;stroke-linejoin:miter;`
const noFill = `fill:none;`
export const SVGs = {
	broken: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24 ">
<defs>
<style>.cls1{${noFill}${roundStroke}stroke-width:1px}</style>
</defs>
<path class="cls1" d="m 4 2 h11 l0 5l5 0 v6l-4-4l-3 4l-4-3l-5 2Z m 16 13 l-3.75-3.75l-3 4l-4.25-3.5l-5 2v9h16z"/>
<path class="cls1" style="fill:var(--svg-color, #000);" d="m16.5 2v3.5h3.5z"/>
</svg>`,

	checkmark: `${svg24}
	<path style="${roundStroke}stroke-width:4;${noFill}" d="m5 12l4 6l11-12">
</svg>`,

	delete: `${svg24}
<defs><style>.cls1{${noFill}${roundStroke}stroke-width:2px}</style></defs>
<path class="cls1" d="M9 4h6M4 7h16m-3 0v13h-10v-13"/>
<path class="cls1" style="stroke-width:1.25" d="M10.5 10v7M13.5 10v7"/>
</svg>`,

	earth: `${svg24}
	<defs><style>.cls1{${fill}${roundStroke}stroke-width:2px;}</style></defs>
	<circle class="cls1" style="${noFill}" cx="12" cy="12" r="9" />
	<path class="cls1" d="m4 10h2l3 1l-2 2l3 2l-4 3.5z"/>
	<path class="cls1" d="m18 6h-3l-1 2l-2 1l0 2l3 1h2v1h3z"/>
	</svg>`,

	grid: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
<defs>
<style>.cls1{${fill}${roundStroke}stroke-width:3.60813;paint-order:stroke fill markers;stop-color:#000}</style>
</defs>
<rect width="16.099" height="16.785" x="4" y="4" rx="2.552" ry="2.466" class="cls1"/>
<rect width="16.099" height="16.785" x="27.901" y="4" rx="2.552" ry="2.466" class="cls1"/>
<rect width="16.099" height="16.785" x="27.901" y="27.215" rx="2.552" ry="2.466" class="cls1"/>
<rect width="16.099" height="16.785" x="4" y="27.215" rx="2.552" ry="2.466" class="cls1"/>
</svg>`,

	incognito: `${svg24}
<defs>
<style>.cls-1{${noFill}${stroke};stroke-miterlimit:10;stroke-width:2;}</style>
</defs>
<polyline class="cls-1" points="0.5 11.04 12 11.04 23.5 11.04"/>
<path class="cls-1" d="M19.67,11H4.33L5,4.68A2.54,2.54,0,0,1,7.57,2.42h0a2.47,2.47,0,0,1,1.13.27h0a7.43,7.43,0,0,0,6.6,0h0a2.47,2.47,0,0,1,1.13-.27h0A2.54,2.54,0,0,1,19,4.68Z"/>
<circle class="cls-1" cx="6.73" cy="18.23" r="3.35"/>
<circle class="cls-1" cx="17.27" cy="18.23" r="3.35"/>
<path class="cls-1" d="M10.08,18.71a1.92,1.92,0,1,1,3.84,0"/>
<line class="cls-1" x1="1.46" y1="15.83" x2="4.33" y2="15.83"/>
<line class="cls-1" x1="19.67" y1="15.83" x2="22.54" y2="15.83"/>
</svg>`,

	list: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
<defs><style>.cls1{${fill}stroke:none;}</style></defs>
<rect width="28.235" height="5.629" x="15.765" y="5.72" rx="2.067" ry="2.067" class="cls1"/>
<rect width="9.112" height="9.069" x="4" y="4" rx="3.038" ry="3.038" class="cls1"/>
<g transform="translate(0 .806)">
<rect width="28.235" height="5.629" x="15.765" y="15.224" rx="2.067" ry="2.067" class="cls1"/>
<rect width="9.112" height="9.069" x="4" y="13.504" rx="3.038" ry="3.038" class="cls1"/>
</g>
<rect width="28.235" height="5.629" x="15.765" y="36.651" rx="2.067" ry="2.067" class="cls1"/>
<rect width="9.112" height="9.069" x="4" y="34.931" rx="3.038" ry="3.038" class="cls1"/>
<g transform="translate(0 .759)">
<rect width="28.235" height="5.629" x="15.765" y="25.582" rx="2.067" ry="2.067" class="cls1"/>
<rect width="9.112" height="9.069" x="4" y="23.862" rx="3.038" ry="3.038" class="cls1"/>
</g>
</svg>`,

	magnify: `${svg24}
<defs><style>.cls1{${noFill}${roundStroke}stroke-width:2.25;}</style></defs>
<circle class="cls1" cx="9" cy="9" r="6"/>
<path class="cls1" style="stroke-width:3.5" d="M14 14l5 5 "/>
<path class="cls1" style="stroke-width:1.25" d="M6 8C5.5 10 7 12 9 12.4"/>
</svg>`,

	maximize: `${svg24}
<path
	style="stroke-width:2px;${roundStroke}${noFill}"
	d="m2 14v8h8m-8 0l6-6m3-3l11-11h-8m8 0v8"
/></svg>`,

	minimize: `${svg24}
<path
	style="stroke-width:2px;${roundStroke}${noFill}"
	d="m14 2v8h8m-8 0l6-6m-16 16l6-6h-8m8 0v8"
>
</svg>`,

	moon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
<path style="${fill}fill-rule:evenodd;" d="M9.978 17.996A8.023 8.023 0 0 1 2.9 13.735C9.102 14.26 14.262 9.118 13.736 2.9a8.024 8.024 0 0 1 4.26 7.078c0 4.421-3.597 8.018-8.018 8.018M10.834 0C14.52 6.917 6.973 14.55 0 10.834.43 15.904 4.683 20 9.978 20 15.513 20 20 15.513 20 9.978 20 4.68 15.901.43 10.834 0"/>
</svg>
`,

	no: `${svg24}
  <path style="${noFill}${roundStroke}stroke-width:4;" d="m5 5l14 14m-14 0l14 -14" transform="matrix(.8 0 -.2 1 5 0)">
</svg>
`,

	offline: `${svg24}
<path style="${fill}" d="M2,14.5c0,1.6,0.9,3.1,2.2,3.9l-0.9,0.9c-0.4,0.4-0.4,1,0,1.4C3.5,20.9,3.7,21,4,21s0.5-0.1,0.7-0.3l14-14   c0.4-0.4,0.4-1,0-1.4s-1-0.4-1.4,0l-1.8,1.8C14.9,7,14.3,7,13.8,7c-0.1-0.2-0.3-0.3-0.4-0.4C12.4,5.6,11,5,9.5,5S6.6,5.6,5.6,6.6   C4.6,7.6,4,9,4,10.5c0,0.1,0,0.2,0,0.3c-0.2,0.2-0.5,0.3-0.7,0.6C2.5,12.2,2,13.3,2,14.5z M4.7,12.7c0.2-0.2,0.5-0.4,0.7-0.5   c0.4-0.2,0.7-0.6,0.6-1.1C6,10.9,6,10.7,6,10.5C6,9.6,6.4,8.7,7,8c1.3-1.3,3.6-1.3,4.9,0c0.2,0.2,0.4,0.4,0.5,0.7   c0.2,0.3,0.6,0.5,1,0.4l-7.7,7.7c-1-0.3-1.7-1.3-1.7-2.4C4,13.8,4.3,13.2,4.7,12.7z"/>
<path style="${fill}" d="M19.6,10.6c-0.2-0.4-0.4-0.8-0.6-1.2c-0.3-0.5-0.9-0.6-1.4-0.3c-0.5,0.3-0.6,0.9-0.3,1.4c0.2,0.3,0.4,0.7,0.5,1   c0.1,0.3,0.3,0.5,0.6,0.7c0.9,0.4,1.5,1.3,1.5,2.3c0,0.7-0.3,1.3-0.7,1.8c-0.5,0.5-1.1,0.7-1.8,0.7H10c-0.6,0-1,0.4-1,1s0.4,1,1,1   h7.5c1.2,0,2.3-0.5,3.2-1.3c0.9-0.8,1.3-2,1.3-3.2C22,12.8,21.1,11.3,19.6,10.6z"/>
</svg>`,

	online: `${svg24}
<path style="${fill}" d="M13.3,16.3L13,16.6V13c0-0.6-0.4-1-1-1s-1,0.4-1,1v3.6l-0.3-0.3c-0.4-0.4-1-0.4-1.4,0s-0.4,1,0,1.4l2,2    c0.1,0.1,0.2,0.2,0.3,0.2C11.7,20,11.9,20,12,20s0.3,0,0.4-0.1c0.1-0.1,0.2-0.1,0.3-0.2l2-2c0.4-0.4,0.4-1,0-1.4    S13.7,15.9,13.3,16.3z"/>
<path style="${fill}" d="M19.6,9.6c-0.3-0.7-0.7-1.4-1.3-1.9c-1.2-1.2-2.9-1.8-4.6-1.6c-0.1-0.2-0.3-0.3-0.4-0.4C12.4,4.6,11,4,9.5,4    S6.6,4.6,5.6,5.6C4.6,6.6,4,8,4,9.5c0,0.1,0,0.2,0,0.3c-0.2,0.2-0.5,0.3-0.7,0.6c-0.9,0.8-1.3,2-1.3,3.2C2,16,4,18,6.5,18    c0.6,0,1-0.4,1-1s-0.4-1-1-1C5.1,16,4,14.9,4,13.5c0-0.7,0.3-1.3,0.7-1.8c0.2-0.2,0.5-0.4,0.7-0.5c0.4-0.2,0.7-0.6,0.6-1.1    C6,9.9,6,9.7,6,9.5C6,8.6,6.4,7.7,7,7c1.3-1.3,3.6-1.3,4.9,0c0.2,0.2,0.4,0.4,0.5,0.7c0.2,0.4,0.7,0.5,1.1,0.4    C13.9,8,14.2,8,14.5,8c0.9,0,1.8,0.4,2.5,1c0.4,0.4,0.7,0.9,0.9,1.5c0.1,0.3,0.3,0.5,0.6,0.7c0.9,0.4,1.5,1.3,1.5,2.3    c0,0.7-0.3,1.3-0.7,1.8c-0.5,0.5-1.1,0.7-1.8,0.7c-0.6,0-1,0.4-1,1s0.4,1,1,1c1.2,0,2.3-0.5,3.2-1.3c0.9-0.8,1.3-2,1.3-3.2    C22,11.8,21.1,10.3,19.6,9.6z"/>
</svg>`,

	quit: `${svg24}
<path style="${noFill}${roundStroke}stroke-width:2px" d="M15 16.5V19a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v3.063M11 12h10m0 0-2.5-2.5M21 12l-2.5 2.5"/>
</svg>`,

	reload: `<?xml version="1.0" encoding="utf-8"?>
<svg viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
<defs>
<style>.stroke{${noFill}${stroke}stroke-miterlimit:10;stroke-width:1.92px;}</style>
</defs>
<path class="stroke" d="M5.88468 17C7.32466 19.1128 9.75033 20.5 12.5 20.5C16.9183 20.5 20.5 16.9183 20.5 12.5C20.5 8.08172 16.9183 4.5 12.5 4.5C8.08172 4.5 4.5 8.08172 4.5 12.5V13.5M12.5 8V12.5L15.5 15.5" />
<path class="stroke" d="M7 11L4.5 13.5L2 11"/>
</svg>`,

	restore: `${svg24}
<defs><style>.cls1{${noFill}${roundStroke}stroke-width:1.5;}</style></defs>
<g transform="rotate(180)" transform-origin="center">
<path class="cls1" d="M4 3v16h1.5m13 0h1.5v-13l-3 -3h-13M8 3l0 5l8 0l0-5M14 5l0 1"/>
<path class="cls1" style="stroke-width:2.5;stroke-linejoin:miter;stroke-linecap:square;transform-origin:50% 16.5px;transform:rotate(180deg)" d="M12 15v5M12 13l1.5 1.5h-3z"/>
</g>
</svg>`,

	settings: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" transform="rotate(90)" viewBox="0 0 24 24">
<path style="${fill}" d="M8 7a1 1 0 0 1 1 1v8a1 1 0 1 1-2 0V8a1 1 0 0 1 1-1ZM17 16V8a1 1 0 1 0-2 0v8a1 1 0 1 0 2 0Z"/>
<path style="${fill}" fill-rule="evenodd" d="M6.444 2A4.444 4.444 0 0 0 2 6.444v11.112A4.444 4.444 0 0 0 6.444 22h11.112A4.444 4.444 0 0 0 22 17.556V6.444A4.444 4.444 0 0 0 17.556 2H6.444Zm11.112 2H6.444A2.444 2.444 0 0 0 4 6.444v11.112A2.444 2.444 0 0 0 6.444 20h11.112A2.444 2.444 0 0 0 20 17.556V6.444A2.444 2.444 0 0 0 17.556 4Z" clip-rule="evenodd"/>
<path style="${stroke}${noFill}" stroke-width="1.176" d="M16 14.75a1.75 1.75 0 1 0 0-3.5 1.75 1.75 0 0 0 0 3.5Zm-8-2a1.75 1.75 0 1 0 0-3.5 1.75 1.75 0 0 0 0 3.5Z"/>
</svg>`,

	tabNew: `${svg24}
<path d="M3 6C3 4.34315 4.34315 3 6 3H18C19.6569 3 21 4.34315 21 6V12.0218C20.3945 11.6341 19.7204 11.3441 19 11.1739V6C19 5.44772 18.5523 5 18 5H6C5.44772 5 5 5.44772 5 6V18C5 18.5523 5.44772 19 6 19H11.1739C11.3441 19.7204 11.6341 20.3945 12.0218 21H6C4.34315 21 3 19.6569 3 18V6Z" fill="var(--svg-color, #212121)"/>
<path d="M23 17.5C23 14.4624 20.5376 12 17.5 12C14.4624 12 12 14.4624 12 17.5C12 20.5376 14.4624 23 17.5 23C20.5376 23 23 20.5376 23 17.5ZM18.0006 18L18.0011 20.5035C18.0011 20.7797 17.7773 21.0035 17.5011 21.0035C17.225 21.0035 17.0011 20.7797 17.0011 20.5035L17.0006 18H14.4961C14.22 18 13.9961 17.7762 13.9961 17.5C13.9961 17.2239 14.22 17 14.4961 17H17.0005L17 14.4993C17 14.2231 17.2239 13.9993 17.5 13.9993C17.7761 13.9993 18 14.2231 18 14.4993L18.0005 17H20.503C20.7792 17 21.003 17.2239 21.003 17.5C21.003 17.7762 20.7792 18 20.503 18H18.0006Z" fill="var(--svg-color, #212121)"/>
</svg>`,

	tabNewIncognito: `${svg24}
	<defs><style>
		.cls-1{${noFill}${stroke}stroke-miterlimit:10;stroke-width:1.92px;}
		.cls-2{${fill}}
	</style></defs>
	<path class="cls-2" d="M3 6C3 4.34315 4.34315 3 6 3H18C19.6569 3 21 4.34315 21 6V12.0218C20.3945 11.6341 19.7204 11.3441 19 11.1739V6C19 5.44772 18.5523 5 18 5H6C5.44772 5 5 5.44772 5 6V18C5 18.5523 5.44772 19 6 19H11.1739C11.3441 19.7204 11.6341 20.3945 12.0218 21H6C4.34315 21 3 19.6569 3 18V6Z" />
	<path class="cls-2" d="M23 17.5C23 14.4624 20.5376 12 17.5 12C14.4624 12 12 14.4624 12 17.5C12 20.5376 14.4624 23 17.5 23C20.5376 23 23 20.5376 23 17.5ZM18.0006 18L18.0011 20.5035C18.0011 20.7797 17.7773 21.0035 17.5011 21.0035C17.225 21.0035 17.0011 20.7797 17.0011 20.5035L17.0006 18H14.4961C14.22 18 13.9961 17.7762 13.9961 17.5C13.9961 17.2239 14.22 17 14.4961 17H17.0005L17 14.4993C17 14.2231 17.2239 13.9993 17.5 13.9993C17.7761 13.9993 18 14.2231 18 14.4993L18.0005 17H20.503C20.7792 17 21.003 17.2239 21.003 17.5C21.003 17.7762 20.7792 18 20.503 18H18.0006Z"/>
	<g transform-origin="12 12" transform="scale(.5) translate(-3 -4)">
	<polyline class="cls-1" points="0.5 11.04 12 11.04 23.5 11.04"/>
	<path class="cls-1" d="M19.67,11H4.33L5,4.68A2.54,2.54,0,0,1,7.57,2.42h0a2.47,2.47,0,0,1,1.13.27h0a7.43,7.43,0,0,0,6.6,0h0a2.47,2.47,0,0,1,1.13-.27h0A2.54,2.54,0,0,1,19,4.68Z"/>
	<circle class="cls-1" cx="6.73" cy="18.23" r="3.35"/>
	<circle class="cls-1" cx="17.27" cy="18.23" r="3.35"/>
	<path class="cls-1" d="M10.08,18.71a1.92,1.92,0,1,1,3.84,0"/>
	<line class="cls-1" x1="1.46" y1="15.83" x2="4.33" y2="15.83"/>
	<line class="cls-1" x1="19.67" y1="15.83" x2="22.54" y2="15.83"/>
	</g>
	</svg>`,

	save: `${svg24}
<defs><style>.cls1{${noFill}${roundStroke}stroke-width:1.5;}</style></defs>
<g transform="rotate(180)" transform-origin="center">
<path class="cls1" d="M4 3v16h4m8 0h4v-13l-3 -3h-13M8 3l0 5l8 0l0-5M14 5l0 1"/>
<path class="cls1" style="stroke-width:2.5;stroke-linejoin:miter;stroke-linecap:square" d="M12 15v5M12 13l1.5 1.5h-3z"/>
</g>
</svg>`,

	get search() {
		return this.magnify
	},

	sun: `${svg24}
<style>.cls1{${noFill}stroke-width:2;${roundStroke}stroke-miterlimit:10}</style>
<circle cx="12" cy="12" r="5" class="cls1"/>
<path d="m12 2v4m0,12v4 m-10-10h4m12 0h4m-4 6 l2 2m-16 0l2-2 m0-12l-2-2m16 0l-2 2" class="cls1"/>
</svg>`,
	get x() {
		return this.no
	},
	github: `<svg  viewBox="0 0 98 96" xmlns="http://www.w3.org/2000/svg"><path  style="fill:var(--svg-color,#24292f)" fill-rule="evenodd" clip-rule="evenodd" d="M48.854 0C21.839 0 0 22 0 49.217c0 21.756 13.993 40.172 33.405 46.69 2.427.49 3.316-1.059 3.316-2.362 0-1.141-.08-5.052-.08-9.127-13.59 2.934-16.42-5.867-16.42-5.867-2.184-5.704-5.42-7.17-5.42-7.17-4.448-3.015.324-3.015.324-3.015 4.934.326 7.523 5.052 7.523 5.052 4.367 7.496 11.404 5.378 14.235 4.074.404-3.178 1.699-5.378 3.074-6.6-10.839-1.141-22.243-5.378-22.243-24.283 0-5.378 1.94-9.778 5.014-13.2-.485-1.222-2.184-6.275.486-13.038 0 0 4.125-1.304 13.426 5.052a46.97 46.97 0 0 1 12.214-1.63c4.125 0 8.33.571 12.213 1.63 9.302-6.356 13.427-5.052 13.427-5.052 2.67 6.763.97 11.816.485 13.038 3.155 3.422 5.015 7.822 5.015 13.2 0 18.905-11.404 23.06-22.324 24.283 1.78 1.548 3.316 4.481 3.316 9.126 0 6.6-.08 11.897-.08 13.526 0 1.304.89 2.853 3.316 2.364 19.412-6.52 33.405-24.935 33.405-46.691C97.707 22 75.788 0 48.854 0z"/></svg>`,
}
