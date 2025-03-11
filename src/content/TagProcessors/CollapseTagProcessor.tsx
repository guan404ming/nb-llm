import TagProcessor from "./TagProcessorsBase";
import generateUniqueId from "./utils";

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

  export default collapseProcessor;