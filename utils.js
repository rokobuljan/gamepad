/**
 * Create an HTML element and assign its initial properties.
 * @template {keyof HTMLElementTagNameMap} K
 * @param {K} tag HTML tag name.
 * @param {Partial<HTMLElementTagNameMap[K]>} [prop] Initial element properties.
 * @returns {HTMLElementTagNameMap[K]}
 */
export const elNew = (tag, prop) => Object.assign(document.createElement(tag), prop);
/**
 * Find the first matching element within a parent (or the document).
 * @template {Element} [T=Element]
 * @param {string} sel CSS selector.
 * @param {ParentNode | null} [PAR] Search root.
 * @returns {T | null}
 */
export const el = (sel, PAR) => (PAR || document).querySelector(sel);
/** A full turn in radians. @type {number} */
export const TAU = Math.PI * 2;
/**
 * Normalize an angle to the interval [0, TAU).
 * @param {number} rad Angle in radians.
 * @returns {number}
 */
export const norm = (rad) => rad - TAU * Math.floor(rad / TAU);
/**
 * Blend angles through their unit vectors; return an angle in [-PI, PI].
 * @param {number} A Starting angle in radians.
 * @param {number} B Ending angle in radians.
 * @param {number} w Blend weight, normally between 0 and 1.
 * @returns {number}
 */
export const lerpAngles = (A, B, w) => {
    const CS = (1 - w) * Math.cos(A) + w * Math.cos(B);
    const SN = (1 - w) * Math.sin(A) + w * Math.sin(B);
    return Math.atan2(SN, CS);
};