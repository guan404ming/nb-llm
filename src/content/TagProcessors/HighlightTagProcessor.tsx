import TagProcessor from "./TagProcessorsBase";
import generateUniqueId from "./utils";

const highlightTagProcessor: TagProcessor = {
    tagName: 'highlight',
    containsTag(text: string): boolean {
      return text.includes(`<<${this.tagName}>`);
    },
  
    processText(text: string): string {
      return text.replace(
        new RegExp(`<<${this.tagName}>>(.*?)<<${this.tagName}>>`, 'gi'),
        (_, content) => this.createElement(content)
      );
    },
  
    createElement(content: string): string {
    return `<span class="bg-yellow-200 text-yellow-800 px-1 py-0.5 rounded-md" id="${generateUniqueId()}">${content}</span>`;
    }
};

export default highlightTagProcessor;