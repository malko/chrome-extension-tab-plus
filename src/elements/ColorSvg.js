//@ts-check
import { SVGs } from "../assets/svgs.js"

export class ColorSvg extends HTMLElement {
	/**
	 *
	 * @param {{name?:string, size?:string, color?:string}} [param0]
	 */
	constructor({ name, size, color } = {}) {
		super()
		name || (name = this.getAttribute("name"))
		if (!name || !(name in SVGs)) {
			name = "broken"
		}
		this.attachShadow({ mode: "open" })
		this.shadowRoot.innerHTML = /*html*/ `
    <style>
      :host {
        --svg-color: currentColor;
        display:inline-flex;
        align-self:center;
        width: ${size || this.getAttribute("size") || "1rem"};
        line-height:${size || this.getAttribute("size") || "1rem"};
        margin:0 .2rem;
        padding:0;
      }
      svg {
        width: 100%;
        height: 100%;
      }
    </style>
    ${SVGs[name]}`
		color || (color = this.getAttribute("color"))
		color && this.style.setProperty("--svg-color", color)
	}
}

customElements.define("color-svg", ColorSvg)
