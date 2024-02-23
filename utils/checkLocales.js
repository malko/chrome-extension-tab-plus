#!/usr/bin/env node
const displayHelp = process.argv.includes("--help") || process.argv.includes("-h")
const displayAll = process.argv.includes("--all") || process.argv.includes("-a")
const displayColors = process.argv.includes("--colors") || process.argv.includes("-c")
if (displayHelp) {
	console.log("Usage: checkLocales.js [--all|-a] [--help|-h]")
	console.log("  --all|-a  Display all keys, not just the ones missing in some locales")
	console.log("  --help|-h Display this help message")
	console.log("  --colors|-c Display ANSI colors")
	process.exit(0)
}

const fs = require("fs")
const path = require("path")

const localesPath = path.join(__dirname, "..", "src", "_locales")
const localesAvailable = fs.readdirSync(localesPath)
const dfltLocale = "en"
let dfltLocaleData

const localesKeys = {}
for (const locale of localesAvailable) {
	const localePath = path.join(localesPath, locale, "messages.json")
	const localeData = JSON.parse(fs.readFileSync(localePath, "utf8"))
	if (locale === dfltLocale) dfltLocaleData = localeData
	localesKeys[locale] = Object.keys(localeData)
}

// check keys that exists in all locales
const commonKeys = {}
const uncommonKeys = {}
localesAvailable.forEach((locale) => {
	for (const key of localesKeys[locale]) {
		if (localesAvailable.every((lc) => lc === locale || localesKeys[lc].includes(key))) {
			commonKeys[key] = true
		} else {
			if (!uncommonKeys[key]) uncommonKeys[key] = []
			uncommonKeys[key].push(locale)
		}
	}
})

const color = (code) => (s) => displayColors ? `\x1b[${code}m${s}\x1b[0m` : s
const red = color(31)
const green = color(32)

// print all keys with each locale either in green if key exists or red if it doesn't
if (displayAll) {
	const allGreenStatus = localesAvailable.map((lc) => green(lc + " ")).join(" ")
	for (const key in commonKeys) {
		console.log(allGreenStatus, key)
	}
}
for (const key in uncommonKeys) {
	const status = localesAvailable
		.map((lc) => (localesKeys[lc].includes(key) ? green(lc + " ") : red(lc + "?")))
		.join(" ")
	console.log(status, key, `(dflt: "${dfltLocaleData[key]?.message || "MISSING"}")`)
}

if (Object.keys(uncommonKeys).length) process.exit(1)
else process.exit(0)
