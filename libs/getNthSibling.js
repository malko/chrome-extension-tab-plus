//@ts-check
/*
Copyright © 2024 Jonathan Gotti <jgotti at jgotti dot org>
SPDX-FileType: SOURCE
SPDX-License-Identifier: MIT
SPDX-FileCopyrightText: 2024 Jonathan Gotti <jgotti@jgotti.org>
*/
/**
 * @typedef {HTMLElement | Element | EventTarget} Elmt
 * -------------------------------------
 * @typedef {Object} GetNthSiblingParams
 * @property {Elmt} elmt
 * @property {number} [nth]
 * @property {'nextElementSibling' | 'previousElementSibling'} accessor
 * @property {string} [selector]
 * -------------------------------------
 * @typedef {Object} GetNthMatchingSiblingParams
 * @property {Elmt} elmt
 * @property {number} [nth]
 * @property {'nextElementSibling' | 'previousElementSibling'} accessor
 * @property {string} selector
 * -------------------------------------
 * @typedef {Object} GetNthNextSiblingParams
 * @property {Elmt} elmt
 * @property {number} [nth]
 * @property {string} [selector]
 * -------------------------------------
 * @typedef {Object} GetNthPrevSiblingParams
 * @property {Elmt} elmt
 * @property {number} [nth]
 * @property {string} [selector]
 * -------------------------------------
 * @typedef {Object} GetNthNextMatchingSiblingParams
 * @property {Elmt} elmt
 * @property {string} selector
 * @property {number} [nth]
 * -------------------------------------
 * @typedef {Object} GetNthPrevMatchingSiblingParams
 * @property {Elmt} elmt
 * @property {string} selector
 * @property {number} [nth]
 * -------------------------------------
 * @typedef {Object} GetLastMatchingSiblingParams
 * @property {Elmt} elmt
 * @property {string} selector
 * @property {boolean} [includeSelf] default to true
 * -------------------------------------
 */

/**
 * get nth prev/next sibling that match the given selector (or any if not provided)
 * it will stop on any sibling not matching the selector
 * @param {GetNthSiblingParams} params
 * @returns {HTMLElement|null}
 */
const getNthSibling = ({ elmt, nth = 1, accessor, selector = null }) => {
	if (nth === 0) {
		return /**@type{HTMLElement}*/ (elmt)
	}
	const next = elmt instanceof HTMLElement ? elmt[accessor] : null
	if (next) {
		if (!selector || next.matches(selector)) {
			return getNthSibling({ elmt: next, nth: --nth, selector, accessor })
		}
	}
	return null
}

/**
 * get nth prev/next sibling that match the given selector (ignoring any sibling not matching the selector)
 * @param {GetNthMatchingSiblingParams} params
 * @returns {HTMLElement|null}
 */
const getNthMatchingSibling = ({ elmt, nth = 1, accessor, selector }) => {
	if (nth === 0) {
		return /**@type{HTMLElement}*/ (elmt)
	}
	const next = elmt instanceof HTMLElement ? elmt[accessor] : null
	if (!next) {
		return null
	}
	return getNthMatchingSibling({
		elmt: next,
		nth: next.matches(selector) ? --nth : nth,
		selector,
		accessor,
	})
}

/**
 * Return nth next sibling from given Element.
 * if selector is passed then all siblings must match the filter.
 * return the nth sibling or null if not found or any siblings in between doesn't match the filter
 * @param {GetNthNextSiblingParams} params
 * @returns {HTMLElement|null}
 */
export const getNthNextSibling = ({ elmt, nth = 1, selector = null }) =>
	getNthSibling({ elmt, nth, selector, accessor: "nextElementSibling" })

/**
 * same as getNthNextSibling but in reverse order
 * @param {GetNthPrevSiblingParams} params
 */
export const getNthPrevSibling = ({ elmt, nth = 1, selector = null }) =>
	getNthSibling({
		elmt,
		nth,
		selector,
		accessor: "previousElementSibling",
	})

/**
 * Return the nth next sibling from given Element counting only elements that match selector.
 * @param {GetNthNextMatchingSiblingParams} params
 * @returns {HTMLElement|null}
 */
export const getNthNextMatchingSibling = ({ elmt, selector, nth = 1 }) =>
	getNthMatchingSibling({
		elmt,
		nth,
		selector,
		accessor: "nextElementSibling",
	})

/**
 * Return the nth prev sibling from given Element counting only elements that match selector .
 * @param {GetNthPrevMatchingSiblingParams} params
 * @returns {HTMLElement|null}
 */
export const getNthPrevMatchingSibling = ({ elmt, selector, nth = 1 }) =>
	getNthMatchingSibling({
		elmt,
		nth,
		selector,
		accessor: "previousElementSibling",
	})

/**
 * Return the last sibling from given Element counting only elements that match selector.
 * @param {GetLastMatchingSiblingParams} params
 * @returns {HTMLElement|null}
 */
export const getLastMatchingSibling = ({ elmt, selector, includeSelf = true }) => {
	const parent = /**@type {HTMLElement}*/ (elmt)?.parentElement
	const last = /**@type {HTMLElement}*/ ([...parent?.querySelectorAll(selector)].at(-1)) || null
	return includeSelf ? last : last !== elmt ? last : null
}

/**
 * Return the last child from given Element.
 * @param {Elmt} elmt
 * @param {string} [selector] if provided, return the last child matching the selector
 * @returns {HTMLElement|null}
 */
export const getLastChild = (elmt, selector = undefined) => {
	if (!(elmt instanceof HTMLElement)) return null
	const children = selector ? elmt?.querySelectorAll(":scope>" + selector.replace(/,/g, ", :scope>")) : elmt?.children
	return /**@type{HTMLElement}*/ (children[children.length - 1]) || null
}
