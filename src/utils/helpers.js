/**
 * Utility functions for SmartVenue AI
 */

/**
 * Safely sets text content to an element to prevent XSS.
 * @param {string} id - The element ID.
 * @param {string} text - The text to set.
 */
export function safeSetText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
}

/**
 * Formats data for accessibility (ARIA labels).
 * @param {number} value - The numeric value.
 * @param {string} unit - The unit (e.g., 'minutes').
 */
export function formatAriaValue(value, unit) {
    return `${value} ${unit}`;
}

/**
 * Sanitizes log messages.
 * @param {string} msg - Raw message.
 * @returns {string} - Sanitized message.
 */
export function sanitize(msg) {
    const div = document.createElement('div');
    div.textContent = msg;
    return div.innerHTML;
}
