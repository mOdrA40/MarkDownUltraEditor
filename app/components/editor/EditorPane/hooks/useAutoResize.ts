import { useEffect } from 'react';

/**
 * Custom hook for auto-resizing textarea based on content
 */
export const useAutoResize = (
  textareaRef: React.RefObject<HTMLTextAreaElement>,
  _markdown: string
): void => {
  useEffect(() => {
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [textareaRef]);
};
