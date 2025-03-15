import '../assets/styles/index.css'

/**
 * LLM Tag Replacer
 * 
 * This script detects and replaces special tags in LLM outputs with interactive components.
 * Designed to be extensible for different types of components.
 */

import highlightProcessor from "./TagProcessors/HighlightTagProcessor";
import hideAndSeeProcessor from "./TagProcessors/HideAndSeeTagProcessor";
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
  highlightProcessor,
  hideAndSeeProcessor,
  // Add more processors here in the future
];

// ======== Content Processing Functions ========

/**
 * Processes an element to replace tags with interactive components
 */
function processContent(element: Element): void {
  const text = element.textContent || '';

  if (!tagProcessors.some(processor => processor.containsTag(text))) return;

  // Check if the text contains any tags

  let shouldProcess = false;
  tagProcessors.forEach(processor => {
    const tag = `<<${processor.tagName}>>`;
    const tagCount = (text.match(new RegExp(tag, 'g')) || []).length;
    shouldProcess = shouldProcess || (tagCount > 0 && tagCount % 2 === 0);
  });

  if (!shouldProcess) return;

  // Traverse the DOM to get all text nodes

  const textNodes: Node[] = [];
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, null);

  let node = walker.nextNode();
  while (node) {
    textNodes.push(node);
    node = walker.nextNode();
  }

  if (textNodes.length === 0) return;

  // Join all text nodes into a single string

  const fullText = textNodes.map((node_) => node_.textContent).join('');
  
  let processedText = fullText;
  let wasProcessed = false;
  
  tagProcessors.forEach(processor => {
    if (processor.containsTag(processedText)) {
      const result = processor.processText(processedText);
      if (result !== processedText) {
        processedText = result;
        wasProcessed = true;
      }
    }
  });

  if (!wasProcessed) return;
  
  // Replace the element's content with the processed text
  const tempContainer = document.createElement('div');
  tempContainer.innerHTML = processedText;
  
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }

  while (tempContainer.firstChild) {
    element.appendChild(tempContainer.firstChild);
  }

  // Enhance the element with the tag processors
  tagProcessors.forEach(processor => {
    if (processor.enhanceElements) {
      processor.enhanceElements(element);
    }
  });
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
          debugLog("ACTIVATED 1")
        });
      } else if (mutation.type === 'childList') {
        mutation.addedNodes.forEach(node => {
          if (node instanceof Element) {
            node.querySelectorAll('p[data-start], p[data-end]').forEach(p => {
              processContent(p);
              debugLog("ACTIVATED 2")
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

// Set up mutation observer
setupMutationObserver();

// Process existing content
processExistingContent();

debugLog('NB-LLM initialized');
