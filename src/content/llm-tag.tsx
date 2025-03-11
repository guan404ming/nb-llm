/**
 * LLM Tag Replacer
 * 
 * This script detects and replaces special tags in LLM outputs with interactive components.
 * Designed to be extensible for different types of components.
 * Currently supports <<collapse>> tags for collapsible content.
 */

import highlightProcessor from "./TagProcessors/HighlightTagProcessors";
import collapseProcessor from "./TagProcessors/CollapseTagProcessors";
import TagProcessor from "./TagProcessors/TagProcessorsBase";

// ======== Utility Functions ========

/**
 * Logs debug messages to the console
 */
function debugLog(...args: unknown[]): void {
  console.log('[LLM Tag Replacer]', ...args);
}

// ======== Tag Processor Registry ========

/**
 * Registry of all tag processors
 */
const tagProcessors: TagProcessor[] = [
  collapseProcessor,
  highlightProcessor,
  // Add more processors here in the future
];

// ======== Content Processing Functions ========

/**
 * Processes an element to replace tags with interactive components
 */
function processContent(element: Element): void {
  const text = element.textContent || '';

  // Check if any processor might handle this element
  if (!tagProcessors.some(processor => processor.containsTag(text))) {
    return;
  }

  // For each processor, check if the text contains complete tag pairs
  // before processing
  let shouldProcess = false;
  tagProcessors.forEach(processor => {
    const openTag = `<<${processor.tagName}>>`;
    const closeTag = `<<${processor.tagName}>>`;
    const altCloseTag = `<<${processor.tagName}s>>`; // Handle potential typos
    
    // Count opening and closing tags
    const openCount = (text.match(new RegExp(openTag, 'g')) || []).length;
    const closeCount = (text.match(new RegExp(closeTag, 'g')) || []).length;
    const altCloseCount = (text.match(new RegExp(altCloseTag, 'g')) || []).length;
    
    // Only process if we have matching pairs
    if (openCount > 0 && (openCount <= closeCount + altCloseCount)) {
      shouldProcess = true;
    }
  });

  if (!shouldProcess) {
    return;
  }

  // Get all text nodes within the element
  const textNodes: Node[] = [];
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, null);

  let node = walker.nextNode();
  while (node) {
    textNodes.push(node);
    node = walker.nextNode();
  }

  // If there are no text nodes, return
  if (textNodes.length === 0) return;

  // Concatenate all text content
  const fullText = textNodes.map((node_) => node_.textContent).join('');
  
  // Process the full text with all processors
  let processedText = fullText;
  let wasProcessed = false;
  
  // Use array methods instead of for loops
  tagProcessors.forEach(processor => {
    if (processor.containsTag(processedText)) {
      const result = processor.processText(processedText);
      if (result !== processedText) {
        processedText = result;
        wasProcessed = true;
      }
    }
  });

  // If the text was changed, update the element
  if (wasProcessed) {

    // Create a temporary container
    const tempContainer = document.createElement('div');
    tempContainer.innerHTML = processedText;

    // Clear the original element
    while (element.firstChild) {
      element.removeChild(element.firstChild);
    }

    // Move the new content to the original element
    while (tempContainer.firstChild) {
      element.appendChild(tempContainer.firstChild);
    }
    
    // Enhance elements with all processors using array methods
    tagProcessors.forEach(processor => {
      if (processor.enhanceElements) {
        processor.enhanceElements(element);
      }
    });
  }
}

// ======== Style Injection ========

/**
 * Injects required styles for the components
 */
function injectStyles(): void {
  // Add Tailwind CSS
  const tailwindLink = document.createElement('link');
  tailwindLink.rel = 'stylesheet';
  tailwindLink.href = 'https://cdn.tailwindcss.com';
  document.head.appendChild(tailwindLink);
}

// ======== DOM Observation ========

/**
 * Sets up a MutationObserver to watch for DOM changes
 */
function setupMutationObserver(): void {
  const observer = new MutationObserver((mutations: MutationRecord[]) => {
    mutations.forEach((mutation) => {
      if (mutation.target instanceof Element) {
        const pElements = mutation.target as Element;
        pElements.querySelectorAll('p[data-start], p[data-end]').forEach(p => {
          processContent(p);
        });
      } else if (mutation.type === 'childList') {
        mutation.addedNodes.forEach(node => {
          if (node instanceof Element) {
            node.querySelectorAll('p[data-start], p[data-end]').forEach(p => {
              processContent(p);
            });
          }
        });
      }
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: false,
    characterData: true,
  });
}

/**
 * Processes existing content on the page
 */
function processExistingContent(): void {
  document
    .querySelectorAll('p[data-is-last-node], p[data-is-only-node]')
    .forEach(processContent);
}

// ======== Initialization ========

// Inject required styles
injectStyles();

// Set up mutation observer
setupMutationObserver();

// Process existing content
processExistingContent();

debugLog('NB-LLM initialized');
