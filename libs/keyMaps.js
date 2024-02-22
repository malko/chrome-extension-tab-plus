//@ts-check
/*
Copyright © 2024 Jonathan Gotti <jgotti at jgotti dot org>
SPDX-FileType: SOURCE
SPDX-License-Identifier: MIT
SPDX-FileCopyrightText: 2024 Jonathan Gotti <jgotti@jgotti.org>
*/
/**
 * @typedef {Object} KeyMapOptions
 * @property {boolean} [preventDefault]
 * @property {boolean} [stopPropagation]
 * -------------------------------------
 * @typedef {(event:KeyboardEvent)=>void} KeyboardEventHandler
 */
const keyAliases = {
	" ": "Space",
}
/**
 * @param {KeyboardEvent} event
 * @returns
 */
const getEventKey = (event) => {
	if (event.key.match(/^(Control|Shift|Meta|Alt)$/)) {
		return ""
	}
	return `${event.ctrlKey ? "Ctrl+" : ""}${event.altKey ? "Alt+" : ""}${event.metaKey ? "Meta+" : ""}${
		event.shiftKey ? "Shift+" : ""
	}${event.key}`
}
/**
 * Return a KeyboardEventHandler calling handler in the map corresponding to given event.Key.
 * It can take KeyMapOptions as second parameters.
 * @example
 * ```
 * const handler = keyMap({
 *  Escape: () => alert("escape"),
 *  " ": () => alert("space"),
 *  ArrowDown: () => alert('ArrowDown')
 * })
 * ```
 * @param {Record<string, KeyboardEventHandler>} map
 * @param {KeyMapOptions} [options]
 * @returns {KeyboardEventHandler}
 */
export const keyMap =
	(map, options = {}) =>
	(event) => {
		const key = getEventKey(event)
		const handler = map[key] || (keyAliases[key] && map[keyAliases[key]])
		if (handler) {
			handler(event)
			options.preventDefault && event.preventDefault()
			options.stopPropagation && event.stopPropagation()
		}
	}
