/**
 * Utility functions for DocumentTemplates components
 */

import { BookOpen, Briefcase, FileCode, FileText, GraduationCap, Heart } from 'lucide-react';
import type {
  CategoryIcons,
  DifficultyColors,
  DocumentTemplate,
  TemplateCategory,
  TemplateDifficulty,
} from '@/types/templates';

/**
 * Category icons mapping
 */
export const categoryIcons: CategoryIcons = {
  readme: FileCode,
  blog: BookOpen,
  documentation: FileText,
  academic: GraduationCap,
  business: Briefcase,
  personal: Heart,
} as const;

/**
 * Difficulty colors mapping
 */
export const difficultyColors: DifficultyColors = {
  beginner: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  intermediate: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  advanced: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
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
export const getGridClasses = (viewMode: 'grid' | 'list', isMobile: boolean): string => {
  if (viewMode === 'grid') {
    if (isMobile) {
      return 'grid grid-cols-1 gap-4';
    }
    return 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 md:gap-4';
  }
  if (isMobile) {
    return 'space-y-4';
  }
  return 'space-y-2 sm:space-y-3';
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
    lg: isMobile ? 'text-lg' : 'text-base sm:text-lg',
  };
  return sizeMap[size];
};

/**
 * Get responsive icon size classes
 */
export const getResponsiveIconSize = (isMobile: boolean, size: 'sm' | 'base'): string => {
  const sizeMap = {
    sm: isMobile ? 'h-4 w-4' : 'h-3 w-3 sm:h-4 sm:w-4',
    base: isMobile ? 'h-5 w-5' : 'h-4 w-4 sm:h-5 sm:w-5',
  };
  return sizeMap[size];
};

/**
 * Get responsive template card classes
 */
export const getResponsiveTemplateCard = (isMobile: boolean, isTablet: boolean): string => {
  if (isMobile) {
    return 'p-3 space-y-2';
  }
  if (isTablet) {
    return 'p-4 space-y-3';
  }
  return 'p-5 space-y-4';
};

/**
 * Get responsive template content classes
 */
export const getResponsiveTemplateContent = (isMobile: boolean): string => {
  return isMobile
    ? 'text-sm leading-relaxed max-h-32 overflow-hidden'
    : 'text-base leading-relaxed max-h-40 overflow-hidden';
};

/**
 * Get responsive template header classes
 */
export const getResponsiveTemplateHeader = (isMobile: boolean): string => {
  return isMobile ? 'text-lg font-semibold line-clamp-2' : 'text-xl font-semibold line-clamp-2';
};

/**
 * Get responsive template meta classes
 */
export const getResponsiveTemplateMeta = (isMobile: boolean): string => {
  return isMobile ? 'text-xs text-muted-foreground' : 'text-sm text-muted-foreground';
};

/**
 * Ensure template content is responsive
 */
export const makeTemplateResponsive = (content: string): string => {
  // Add responsive classes to tables
  let responsiveContent = content.replace(
    /<table/g,
    '<div class="overflow-x-auto"><table class="min-w-full"'
  );
  responsiveContent = responsiveContent.replace(/<\/table>/g, '</table></div>');

  // Add responsive classes to code blocks
  responsiveContent = responsiveContent.replace(
    /```(\w+)?\n/g,
    '```$1\n<!-- responsive-code-block -->\n'
  );

  // Add responsive image classes
  responsiveContent = responsiveContent.replace(
    /!\[([^\]]*)\]\(([^)]+)\)/g,
    '![${1}](${2}){.responsive-image .max-w-full .h-auto}'
  );

  return responsiveContent;
};

/**
 * Get theme-aware dialog classes
 */
export const getThemeAwareDialogClasses = (isMobile: boolean, isTablet: boolean): string => {
  const baseClasses = getDialogClasses(isMobile, isTablet);

  // Add theme-aware classes that will work with all themes
  const themeClasses = ['bg-background', 'text-foreground', 'border-border', 'shadow-lg'].join(' ');

  return `${baseClasses} ${themeClasses}`;
};

/**
 * Get theme-aware card classes
 */
export const getThemeAwareCardClasses = (viewMode: 'grid' | 'list'): string => {
  const baseClasses =
    viewMode === 'grid'
      ? 'group cursor-pointer transition-all duration-200 hover:shadow-md'
      : 'group cursor-pointer transition-all duration-200 hover:shadow-sm';

  const themeClasses = [
    'bg-card',
    'text-card-foreground',
    'border-border',
    'hover:bg-accent/5',
  ].join(' ');

  return `${baseClasses} ${themeClasses}`;
};

/**
 * Get theme-aware badge classes for difficulty
 */
export const getThemeAwareDifficultyClasses = (difficulty: string): string => {
  const baseClasses = 'text-xs font-medium px-2 py-1 rounded-full';

  switch (difficulty) {
    case 'beginner':
      return `${baseClasses} bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300`;
    case 'intermediate':
      return `${baseClasses} bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300`;
    case 'advanced':
      return `${baseClasses} bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300`;
    default:
      return `${baseClasses} bg-muted text-muted-foreground`;
  }
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
export const getTruncatedTags = (tags: string[], maxTags = 3) => {
  const visibleTags = tags.slice(0, maxTags);
  const remainingCount = tags.length - maxTags;

  return {
    visibleTags,
    remainingCount: remainingCount > 0 ? remainingCount : 0,
    hasMore: remainingCount > 0,
  };
};

/**
 * Get card classes berdasarkan view mode
 */
export const getCardClasses = (viewMode: 'grid' | 'list'): string => {
  const baseClasses =
    'group cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02]';
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
