import TagProcessor from './TagProcessorsBase';
import { generateUniqueId } from './utils';

const highlightTagProcessor: TagProcessor = {
  tagName: 'highlight',

  createElement(content: string): string {
    return `<span class="bg-yellow-200 text-yellow-800 px-1 py-0.5 rounded-md processed" id="${generateUniqueId()}">${content}</span>`;
  },
};

export default highlightTagProcessor;
