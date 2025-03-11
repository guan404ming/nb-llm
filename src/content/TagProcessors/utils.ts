/**
 * Generates a unique ID for DOM elements
 */
function generateUniqueId(): string {
    return `element-${Math.random().toString(36).substring(2, 11)}`;
}

export default generateUniqueId;