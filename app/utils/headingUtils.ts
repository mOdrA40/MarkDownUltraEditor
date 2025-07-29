/**
 * Utility functions untuk heading navigation dan ID generation
 * Memastikan konsistensi antara TOC, Outline, dan Preview pane
 */

import { safeConsole } from '@/utils/console';

export interface HeadingItem {
  text: string;
  level: number;
  id: string;
  lineNumber: number;
}

/**
 * Generate ID yang konsisten untuk heading
 * Menggunakan kombinasi text dan line number untuk uniqueness
 */
export const generateHeadingId = (text: string, lineNumber: number): string => {
  const slug = text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters except hyphens and spaces
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens

  return `heading-${lineNumber}-${slug}`;
};

/**
 * Parse markdown untuk extract semua headings
 * Menggunakan regex yang konsisten untuk semua komponen
 */
export const parseMarkdownHeadings = (markdown: string): HeadingItem[] => {
  const lines = markdown.split('\n');
  const headings: HeadingItem[] = [];

  lines.forEach((line, index) => {
    const match = line.match(/^(#{1,6})\s+(.+)$/);
    if (match) {
      const level = match[1].length;
      const text = match[2].trim();
      const id = generateHeadingId(text, index);

      headings.push({
        text,
        level,
        id,
        lineNumber: index,
      });
    }
  });

  return headings;
};

/**
 * Scroll ke line tertentu di editor (textarea)
 */
export const scrollToLineInEditor = (
  lineNumber: number,
  options: {
    behavior?: ScrollBehavior;
    highlight?: boolean;
  } = {}
): Promise<boolean> => {
  return new Promise((resolve) => {
    const { behavior = 'smooth', highlight = true } = options;

    requestAnimationFrame(() => {
      // Find editor textarea
      const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
      if (!textarea) {
        import('@/utils/console').then(({ safeConsole }) => {
          safeConsole.warn('Editor textarea tidak ditemukan');
        });
        resolve(false);
        return;
      }

      const lines = textarea.value.split('\n');
      if (lineNumber < 0 || lineNumber >= lines.length) {
        import('@/utils/console').then(({ safeConsole }) => {
          safeConsole.warn(`Line number ${lineNumber} out of range`);
        });
        resolve(false);
        return;
      }

      // Calculate character position for the line
      let charPosition = 0;
      for (let i = 0; i < lineNumber; i++) {
        charPosition += lines[i].length + 1; // +1 for newline
      }

      // Set cursor position and focus
      textarea.focus();
      textarea.setSelectionRange(charPosition, charPosition + lines[lineNumber].length);

      // Calculate scroll position
      const lineHeight = Number.parseInt(getComputedStyle(textarea).lineHeight) || 20;
      const scrollTop = lineNumber * lineHeight;
      const containerHeight = textarea.clientHeight;
      const targetScrollTop = Math.max(0, scrollTop - containerHeight / 2);

      // Scroll to position
      textarea.scrollTo({
        top: targetScrollTop,
        behavior,
      });

      // Keren highlight effect if requested
      if (highlight) {
        createAwesomeHighlight(textarea, lineNumber, lineHeight);
      }

      setTimeout(
        () => {
          resolve(true);
        },
        behavior === 'smooth' ? 500 : 0
      );
    });
  });
};

/**
 * Smooth scroll ke heading dengan offset yang tepat
 * Mempertimbangkan header/navbar height dan container yang tepat
 */
export const scrollToHeading = (
  headingId: string,
  options: {
    offset?: number;
    behavior?: ScrollBehavior;
    container?: Element | null;
  } = {}
): Promise<boolean> => {
  return new Promise((resolve) => {
    const {
      offset = 100, // Increased default offset
      behavior = 'smooth',
      container = null,
    } = options;

    // Wait for next frame to ensure DOM is ready
    requestAnimationFrame(() => {
      const element = safeGetElementById(headingId);
      if (!element) {
        import('@/utils/console').then(({ safeConsole }) => {
          safeConsole.warn(`Heading dengan ID "${headingId}" tidak ditemukan`);
        });
        resolve(false);
        return;
      }

      // Find the correct scroll container
      const targetContainer =
        container || findScrollContainer(element, ['[data-preview-pane]', '.prose']);

      // Calculate scroll position
      const elementRect = element.getBoundingClientRect();
      const containerRect = targetContainer.getBoundingClientRect();

      let scrollTop: number;
      if (targetContainer === document.documentElement) {
        scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      } else {
        scrollTop = targetContainer.scrollTop;
      }

      const targetPosition = elementRect.top - containerRect.top + scrollTop - offset;

      // Perform scroll
      if (targetContainer === document.documentElement) {
        window.scrollTo({
          top: Math.max(0, targetPosition),
          behavior,
        });
      } else {
        targetContainer.scrollTo({
          top: Math.max(0, targetPosition),
          behavior,
        });
      }

      // Wait for scroll to complete before resolving
      setTimeout(
        () => {
          resolve(true);
        },
        behavior === 'smooth' ? 500 : 0
      );
    });
  });
};

/**
 * Global scroll function yang mencari di editor DAN preview
 * Ini adalah fungsi utama yang harus digunakan oleh TOC dan Outline
 */
export const scrollToHeadingGlobal = async (
  headingId: string,
  options: {
    offset?: number;
    behavior?: ScrollBehavior;
    preferEditor?: boolean;
  } = {}
): Promise<boolean> => {
  const { offset = 120, behavior = 'smooth', preferEditor = false } = options;

  // Parse heading info from ID
  const headingInfo = parseHeadingIdToInfo(headingId);
  if (!headingInfo) {
    import('@/utils/console').then(({ safeConsole }) => {
      safeConsole.warn(`Cannot parse heading ID: ${headingId}`);
    });
    return false;
  }

  const { lineNumber, text } = headingInfo;

  try {
    // Check if both editor and preview are visible
    const editorPane = document.querySelector('textarea') as HTMLTextAreaElement;
    const previewPane = document.querySelector('[data-preview-pane]') as HTMLElement;
    const isEditorVisible = editorPane && (editorPane as HTMLElement).offsetParent !== null;
    const isPreviewVisible = previewPane && previewPane.offsetParent !== null;

    safeConsole.log(`🎯 Scrolling to: "${text}" (line ${lineNumber})`);
    safeConsole.log(`📱 Editor visible: ${isEditorVisible}, Preview visible: ${isPreviewVisible}`);

    // Strategy 1: Both visible - scroll both simultaneously
    if (isEditorVisible && isPreviewVisible) {
      const [editorSuccess, previewSuccess] = await Promise.all([
        scrollToLineInEditor(lineNumber, { behavior, highlight: true }),
        scrollToHeading(headingId, {
          offset,
          behavior,
          container: previewPane,
        }),
      ]);

      import('@/utils/console').then(({ safeConsole }) => {
        safeConsole.dev(
          `📜 Dual scroll result: Editor=${editorSuccess}, Preview=${previewSuccess}`
        );
      });
      return editorSuccess || previewSuccess;
    }

    // Strategy 2: Only editor visible or preferred
    if ((isEditorVisible && !isPreviewVisible) || preferEditor) {
      const success = await scrollToLineInEditor(lineNumber, {
        behavior,
        highlight: true,
      });
      import('@/utils/console').then(({ safeConsole }) => {
        safeConsole.dev(`📝 Editor scroll result: ${success}`);
      });
      return success;
    }

    // Strategy 3: Only preview visible
    if (isPreviewVisible && !isEditorVisible) {
      const success = await scrollToHeading(headingId, {
        offset,
        behavior,
        container: previewPane,
      });
      import('@/utils/console').then(({ safeConsole }) => {
        safeConsole.dev(`👁️ Preview scroll result: ${success}`);
      });
      return success;
    }

    // Strategy 4: Fallback - try both anyway
    import('@/utils/console').then(({ safeConsole }) => {
      safeConsole.dev('🔄 Fallback: Trying both scroll methods');
    });
    const [editorSuccess, previewSuccess] = await Promise.allSettled([
      scrollToLineInEditor(lineNumber, { behavior, highlight: true }),
      scrollToHeading(headingId, { offset, behavior }),
    ]);

    const editorResult = editorSuccess.status === 'fulfilled' ? editorSuccess.value : false;
    const previewResult = previewSuccess.status === 'fulfilled' ? previewSuccess.value : false;

    import('@/utils/console').then(({ safeConsole }) => {
      safeConsole.dev(`🔄 Fallback result: Editor=${editorResult}, Preview=${previewResult}`);
    });
    return editorResult || previewResult;
  } catch (error) {
    import('@/utils/console').then(({ safeConsole }) => {
      safeConsole.error('Error in global scroll:', error);
    });
    return false;
  }
};

/**
 * 🎨 Keren highlight effect untuk editor line
 */
export const createAwesomeHighlight = (
  textarea: HTMLTextAreaElement,
  lineNumber: number,
  lineHeight: number
): void => {
  // Create highlight overlay element
  const highlight = document.createElement('div');
  highlight.className = 'editor-line-highlight';

  // Position overlay
  const scrollTop = textarea.scrollTop;
  const lineTop = lineNumber * lineHeight - scrollTop;

  // Styling yang super keren! 🔥
  Object.assign(highlight.style, {
    position: 'absolute',
    left: '0',
    top: `${lineTop}px`,
    width: '100%',
    height: `${lineHeight}px`,
    background:
      'linear-gradient(135deg, rgba(59, 130, 246, 0.25) 0%, rgba(147, 51, 234, 0.2) 30%, rgba(236, 72, 153, 0.15) 60%, rgba(59, 130, 246, 0.1) 100%)',
    borderLeft: '4px solid #3b82f6',
    borderRight: '2px solid rgba(59, 130, 246, 0.3)',
    borderRadius: '0 12px 12px 0',
    boxShadow: `
      0 4px 20px rgba(59, 130, 246, 0.4),
      inset 0 1px 0 rgba(255, 255, 255, 0.2),
      inset 0 -1px 0 rgba(59, 130, 246, 0.1),
      0 0 0 1px rgba(59, 130, 246, 0.1)
    `,
    pointerEvents: 'none',
    zIndex: '10',
    animation: 'highlightPulse 2.5s cubic-bezier(0.4, 0, 0.2, 1)',
    backdropFilter: 'blur(2px) saturate(1.2)',
    transform: 'translateZ(0)', // Hardware acceleration
    willChange: 'opacity, transform',
  });

  // Add CSS animation if not exists
  if (!document.querySelector('#highlight-animations')) {
    const style = document.createElement('style');
    style.id = 'highlight-animations';
    style.textContent = `
      @keyframes highlightPulse {
        0% {
          opacity: 0;
          transform: translateX(-20px) scale(0.9) rotateY(-5deg);
          filter: brightness(1.3) saturate(1.5);
          box-shadow: 0 0 0 rgba(59, 130, 246, 0);
        }
        10% {
          opacity: 0.8;
          transform: translateX(-5px) scale(0.98) rotateY(-1deg);
          filter: brightness(1.2) saturate(1.3);
          box-shadow: 0 4px 20px rgba(59, 130, 246, 0.6);
        }
        25% {
          opacity: 1;
          transform: translateX(0) scale(1) rotateY(0deg);
          filter: brightness(1.1) saturate(1.2);
          box-shadow: 0 6px 25px rgba(59, 130, 246, 0.5);
        }
        75% {
          opacity: 1;
          transform: translateX(0) scale(1) rotateY(0deg);
          filter: brightness(1) saturate(1);
          box-shadow: 0 4px 20px rgba(59, 130, 246, 0.4);
        }
        90% {
          opacity: 0.6;
          transform: translateX(3px) scale(0.99) rotateY(1deg);
          filter: brightness(0.95) saturate(0.9);
          box-shadow: 0 2px 10px rgba(59, 130, 246, 0.2);
        }
        100% {
          opacity: 0;
          transform: translateX(10px) scale(0.95) rotateY(2deg);
          filter: brightness(0.8) saturate(0.8);
          box-shadow: 0 0 0 rgba(59, 130, 246, 0);
        }
      }

      @keyframes highlightShimmer {
        0% {
          background-position: -300% 0;
          opacity: 0;
        }
        20% {
          opacity: 1;
        }
        80% {
          opacity: 1;
        }
        100% {
          background-position: 300% 0;
          opacity: 0;
        }
      }

      @keyframes highlightGlow {
        0%, 100% {
          box-shadow: 0 0 5px rgba(59, 130, 246, 0.3);
        }
        50% {
          box-shadow: 0 0 20px rgba(59, 130, 246, 0.6), 0 0 30px rgba(147, 51, 234, 0.3);
        }
      }

      .editor-line-highlight {
        perspective: 1000px;
        transform-style: preserve-3d;
      }

      .editor-line-highlight::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(
          90deg,
          transparent 0%,
          rgba(255, 255, 255, 0.6) 20%,
          rgba(255, 255, 255, 0.8) 50%,
          rgba(255, 255, 255, 0.6) 80%,
          transparent 100%
        );
        background-size: 300% 100%;
        animation: highlightShimmer 2s ease-in-out;
        border-radius: inherit;
        mix-blend-mode: overlay;
      }

      .editor-line-highlight::after {
        content: '';
        position: absolute;
        top: -2px;
        left: -2px;
        right: -2px;
        bottom: -2px;
        background: linear-gradient(45deg, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1));
        border-radius: inherit;
        animation: highlightGlow 2s ease-in-out;
        z-index: -1;
      }
    `;
    document.head.appendChild(style);
  }

  // Position relative to textarea
  const container = textarea.parentElement;
  if (container) {
    container.style.position = 'relative';
    container.appendChild(highlight);

    // Remove after animation dengan fade out yang smooth
    setTimeout(() => {
      if (highlight.parentElement) {
        highlight.style.transition = 'opacity 0.5s ease-out';
        highlight.style.opacity = '0';
        setTimeout(() => {
          if (highlight.parentElement) {
            highlight.remove();
          }
        }, 500);
      }
    }, 2500);
  }
};

/**
 * Parse heading ID untuk mendapatkan line number dan text
 */
export const parseHeadingIdToInfo = (
  headingId: string
): { lineNumber: number; text: string } | null => {
  // Format: heading-{lineNumber}-{slug}
  const match = headingId.match(/^heading-(\d+)-(.+)$/);
  if (!match) return null;

  const lineNumber = Number.parseInt(match[1], 10);
  const slug = match[2];

  // Convert slug back to text (basic conversion)
  const text = slug.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());

  return { lineNumber, text };
};

// Import common utilities to avoid duplication
import { debounce, findScrollContainer, safeGetElementById, throttle } from './common';

// Re-export for backward compatibility
export { debounce, throttle };

/**
 * Check if element is in viewport
 */
export const isElementInViewport = (
  element: Element,
  options: {
    threshold?: number;
    rootMargin?: string;
  } = {}
): boolean => {
  const { threshold = 0.5 } = options;
  const rect = element.getBoundingClientRect();
  const windowHeight = window.innerHeight || document.documentElement.clientHeight;
  const windowWidth = window.innerWidth || document.documentElement.clientWidth;

  const verticalInView =
    rect.top <= windowHeight * (1 - threshold) && rect.bottom >= windowHeight * threshold;
  const horizontalInView = rect.left <= windowWidth && rect.right >= 0;

  return verticalInView && horizontalInView;
};

/**
 * Get heading level styling classes
 */
export const getHeadingLevelClasses = (level: number): string => {
  const baseClasses = 'transition-all duration-200 hover:bg-muted/50 hover:text-foreground';

  switch (level) {
    case 1:
      return `${baseClasses} font-semibold text-sm`;
    case 2:
      return `${baseClasses} font-medium text-sm ml-3`;
    case 3:
      return `${baseClasses} text-sm ml-6`;
    case 4:
      return `${baseClasses} text-xs ml-9`;
    case 5:
      return `${baseClasses} text-xs ml-12`;
    case 6:
      return `${baseClasses} text-xs ml-15`;
    default:
      return baseClasses;
  }
};

/**
 * Get active heading styling classes
 */
export const getActiveHeadingClasses = (isActive: boolean): string => {
  return isActive ? 'bg-primary/10 text-primary border-l-2 border-primary font-medium' : '';
};

/**
 * Debug function untuk memeriksa heading elements
 */
export const debugHeadings = (): void => {
  safeConsole.group('🔍 Heading Debug Information', () => {
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    safeConsole.log(`Found ${headings.length} heading elements:`);

    headings.forEach((heading, index) => {
      const id = heading.id;
      const text = heading.textContent?.trim();
      const level = heading.tagName.toLowerCase();
      const rect = heading.getBoundingClientRect();

      safeConsole.log(`${index + 1}. ${level.toUpperCase()}: "${text}"`);
      safeConsole.log(`   ID: ${id || 'NO ID'}`);
      safeConsole.log(`   Position: top=${Math.round(rect.top)}, left=${Math.round(rect.left)}`);
      safeConsole.log(`   Size: ${Math.round(rect.width)}x${Math.round(rect.height)}`);
      safeConsole.log('---');
    });
  });

  const previewPane = document.querySelector('[data-preview-pane]');
  if (previewPane) {
    const rect = previewPane.getBoundingClientRect();
    safeConsole.log('📱 Preview Pane Info:');
    safeConsole.log(`   Position: top=${Math.round(rect.top)}, left=${Math.round(rect.left)}`);
    safeConsole.log(`   Size: ${Math.round(rect.width)}x${Math.round(rect.height)}`);
    safeConsole.log(`   Scroll: top=${previewPane.scrollTop}, left=${previewPane.scrollLeft}`);
  }
};

/**
 * Detect current view mode
 */
export const detectViewMode = (): 'editor-only' | 'preview-only' | 'split-view' | 'unknown' => {
  const editorPane = document.querySelector('textarea') as HTMLTextAreaElement;
  const previewPane = document.querySelector('[data-preview-pane]') as HTMLElement;

  const isEditorVisible = editorPane && (editorPane as HTMLElement).offsetParent !== null;
  const isPreviewVisible = previewPane && previewPane.offsetParent !== null;

  if (isEditorVisible && isPreviewVisible) return 'split-view';
  if (isEditorVisible && !isPreviewVisible) return 'editor-only';
  if (!isEditorVisible && isPreviewVisible) return 'preview-only';
  return 'unknown';
};

/**
 * Test scroll function untuk debugging
 */
export const testScrollToHeading = async (headingId: string): Promise<void> => {
  safeConsole.log(`🎯 Testing scroll to heading: ${headingId}`);

  const element = document.getElementById(headingId);
  if (!element) {
    safeConsole.error(`❌ Element with ID "${headingId}" not found`);
    return;
  }

  safeConsole.log(`✅ Element found: ${element.tagName} - "${element.textContent?.trim()}"`);

  const success = await scrollToHeading(headingId, {
    offset: 120,
    behavior: 'smooth',
  });

  safeConsole.log(`📜 Scroll result: ${success ? '✅ Success' : '❌ Failed'}`);
};

/**
 * Test global scroll function untuk debugging
 */
export const testGlobalScroll = async (headingId: string): Promise<void> => {
  safeConsole.log(`🌍 Testing global scroll to heading: ${headingId}`);
  safeConsole.log(`📱 Current view mode: ${detectViewMode()}`);

  const headingInfo = parseHeadingIdToInfo(headingId);
  if (headingInfo) {
    safeConsole.log(`📝 Heading info: Line ${headingInfo.lineNumber}, Text: "${headingInfo.text}"`);
  }

  const success = await scrollToHeadingGlobal(headingId, {
    offset: 120,
    behavior: 'smooth',
  });

  safeConsole.log(`🌍 Global scroll result: ${success ? '✅ Success' : '❌ Failed'}`);
};
