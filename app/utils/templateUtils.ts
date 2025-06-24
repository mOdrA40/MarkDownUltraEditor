/**
 * Utility functions untuk DocumentTemplates components
 */

import { DocumentTemplate, TemplateDifficulty, TemplateCategory, DifficultyColors, CategoryIcons } from '@/types/templates';
import {
  FileCode,
  BookOpen,
  FileText,
  GraduationCap,
  Briefcase,
  Heart
} from "lucide-react";

/**
 * Category icons mapping
 */
export const categoryIcons: CategoryIcons = {
  readme: FileCode,
  blog: BookOpen,
  documentation: FileText,
  academic: GraduationCap,
  business: Briefcase,
  personal: Heart
} as const;

/**
 * Difficulty colors mapping
 */
export const difficultyColors: DifficultyColors = {
  beginner: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  intermediate: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  advanced: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
} as const;

/**
 * Generate filename dari template name
 */
export const generateTemplateFileName = (templateName: string): string => {
  return `${templateName.toLowerCase().replace(/\s+/g, '-')}.md`;
};

/**
 * Format category name untuk display
 */
export const formatCategoryName = (category: TemplateCategory): string => {
  return category.charAt(0).toUpperCase() + category.slice(1);
};

/**
 * Format difficulty name untuk display
 */
export const formatDifficultyName = (difficulty: TemplateDifficulty): string => {
  return difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
};

/**
 * Get responsive grid classes berdasarkan view mode dan device
 */
export const getGridClasses = (
  viewMode: 'grid' | 'list',
  isMobile: boolean
): string => {
  if (viewMode === 'grid') {
    if (isMobile) {
      return 'grid grid-cols-1 gap-4';
    }
    return 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 md:gap-4';
  } else {
    if (isMobile) {
      return 'space-y-4';
    }
    return 'space-y-2 sm:space-y-3';
  }
};

/**
 * Get responsive dialog classes
 */
export const getDialogClasses = (isMobile: boolean, isTablet: boolean): string => {
  if (isMobile) {
    return 'w-[92vw] h-[94vh] max-w-none';
  }
  if (isTablet) {
    return 'w-[95vw] h-[90vh] max-w-5xl';
  }
  return 'w-[95vw] max-w-6xl h-[85vh]';
};

/**
 * Get responsive padding classes
 */
export const getResponsivePadding = (isMobile: boolean): string => {
  return isMobile ? 'p-4' : 'p-2 sm:p-3 md:p-4';
};

/**
 * Get responsive text size classes
 */
export const getResponsiveTextSize = (isMobile: boolean, size: 'sm' | 'base' | 'lg'): string => {
  const sizeMap = {
    sm: isMobile ? 'text-sm' : 'text-xs sm:text-sm',
    base: isMobile ? 'text-base' : 'text-sm sm:text-base',
    lg: isMobile ? 'text-lg' : 'text-base sm:text-lg'
  };
  return sizeMap[size];
};

/**
 * Get responsive icon size classes
 */
export const getResponsiveIconSize = (isMobile: boolean, size: 'sm' | 'base'): string => {
  const sizeMap = {
    sm: isMobile ? 'h-4 w-4' : 'h-3 w-3 sm:h-4 sm:w-4',
    base: isMobile ? 'h-5 w-5' : 'h-4 w-4 sm:h-5 sm:w-5'
  };
  return sizeMap[size];
};

/**
 * Get responsive button size
 */
export const getResponsiveButtonSize = (isMobile: boolean): string => {
  return isMobile ? 'h-10' : 'h-8 sm:h-9';
};

/**
 * Truncate tags untuk display
 */
export const getTruncatedTags = (tags: string[], maxTags: number = 3) => {
  const visibleTags = tags.slice(0, maxTags);
  const remainingCount = tags.length - maxTags;
  
  return {
    visibleTags,
    remainingCount: remainingCount > 0 ? remainingCount : 0,
    hasMore: remainingCount > 0
  };
};

/**
 * Get card classes berdasarkan view mode
 */
export const getCardClasses = (viewMode: 'grid' | 'list'): string => {
  const baseClasses = 'group cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02]';
  const viewModeClasses = viewMode === 'list' ? 'flex items-center' : '';
  
  return `${baseClasses} ${viewModeClasses}`;
};

/**
 * Validate template data
 */
export const isValidTemplate = (template: DocumentTemplate): boolean => {
  return !!(
    template.id &&
    template.name &&
    template.description &&
    template.content &&
    template.category &&
    template.difficulty &&
    template.tags &&
    template.icon &&
    template.estimatedTime
  );
};

/**
 * Sort templates berdasarkan kriteria
 */
export const sortTemplates = (
  templates: DocumentTemplate[],
  sortBy: 'name' | 'category' | 'difficulty' = 'name'
): DocumentTemplate[] => {
  return [...templates].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'category':
        return a.category.localeCompare(b.category);
      case 'difficulty': {
        const difficultyOrder = { beginner: 1, intermediate: 2, advanced: 3 };
        return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
      }
      default:
        return 0;
    }
  });
};
