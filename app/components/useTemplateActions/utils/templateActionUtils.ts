/**
 * Template Action utility functions
 * 
 * Kumpulan utility functions untuk template actions
 * yang dapat digunakan secara independen.
 * 
 * @author Senior Developer
 * @version 2.0.0
 */

import { DocumentTemplate } from '@/types/templates';
import { TemplateValidationResult, TemplateActionAnalytics } from '../types';

/**
 * Konstanta untuk template actions
 */
export const TEMPLATE_ACTION_CONSTANTS = {
  /** Default toast duration */
  DEFAULT_TOAST_DURATION: 3000,
  /** Maximum template name length */
  MAX_TEMPLATE_NAME_LENGTH: 100,
  /** Maximum template content length */
  MAX_TEMPLATE_CONTENT_LENGTH: 1000000, // 1MB
  /** Default file extension */
  DEFAULT_FILE_EXTENSION: '.md',
} as const;

/**
 * Generate file name dari template name
 * 
 * @param templateName - Nama template
 * @param extension - File extension (default: .md)
 * @returns Generated file name
 */
export const generateTemplateFileName = (
  templateName: string,
  extension: string = TEMPLATE_ACTION_CONSTANTS.DEFAULT_FILE_EXTENSION
): string => {
  // Sanitize template name untuk file name
  const sanitizedName = templateName
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces dengan hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens dengan single
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens

  // Ensure file name tidak kosong
  const fileName = sanitizedName || 'untitled-template';
  
  // Add extension jika belum ada
  return fileName.endsWith(extension) ? fileName : `${fileName}${extension}`;
};

/**
 * Validate template sebelum selection
 * 
 * @param template - Template yang akan divalidate
 * @returns Validation result
 */
export const validateTemplate = (template: DocumentTemplate): TemplateValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check required fields
  if (!template.id) {
    errors.push('Template ID is required');
  }

  if (!template.name || template.name.trim().length === 0) {
    errors.push('Template name is required');
  }

  if (!template.content || template.content.trim().length === 0) {
    errors.push('Template content is required');
  }

  // Check field lengths
  if (template.name && template.name.length > TEMPLATE_ACTION_CONSTANTS.MAX_TEMPLATE_NAME_LENGTH) {
    warnings.push(`Template name is too long (max: ${TEMPLATE_ACTION_CONSTANTS.MAX_TEMPLATE_NAME_LENGTH} characters)`);
  }

  if (template.content && template.content.length > TEMPLATE_ACTION_CONSTANTS.MAX_TEMPLATE_CONTENT_LENGTH) {
    errors.push(`Template content is too large (max: ${TEMPLATE_ACTION_CONSTANTS.MAX_TEMPLATE_CONTENT_LENGTH} characters)`);
  }

  // Check content format
  if (template.content && !isValidMarkdown(template.content)) {
    warnings.push('Template content may not be valid Markdown');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Check apakah content adalah valid Markdown
 * 
 * @param content - Content yang akan dicek
 * @returns Boolean indicating if content is valid Markdown
 */
export const isValidMarkdown = (content: string): boolean => {
  try {
    // Basic Markdown validation
    // Check untuk common Markdown patterns
    const markdownPatterns = [
      /^#{1,6}\s+.+$/m, // Headers
      /^\*\*.*\*\*$/m, // Bold
      /^\*.*\*$/m, // Italic
      /^\[.*\]\(.*\)$/m, // Links
      /^!\[.*\]\(.*\)$/m, // Images
      /^```[\s\S]*```$/m, // Code blocks
      /^`.*`$/m, // Inline code
      /^>\s+.+$/m, // Blockquotes
      /^[-*+]\s+.+$/m, // Lists
      /^\d+\.\s+.+$/m, // Numbered lists
    ];

    // Content dianggap valid jika mengandung setidaknya satu Markdown pattern
    // atau jika plain text (yang juga valid Markdown)
    return markdownPatterns.some(pattern => pattern.test(content)) || content.trim().length > 0;
  } catch (error) {
    console.error('Error validating Markdown:', error);
    return false;
  }
};

/**
 * Process template content dengan variable replacement
 * 
 * @param content - Template content
 * @param variables - Variables untuk replacement
 * @returns Processed content
 */
export const processTemplateContent = (
  content: string,
  variables: Record<string, string> = {}
): string => {
  let processedContent = content;

  // Default variables
  const defaultVariables = {
    '{{DATE}}': new Date().toLocaleDateString(),
    '{{TIME}}': new Date().toLocaleTimeString(),
    '{{DATETIME}}': new Date().toLocaleString(),
    '{{YEAR}}': new Date().getFullYear().toString(),
    '{{MONTH}}': (new Date().getMonth() + 1).toString().padStart(2, '0'),
    '{{DAY}}': new Date().getDate().toString().padStart(2, '0'),
  };

  // Combine default dan custom variables
  const allVariables = { ...defaultVariables, ...variables };

  // Replace variables dalam content
  Object.entries(allVariables).forEach(([key, value]) => {
    const regex = new RegExp(key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    processedContent = processedContent.replace(regex, value);
  });

  return processedContent;
};

/**
 * Create analytics event untuk template action
 * 
 * @param template - Template yang di-action
 * @param actionType - Type of action
 * @returns Analytics event object
 */
export const createTemplateActionAnalytics = (
  template: DocumentTemplate,
  actionType: 'select' | 'preview' | 'quick_select'
): TemplateActionAnalytics => {
  return {
    templateId: template.id,
    templateName: template.name,
    templateCategory: template.category,
    actionType,
    timestamp: Date.now(),
    sessionInfo: {
      deviceType: getDeviceType(),
      userAgent: navigator.userAgent,
    },
  };
};

/**
 * Get device type untuk analytics
 * 
 * @returns Device type string
 */
export const getDeviceType = (): string => {
  if (typeof window === 'undefined') return 'unknown';

  const userAgent = navigator.userAgent.toLowerCase();
  
  if (/mobile|android|iphone|ipad|phone/i.test(userAgent)) {
    return 'mobile';
  } else if (/tablet|ipad/i.test(userAgent)) {
    return 'tablet';
  } else {
    return 'desktop';
  }
};

/**
 * Create toast configuration untuk template action
 * 
 * @param template - Template yang di-action
 * @param actionType - Type of action
 * @returns Toast configuration object
 */
export const createTemplateActionToast = (
  template: DocumentTemplate,
  actionType: 'select' | 'preview'
) => {
  switch (actionType) {
    case 'select':
      return {
        title: 'Template Applied',
        description: `${template.name} template has been loaded into your editor.`,
        variant: 'default' as const,
      };
    case 'preview':
      return {
        title: 'Template Preview',
        description: `Previewing ${template.name} template.`,
        variant: 'default' as const,
      };
    default:
      return {
        title: 'Template Action',
        description: 'Template action completed.',
        variant: 'default' as const,
      };
  }
};

/**
 * Sanitize template content untuk security
 * 
 * @param content - Template content
 * @returns Sanitized content
 */
export const sanitizeTemplateContent = (content: string): string => {
  // Basic sanitization untuk mencegah XSS
  return content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/javascript:/gi, '') // Remove javascript: URLs
    .replace(/on\w+\s*=/gi, ''); // Remove event handlers
};

/**
 * Check apakah template compatible dengan current editor
 *
 * @param template - Template yang akan dicek
 * @returns Boolean indicating compatibility
 */
export const isTemplateCompatible = (template: DocumentTemplate): boolean => {
  // Check template version compatibility
  if (template.version && template.version > 2.0) {
    return false; // Future version tidak supported
  }

  // Check required features
  if (template.requiredFeatures && template.requiredFeatures.length > 0) {
    // Implement feature checking logic sesuai kebutuhan
    // Untuk saat ini, anggap semua features supported
    const supportedFeatures = ['markdown', 'tables', 'code-blocks', 'images', 'links'];
    const unsupportedFeatures = template.requiredFeatures.filter(
      feature => !supportedFeatures.includes(feature)
    );

    if (unsupportedFeatures.length > 0) {
      console.warn('Template requires unsupported features:', unsupportedFeatures);
      return false;
    }
  }

  return true;
};
