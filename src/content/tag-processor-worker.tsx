import '../assets/styles/index.css';

import hideAndSeeProcessor from './TagProcessors/HideAndSeeTagProcessor';
/**
 * LLM Tag Replacer
 *
 * This script detects and replaces special tags in LLM outputs with interactive components.
 * Designed to be extensible for different types of components.
 */

import highlightProcessor from './TagProcessors/HighlightTagProcessor';
import TagProcessor from './TagProcessors/TagProcessorsBase';
import { containsTag, processText } from './TagProcessors/utils';

// ======== Utility Functions ========

/**
 * Logs debug messages to the console
 */
function debugLog(...args: unknown[]): void {
  // eslint-disable-next-line no-console
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

  if (!tagProcessors.some((processor) => containsTag(text, processor))) return;

  const fullText = [];
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, null);

  let node = walker.nextNode();
  const processedNode: Node[] = [];
  while (node) {
    if (
      node.parentNode &&
      (node.parentElement as Element).classList.contains('processed') &&
      !(node.parentElement as Element).classList.contains('processed-child') &&
      !processedNode.includes(node.parentNode)
    ) {
      processedNode.push(node.parentNode);
      fullText.push((node.parentNode as Element).outerHTML);
    }

    if (
      !(node.parentElement as Element).classList.contains('processed') &&
      !(node.parentElement as Element).classList.contains('processed-child')
    ) {
      fullText.push(node.textContent);
    }

    node = walker.nextNode();
  }

  if (fullText.length === 0) return;

  let processedText = fullText.join('');
  let wasProcessed = false;

  tagProcessors.forEach((processor) => {
    if (containsTag(processedText, processor)) {
      const result = processText(processedText, processor);
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
  tagProcessors.forEach((processor) => {
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
        pElements
          .querySelectorAll('p[data-start], p[data-end]')
          .forEach((p) => {
            processContent(p);
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

// ======== Initialization ========

// Set up mutation observer
setupMutationObserver();

debugLog('NB-LLM initialized');
