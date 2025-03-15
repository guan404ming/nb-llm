import type TagProcessor from './TagProcessorsBase';

/**
 * Generates a unique ID for DOM elements
 */
function generateUniqueId(): string {
  return `element-${Math.random().toString(36).substring(2, 11)}`;
}

function containsTag(text: string, TagProcessor: TagProcessor): boolean {
  return text.includes(`<<${TagProcessor.tagName}>>`);
}

function processText(text: string, TagProcessor: TagProcessor): string {
  return text.replace(
    new RegExp(
      `<<${TagProcessor.tagName}>>(.*?)<<${TagProcessor.tagName}>>`,
      'gi'
    ),
    (_, content) => TagProcessor.createElement(content)
  );
}

export { generateUniqueId, containsTag, processText };
