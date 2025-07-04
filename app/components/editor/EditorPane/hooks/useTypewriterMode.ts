/**
 * @fileoverview Custom hook for typewriter mode functionality
 * @author Axel Modra
 */

import { useEffect } from 'react';
import type { TypewriterConfig } from '../types/editorPane.types';

/**
 * Custom hook for implementing typewriter mode
 * Centers the current line in the editor viewport
 */
export const useTypewriterMode = (config: TypewriterConfig): void => {
  const { enabled, textareaRef } = config;

  useEffect(() => {
    if (!enabled || !textareaRef.current) return;

    const textarea = textareaRef.current;

    /**
     * Handle scroll to center current line
     */
    const handleScroll = (): void => {
      const lineHeight = Number.parseInt(getComputedStyle(textarea).lineHeight);
      const scrollTop = textarea.scrollTop;
      const clientHeight = textarea.clientHeight;
      const centerOffset = clientHeight / 2 - lineHeight / 2;

      if (scrollTop > centerOffset) {
        textarea.scrollTop = scrollTop - centerOffset;
      }
    };

    // Add event listeners for typewriter effect
    textarea.addEventListener('input', handleScroll);
    textarea.addEventListener('keyup', handleScroll);

    // Cleanup event listeners
    return () => {
      textarea.removeEventListener('input', handleScroll);
      textarea.removeEventListener('keyup', handleScroll);
    };
  }, [enabled, textareaRef]);
};
