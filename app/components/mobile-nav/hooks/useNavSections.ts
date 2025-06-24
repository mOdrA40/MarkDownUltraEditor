/**
 * Custom hook untuk konfigurasi navigation sections
 * Menangani dynamic section configuration dan action mapping
 */

import { useMemo } from 'react';
import {
  FileText,
  Code,
  Type,
  Settings,
  Eye,
  EyeOff,
  Minimize2,
  BookOpen,
  ImageIcon,
  Download
} from "lucide-react";
import { NavSection, MobileNavProps } from '../types/navTypes';

export const useNavSections = (props: Omit<MobileNavProps, 'currentTheme' | 'onThemeChange'>) => {
  const {
    showPreview,
    onTogglePreview,
    onToggleZen,
    onNewFile,
    onShowAdvancedExport,
    onShowImageManager,
    onShowTemplates
  } = props;

  /**
   * Generate navigation sections configuration
   */
  const sections = useMemo((): NavSection[] => [
    {
      id: 'file-operations',
      title: 'File Operations',
      icon: FileText,
      order: 1,
      collapsible: false,
      actions: [
        {
          id: 'new-file',
          label: 'New File',
          icon: FileText,
          onClick: onNewFile
        },
        {
          id: 'templates',
          label: 'Document Templates',
          icon: BookOpen,
          onClick: onShowTemplates
        },
        {
          id: 'image-manager',
          label: 'Image Manager',
          icon: ImageIcon,
          onClick: onShowImageManager
        },
        {
          id: 'advanced-export',
          label: 'Advanced Export',
          icon: Download,
          onClick: onShowAdvancedExport
        }
      ]
    },
    {
      id: 'formatting',
      title: 'Formatting',
      icon: Code,
      order: 2,
      collapsible: true,
      defaultCollapsed: false,
      actions: [
        // Actions akan dihandle oleh Toolbar component
      ]
    },
    {
      id: 'writing-settings',
      title: 'Writing Settings',
      icon: Type,
      order: 3,
      collapsible: true,
      defaultCollapsed: false,
      actions: [
        // Actions akan dihandle oleh WritingSettings component
      ]
    },
    {
      id: 'view-options',
      title: 'View Options',
      icon: Settings,
      order: 4,
      collapsible: false,
      actions: [
        {
          id: 'toggle-preview',
          label: showPreview ? 'Hide Preview' : 'Show Preview',
          icon: showPreview ? EyeOff : Eye,
          onClick: onTogglePreview
        },
        {
          id: 'zen-mode',
          label: 'Zen Mode',
          icon: Minimize2,
          onClick: onToggleZen
        }
      ]
    }
  ], [
    showPreview,
    onTogglePreview,
    onToggleZen,
    onNewFile,
    onShowTemplates,
    onShowImageManager,
    onShowAdvancedExport
  ]);

  /**
   * Get section by ID
   */
  const getSectionById = (sectionId: string): NavSection | undefined => {
    return sections.find(section => section.id === sectionId);
  };

  /**
   * Get actions by section ID
   */
  const getActionsBySectionId = (sectionId: string) => {
    const section = getSectionById(sectionId);
    return section?.actions || [];
  };

  /**
   * Get sorted sections
   */
  const sortedSections = useMemo(() => {
    return [...sections].sort((a, b) => (a.order || 999) - (b.order || 999));
  }, [sections]);

  /**
   * Get section statistics
   */
  const sectionStats = useMemo(() => {
    const totalSections = sections.length;
    const totalActions = sections.reduce((sum, section) => sum + section.actions.length, 0);
    const collapsibleSections = sections.filter(section => section.collapsible).length;
    
    return {
      totalSections,
      totalActions,
      collapsibleSections
    };
  }, [sections]);

  return {
    sections: sortedSections,
    getSectionById,
    getActionsBySectionId,
    sectionStats
  };
};
