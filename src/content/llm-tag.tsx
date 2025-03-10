/**
 * LLM Tag Replacer
 * 
 * This script detects and replaces special tags in LLM outputs with interactive components.
 * Designed to be extensible for different types of components.
 * Currently supports <<collapse>> tags for collapsible content.
 */

// ======== Utility Functions ========

/**
 * Logs debug messages to the console
 */
function debugLog(...args: unknown[]): void {
  console.log('[LLM Tag Replacer]', ...args);
}

/**
 * Generates a unique ID for DOM elements
 */
function generateUniqueId(): string {
  return `element-${Math.random().toString(36).substring(2, 11)}`;
}

// ======== Tag Processor Interface ========

/**
 * Interface for tag processors
 */
interface TagProcessor {
  /**
   * Name of the tag this processor handles
   */
  tagName: string;
  
  /**
   * Checks if the text contains this processor's tag
   */
  containsTag(text: string): boolean;
  
  /**
   * Processes text to replace tags with HTML elements
   */
  processText(text: string): string;
  
  /**
   * Enhances elements after they've been added to the DOM
   */
  enhanceElements(container: Element): void;
  
  /**
   * Creates an HTML element string from the tag content
   */
  createElement(content: string): string;
}

// ======== Collapse Tag Processor ========

/**
 * Processor for collapse tags
 */
const collapseProcessor: TagProcessor = {
  tagName: 'collapse',
  
  containsTag(text: string): boolean {
    return text.includes(`<<${this.tagName}>`);
  },
  
  processText(text: string): string {
    // Pattern: <<collapse>>title<<collapse>>
    // Use 'g' flag to replace all occurrences, not just the first one
    return text.replace(
      new RegExp(`<<${this.tagName}>>(.*?)<<${this.tagName}>>`, 'gi'),
      (_, title) => this.createElement(title)
    );
  },
  
  enhanceElements(container: Element): void {
    // Add click event listeners to make the entire title area clickable
    const collapseElements = container.querySelectorAll('.collapse-title');
    collapseElements.forEach(collapseTitle => {
      collapseTitle.addEventListener('click', () => {
        // Find the associated input element and toggle it
        const collapseContainer = collapseTitle.closest('.collapse');
        if (collapseContainer) {
          const input = collapseContainer.querySelector('input');
          if (input) {
            input.checked = !input.checked;
          }
        }
      });
    });
  },
  
  createElement(title: string): string {
    const collapseId = generateUniqueId();
    
    return `
      <div class="collapse collapse-arrow bg-base-200 rounded-md my-2">
        <input type="radio" name="collapse-${collapseId}" /> 
        <div class="collapse-title text-base font-medium">
          ${title}
        </div>
        <div class="collapse-content"> 
          <p>Click to see more details</p>
        </div>
      </div>
    `;
  }
};

// ======== Tag Processor Registry ========

/**
 * Registry of all tag processors
 */
const tagProcessors: TagProcessor[] = [
  collapseProcessor,
  // Add more processors here in the future
];

// ======== Content Processing Functions ========

/**
 * Processes an element to replace tags with interactive components
 */
function processContent(element: Element): void {
  // Skip if this element is already a collapse or contains collapses
  if (
    element.classList?.contains('collapse') || 
    element.querySelector('.collapse')
  ) {
    return;
  }

  // Check if any processor might handle this element
  if (!tagProcessors.some(processor => processor.containsTag(element.textContent || ''))) {
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
    debugLog('Replacing tags in element');

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
      processor.enhanceElements(element);
    });
  }
}

/**
 * Processes a node to find and handle elements with tags
 */
function processNode(node: Node): void {
  // Only process element nodes
  if (node.nodeType !== Node.ELEMENT_NODE) return;

  const element = node as Element;
  
  // Skip if this element is a collapse or contains collapses
  if (element.classList?.contains('collapse') || element.querySelector('.collapse')) {
    return;
  }

  // Check if this is a p element that might contain tags
  if (
    element.nodeName === 'P' &&
    (element.hasAttribute('data-is-last-node') ||
      element.hasAttribute('data-is-only-node'))
  ) {
    processContent(element);
  }

  // Look for p elements within this node
  const pElements = element.querySelectorAll(
    'p[data-is-last-node], p[data-is-only-node]'
  );
  
  // Filter out elements that are or contain collapses
  pElements.forEach(p => {
    if (!p.classList?.contains('collapse') && !p.querySelector('.collapse')) {
      processContent(p);
    }
  });
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
  
  // Add DaisyUI
  const daisyLink = document.createElement('link');
  daisyLink.rel = 'stylesheet';
  daisyLink.href = 'https://cdn.jsdelivr.net/npm/daisyui@4.9.0/dist/full.css';
  document.head.appendChild(daisyLink);
  
  // Add custom styles
  const customStyles = document.createElement('style');
  customStyles.textContent = `
    .collapse-title {
      cursor: pointer;
      user-select: none;
    }
    
    .collapse-arrow .collapse-title:after {
      top: 50%;
      right: 1.4rem;
      transform: translateY(-50%);
      transition: all 0.3s ease;
    }
    
    .collapse-arrow input[type="radio"]:checked ~ .collapse-title:after,
    .collapse-arrow input[type="checkbox"]:checked ~ .collapse-title:after {
      transform: translateY(-50%) rotate(90deg);
    }
  `;
  document.head.appendChild(customStyles);
}

// ======== DOM Observation ========

/**
 * Sets up a MutationObserver to watch for DOM changes
 */
function setupMutationObserver(): void {
  const observer = new MutationObserver((mutations: MutationRecord[]) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach(node => {
          // Skip if this node is a collapse element
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element;
            if (element.classList?.contains('collapse')) {
              return;
            }
          }
          processNode(node);
        });
      } else if (mutation.type === 'characterData') {
        // Process text changes - important for fragmented content
        const { parentElement } = mutation.target;
        if (
          parentElement &&
          parentElement.nodeName === 'P' &&
          (parentElement.hasAttribute('data-is-last-node') ||
            parentElement.hasAttribute('data-is-only-node')) &&
          // Skip if parent is or contains a collapse
          !parentElement.classList?.contains('collapse') &&
          !parentElement.querySelector('.collapse')
        ) {
          processContent(parentElement);
        }
      }
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: false,
    characterData: true,
  });
  
  debugLog('MutationObserver started');
}

/**
 * Processes existing content on the page
 */
function processExistingContent(): void {
  document
    .querySelectorAll('p[data-is-last-node], p[data-is-only-node]')
    .forEach(processContent);
    
  debugLog('Existing content processed');
}

// ======== Initialization ========

// Inject required styles
injectStyles();

// Set up mutation observer
setupMutationObserver();

// Process existing content
processExistingContent();

debugLog('LLM Tag Replacer initialized');
