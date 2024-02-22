#!/usr/bin/env node

//load the locales from the locales folder
//and check if all the keys are present in all the locales
//and if all the keys are present in the default locale
//if not, log the missing keys and the locales they are missing from
const fs = require("fs")
const path = require("path")

const localesPath = path.join(__dirname, "..", "_locales")
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

// print all keys with each locale either in green if key exists or red if it doesn't
const allGreenStatus = localesAvailable.map((lc) => `\x1b[32m${lc}\x1b[0m`).join(" ")
for (const key in commonKeys) {
	console.log(allGreenStatus, key)
}
for (const key in uncommonKeys) {
	const status = localesAvailable
		.map((lc) => (localesKeys[lc].includes(key) ? `\x1b[32m${lc}\x1b[0m` : `\x1b[31m${lc}\x1b[0m`))
		.join(" ")
	console.log(status, key, `(dflt: "${dfltLocaleData[key]?.message || "MISSING"}")`)
}

if (Object.keys(uncommonKeys).length) process.exit(1)
else process.exit(0)
