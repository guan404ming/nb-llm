import TagProcessor from './TagProcessorsBase';
import { generateUniqueId } from './utils';

const UnderlineTagProcessor: TagProcessor = {
  tagName: 'underline',

  createElement(content: string): string {
    return `<span class="underline underline-offset-1 processed" id="${generateUniqueId()}">${content}</span>`;
  },
};

export default UnderlineTagProcessor;
