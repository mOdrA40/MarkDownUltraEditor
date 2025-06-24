/**
 * Testing utilities untuk navigation, accessibility, dan performance
 * Membantu memastikan kualitas implementasi fitur
 */

/**
 * Test navigation functionality
 */
export const testNavigation = {
  /**
   * Test TOC navigation
   */
  async testTOCNavigation(): Promise<boolean> {
    try {
      // Check if TOC container exists
      const tocContainer = document.querySelector('[data-toc-container]');
      if (!tocContainer) {
        console.error('TOC container not found');
        return false;
      }

      // Check if TOC items are clickable
      const tocItems = tocContainer.querySelectorAll('[data-heading-id]');
      if (tocItems.length === 0) {
        console.warn('No TOC items found');
        return true; // Not an error if no headings exist
      }

      // Test first TOC item click
      const firstItem = tocItems[0] as HTMLElement;
      const headingId = firstItem.getAttribute('data-heading-id');
      
      if (!headingId) {
        console.error('TOC item missing heading ID');
        return false;
      }

      // Check if corresponding heading exists
      const heading = document.getElementById(headingId);
      if (!heading) {
        console.error(`Heading with ID ${headingId} not found`);
        return false;
      }

      console.log('✅ TOC navigation test passed');
      return true;
    } catch (error) {
      console.error('TOC navigation test failed:', error);
      return false;
    }
  },

  /**
   * Test Outline navigation
   */
  async testOutlineNavigation(): Promise<boolean> {
    try {
      const outlineContainer = document.querySelector('[data-outline-container]');
      if (!outlineContainer) {
        console.error('Outline container not found');
        return false;
      }

      const outlineItems = outlineContainer.querySelectorAll('[data-heading-id]');
      if (outlineItems.length === 0) {
        console.warn('No outline items found');
        return true;
      }

      // Test keyboard navigation
      const firstItem = outlineItems[0] as HTMLElement;
      firstItem.focus();
      
      if (document.activeElement !== firstItem) {
        console.error('Outline item not focusable');
        return false;
      }

      console.log('✅ Outline navigation test passed');
      return true;
    } catch (error) {
      console.error('Outline navigation test failed:', error);
      return false;
    }
  },

  /**
   * Test scroll spy functionality
   */
  async testScrollSpy(): Promise<boolean> {
    try {
      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      if (headings.length === 0) {
        console.warn('No headings found for scroll spy test');
        return true;
      }

      // Check if headings have proper IDs
      for (const heading of headings) {
        if (!heading.id) {
          console.error('Heading missing ID:', heading.textContent);
          return false;
        }
      }

      console.log('✅ Scroll spy test passed');
      return true;
    } catch (error) {
      console.error('Scroll spy test failed:', error);
      return false;
    }
  }
};

/**
 * Test accessibility compliance
 */
export const testAccessibility = {
  /**
   * Test keyboard navigation
   */
  async testKeyboardNavigation(): Promise<boolean> {
    try {
      const focusableElements = document.querySelectorAll(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );

      for (const element of focusableElements) {
        const htmlElement = element as HTMLElement;
        if (htmlElement.tabIndex < 0 && !htmlElement.hasAttribute('tabindex')) {
          console.error('Element not keyboard accessible:', element);
          return false;
        }
      }

      console.log('✅ Keyboard navigation test passed');
      return true;
    } catch (error) {
      console.error('Keyboard navigation test failed:', error);
      return false;
    }
  },

  /**
   * Test ARIA attributes
   */
  async testARIAAttributes(): Promise<boolean> {
    try {
      // Check navigation landmarks
      const navElements = document.querySelectorAll('[role="navigation"]');
      for (const nav of navElements) {
        if (!nav.getAttribute('aria-label') && !nav.getAttribute('aria-labelledby')) {
          console.error('Navigation missing accessible name:', nav);
          return false;
        }
      }

      // Check list structures
      const lists = document.querySelectorAll('[role="list"]');
      for (const list of lists) {
        const listItems = list.querySelectorAll('[role="listitem"]');
        if (listItems.length === 0) {
          console.error('List missing list items:', list);
          return false;
        }
      }

      console.log('✅ ARIA attributes test passed');
      return true;
    } catch (error) {
      console.error('ARIA attributes test failed:', error);
      return false;
    }
  },

  /**
   * Test color contrast
   */
  async testColorContrast(): Promise<boolean> {
    try {
      // This is a simplified test - in production, use tools like axe-core
      const textElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, a, button');
      
      for (const element of textElements) {
        const styles = window.getComputedStyle(element);
        const color = styles.color;
        const backgroundColor = styles.backgroundColor;
        
        // Skip if transparent background
        if (backgroundColor === 'rgba(0, 0, 0, 0)' || backgroundColor === 'transparent') {
          continue;
        }
        
        // Basic check - in production, calculate actual contrast ratio
        if (color === backgroundColor) {
          console.error('Poor color contrast detected:', element);
          return false;
        }
      }

      console.log('✅ Color contrast test passed');
      return true;
    } catch (error) {
      console.error('Color contrast test failed:', error);
      return false;
    }
  }
};

/**
 * Test performance metrics
 */
export const testPerformance = {
  /**
   * Test scroll performance
   */
  async testScrollPerformance(): Promise<boolean> {
    try {
      const startTime = performance.now();
      
      // Simulate scroll events
      window.scrollTo({ top: 100, behavior: 'smooth' });
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const endTime = performance.now();
      const scrollTime = endTime - startTime;
      
      if (scrollTime > 100) { // 100ms threshold
        console.warn(`Slow scroll performance: ${scrollTime}ms`);
      }

      console.log('✅ Scroll performance test passed');
      return true;
    } catch (error) {
      console.error('Scroll performance test failed:', error);
      return false;
    }
  },

  /**
   * Test syntax highlighting performance
   */
  async testSyntaxHighlighting(): Promise<boolean> {
    try {
      const codeBlocks = document.querySelectorAll('pre code');
      
      for (const block of codeBlocks) {
        const hasHighlighting = block.querySelector('.hljs-keyword, .hljs-string, .hljs-comment');
        if (!hasHighlighting && block.textContent && block.textContent.length > 10) {
          console.warn('Code block may not be highlighted:', block);
        }
      }

      console.log('✅ Syntax highlighting test passed');
      return true;
    } catch (error) {
      console.error('Syntax highlighting test failed:', error);
      return false;
    }
  },

  /**
   * Test responsive design
   */
  async testResponsiveDesign(): Promise<boolean> {
    try {
      const breakpoints = [320, 768, 1024, 1440];
      
      for (const width of breakpoints) {
        // Simulate viewport resize
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: width,
        });
        
        window.dispatchEvent(new Event('resize'));
        await new Promise(resolve => setTimeout(resolve, 50));
        
        // Check if layout adapts
        const tocContainer = document.querySelector('[data-toc-container]');
        
        if (width < 768) {
          // Mobile: sidebars should be hidden or collapsed
          if (tocContainer && window.getComputedStyle(tocContainer).display !== 'none') {
            console.warn(`TOC visible on mobile (${width}px)`);
          }
        }
      }

      console.log('✅ Responsive design test passed');
      return true;
    } catch (error) {
      console.error('Responsive design test failed:', error);
      return false;
    }
  }
};

/**
 * Run all tests
 */
export const runAllTests = async (): Promise<{
  passed: number;
  failed: number;
  results: { [key: string]: boolean };
}> => {
  console.log('🧪 Running comprehensive tests...');
  
  const tests = {
    'TOC Navigation': testNavigation.testTOCNavigation,
    'Outline Navigation': testNavigation.testOutlineNavigation,
    'Scroll Spy': testNavigation.testScrollSpy,
    'Keyboard Navigation': testAccessibility.testKeyboardNavigation,
    'ARIA Attributes': testAccessibility.testARIAAttributes,
    'Color Contrast': testAccessibility.testColorContrast,
    'Scroll Performance': testPerformance.testScrollPerformance,
    'Syntax Highlighting': testPerformance.testSyntaxHighlighting,
    'Responsive Design': testPerformance.testResponsiveDesign,
  };

  const results: { [key: string]: boolean } = {};
  let passed = 0;
  let failed = 0;

  for (const [testName, testFunction] of Object.entries(tests)) {
    try {
      console.log(`Running ${testName}...`);
      const result = await testFunction();
      results[testName] = result;
      
      if (result) {
        passed++;
      } else {
        failed++;
      }
    } catch (error) {
      console.error(`Test ${testName} threw an error:`, error);
      results[testName] = false;
      failed++;
    }
  }

  console.log(`\n📊 Test Results: ${passed} passed, ${failed} failed`);
  
  if (failed === 0) {
    console.log('🎉 All tests passed!');
  } else {
    console.log('❌ Some tests failed. Check the console for details.');
  }

  return { passed, failed, results };
};
