/**
 * Custom hook untuk manajemen state Mobile Navigation
 * Menangani state sidebar, navigation actions, dan responsive behavior
 */

import { useCallback, useEffect, useState } from 'react';

export const useMobileNav = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());

  /**
   * Toggle sidebar open/close
   */
  const toggleSidebar = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  /**
   * Close sidebar
   */
  const closeSidebar = useCallback(() => {
    setIsOpen(false);
  }, []);

  /**
   * Open sidebar
   */
  const openSidebar = useCallback(() => {
    setIsOpen(true);
  }, []);

  /**
   * Toggle section collapsed state
   */
  const toggleSection = useCallback((sectionId: string) => {
    setCollapsedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  }, []);

  /**
   * Check if section is collapsed
   */
  const isSectionCollapsed = useCallback(
    (sectionId: string) => {
      return collapsedSections.has(sectionId);
    },
    [collapsedSections]
  );

  /**
   * Execute action and close sidebar
   */
  const executeAction = useCallback(
    (action: () => void) => {
      action();
      closeSidebar();
    },
    [closeSidebar]
  );

  /**
   * Handle escape key to close sidebar
   */
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        closeSidebar();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeSidebar]);

  /**
   * Close sidebar when clicking outside (handled by Sheet component)
   */
  const handleOutsideClick = useCallback(() => {
    closeSidebar();
  }, [closeSidebar]);

  return {
    // State
    isOpen,
    collapsedSections,

    // Actions
    toggleSidebar,
    closeSidebar,
    openSidebar,
    toggleSection,
    isSectionCollapsed,
    executeAction,
    handleOutsideClick,
  };
};
