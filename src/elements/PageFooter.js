export class PageFooter extends HTMLElement {
	constructor() {
		super()
		this.attachShadow({ mode: "open" })
		this.shadowRoot.innerHTML = /*html*/ `
		<style>
			:host{
				display: flex;
				margin-top: auto;
				justify-content: space-evenly;
				padding:1rem;
				align-items: center;
				gap: 1rem;
				flex-wrap: wrap;
			}
			:host > span {
				display: inline-flex;
				justify-content: flex-start;
				align-items: center;
				gap: .2rem;
			}
			a {
				color: orange;
				text-decoration: none;
			}
			a:hover {
				text-decoration: underline;
			}
			[name="github"] {
				--svg-color: #24292f;
			}
			:host-context(.dark) [name="github"] {
				--svg-color: #fff;
			}
		</style>
			<span>Made with <span style="color:red">❤</span> by <a href="https://github.com/malko" target="_blank">malko</a></span>
			<span>Report issues <a href="https://github.com/malko/chrome-extension-tab-plus/issues">here</a></span>
			<span><color-svg name="github"></color-svg>Contribute to <a href="https://github.com/malko/chrome-extension-tab-plus" target="_blank">the project</a></span>
			<span>Find this extension useful, you can <a href="https://github.com/sponsors/malko?frequency=one-time" target="_blank">sponsor my work</a></span>
		`
	}
}

customElements.define("page-footer", PageFooter)
