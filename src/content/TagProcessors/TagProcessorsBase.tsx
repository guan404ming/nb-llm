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
     * Enhances elements after they've been added to the DOM
     */
    enhanceElements?(container: Element): void;
    
    /**
     * Creates an HTML element string from the tag content
     */
    createElement(content: string): string;
}

export default TagProcessor;