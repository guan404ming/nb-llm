import TagProcessor from "./TagProcessorsBase";
import generateUniqueId from "./utils";

const hideAndSeeTagProcessor: TagProcessor = {
  tagName: 'hide-and-see',
  
  containsTag(text: string): boolean {
    return text.includes(`<<${this.tagName}>>`);
  },

  processText(text: string): string {
    return text.replace(
      new RegExp(`<<${this.tagName}>>(.*?)<<${this.tagName}>>`, 'gi'),
      (_, content) => this.createElement(content)
    );
  },

  createElement(content: string): string {
    const id = generateUniqueId();
    return `
      <button class="hide-and-see cursor-pointer" id="${id}">
        <span class="hide-and-see-content hidden rounded-md px-2 mx-2 border-gray-300 border">${content}</span>
        <span class="hide-and-see-toggle border border-gray-300 rounded-md px-2 mx-2">
          🔍 Click to reveal
        </span>
      </button>
    `.trim();
  },

  enhanceElements(container: Element): void {
    // Add click event listeners to make the entire title area clickable
    const hideAndSeeElements = container.querySelectorAll('.hide-and-see');
    hideAndSeeElements.forEach(hideAndSee => {
      hideAndSee.addEventListener('click', () => {
        // Find the associated input element and toggle it
        const hideAndSeeContainer = hideAndSee.closest('.hide-and-see');
        if (hideAndSeeContainer) {
          const hideAndSeeContent = hideAndSeeContainer.querySelector('.hide-and-see-content');
          const hideAndSeeToggle = hideAndSeeContainer.querySelector('.hide-and-see-toggle');
          if (hideAndSeeContent && hideAndSeeToggle) {
            hideAndSeeContent.classList.toggle('hidden');
            hideAndSeeToggle.classList.toggle('hidden');
          }
        }
      });
    });
  }
};

export default hideAndSeeTagProcessor;
