// Function to log debug messages
function debugLog(...args: unknown[]): void {
  console.log('[LLM Tag Replacer]', ...args);
}

// Check if an element might contain accordion tags (even if fragmented)
function mightContainAccordionTag(element: Element): boolean {
  // Get the text content of the element (this concatenates all text nodes)
  const text = element.textContent || '';

  // Check for potential accordion tag fragments
  return (
    text.includes('<<accordion') ||
    text.includes('accordion>>') ||
    text.includes('<<acc')
  );
}

// Process the content of an element to handle accordion tags
function processAccordionContent(element: Element): void {
  if (!mightContainAccordionTag(element)) return;

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
  debugLog('Full concatenated text:', fullText);

  // Check if the full text contains accordion tags
  if (!fullText.includes('<<accordion') && !fullText.includes('accordion>>')) {
    return;
  }

  // Process the full text to replace accordion tags
  let processedText = fullText;

  // Pattern 1: <<accordion>>content<<accordion>>
  processedText = processedText.replace(
    /<<accordion>>(.*?)<<accordion>>/gi,
    (match, content) => {
      debugLog('Matched accordion tag pattern 1:', match);
      return `<div class="custom-accordion">accordion: ${content}</div>`;
    }
  );

  // Pattern 2: <<accordion>>content<</accordion>>
  processedText = processedText.replace(
    /<<accordion>>(.*?)<\/accordion>>/gi,
    (match, content) => {
      debugLog('Matched accordion tag pattern 2:', match);
      return `<div class="custom-accordion">accordion: ${content}</div>`;
    }
  );

  // If the text was changed, update the element
  if (processedText !== fullText) {
    debugLog('Replacing content in element with processed text');

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
  }
}

// Process a single node or element
function processNode(node: Node): void {
  // Only process element nodes
  if (node.nodeType !== Node.ELEMENT_NODE) return;

  const element = node as Element;

  // Check if this is a p element that might contain accordion tags
  if (
    element.nodeName === 'P' &&
    (element.hasAttribute('data-is-last-node') ||
      element.hasAttribute('data-is-only-node'))
  ) {
    processAccordionContent(element);
  }

  // Look for p elements within this node
  const pElements = element.querySelectorAll(
    'p[data-is-last-node], p[data-is-only-node]'
  );
  pElements.forEach((p) => {
    processAccordionContent(p);
  });
}

// Create a MutationObserver to watch for DOM changes
const observer = new MutationObserver((mutations: MutationRecord[]) => {
  debugLog('DOM mutation detected', mutations.length, 'changes');

  mutations.forEach((mutation) => {
    if (mutation.type === 'childList') {
      mutation.addedNodes.forEach((node) => {
        processNode(node);
      });
    } else if (mutation.type === 'characterData') {
      // Process text changes - important for fragmented content
      const { parentElement } = mutation.target;
      if (
        parentElement &&
        parentElement.nodeName === 'P' &&
        (parentElement.hasAttribute('data-is-last-node') ||
          parentElement.hasAttribute('data-is-only-node'))
      ) {
        processAccordionContent(parentElement);
      }
    }
  });
});

// Start observing the document
debugLog('Starting MutationObserver');
observer.observe(document.body, {
  childList: true,
  subtree: true,
  attributes: false,
  characterData: true, // Important for catching text changes in fragmented content
});

debugLog('Processing existing content');
document
  .querySelectorAll('p[data-is-last-node], p[data-is-only-node]')
  .forEach((element) => {
    processAccordionContent(element);
  });

// Add a style for our custom accordion
const style = document.createElement('style');
style.textContent = `
    .custom-accordion {
      border: 1px solid #ddd;
      padding: 10px;
      margin: 5px 0;
      border-radius: 4px;
      font-weight: bold;
    }
  `;
document.head.appendChild(style);

debugLog('Content script initialized');
