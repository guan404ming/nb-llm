import type TagProcessor from './TagProcessorsBase';

/**
 * Generates a unique ID for DOM elements
 */
function generateUniqueId(): string {
  return `element-${Math.random().toString(36).substring(2, 11)}`;
}

function containsTag(text: string, TagProcessor: TagProcessor): boolean {
  return (
    text.includes(`<<${TagProcessor.tagName}>>`) ||
    (text.includes(`<${TagProcessor.tagName}>>`) && text.includes(`<<${TagProcessor.tagName}>>`)) ||
    text.includes(`<>`) && text.includes(`<<${TagProcessor.tagName}>>`)
  );
}

function processText(text: string, TagProcessor: TagProcessor): string {
  // Case 1: Full opening and closing tags: <<tag>>content<<tag>>
  const fullTagPattern = new RegExp(
    `<<${TagProcessor.tagName}>>(.*?)<<${TagProcessor.tagName}>>`,
    'gi'
  );
  
  // Case 2: Single bracket opening, full closing: <tag>>content<<tag>>
  const singleOpeningBracketPattern = new RegExp(
    `<${TagProcessor.tagName}>>(.*?)<<${TagProcessor.tagName}>>`,
    'gi'
  );

  // Case 3: Generic opening <> with specific tag closing: <>content<<tag>>
  const genericOpeningPattern = new RegExp(
    `<>(.*?)<<${TagProcessor.tagName}>>`,
    'gi'
  );

  // case 4: Generic opening <> with specific tag closing: <tag>>content<>
  const genericClosingPattern = new RegExp(
    `<<${TagProcessor.tagName}>>(.*?)<>`,
    'gi'
  );

  // Process each pattern in sequence
  return text
    .replace(fullTagPattern, (_, content) => TagProcessor.createElement(content))
    .replace(singleOpeningBracketPattern, (_, content) => TagProcessor.createElement(content))
    .replace(genericOpeningPattern, (_, content) => TagProcessor.createElement(content))
    .replace(genericClosingPattern, (_, content) => TagProcessor.createElement(content));
}

export { generateUniqueId, containsTag, processText };
