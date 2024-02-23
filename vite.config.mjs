import { resolve } from "path"
import { viteStaticCopy } from "vite-plugin-static-copy"
/** @type {import('vite').UserConfig} */
export default {
	root: "src",
	build: {
		target: "esnext",
		polyfillDynamicImport: false,
		outDir: resolve(__dirname, "dist"),
		assetsDir: "assets",
		rollupOptions: {
			input: {
				options: "src/options.html",
				session: "src/session.html",
				discarded: "src/discarded.html",
			},
		},
	},
	plugins: [
		viteStaticCopy({
			targets: [
				{ src: "tabplus-worker.js", dest: "./" },
				{ src: "manifest.json", dest: "./" },
				{ src: "_locales", dest: "./" },
				{ src: "icon.png", dest: "./" },
				{ src: "assets/logo/", dest: "./assets/" },
			],
		}),
	],
}
