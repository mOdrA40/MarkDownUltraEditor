/**
 * Type definitions untuk useTemplateActions module
 * 
 * @author Senior Developer
 * @version 2.0.0
 */

import { DocumentTemplate } from '@/types/templates';

/**
 * Interface untuk template selection options
 */
export interface TemplateSelectionOptions {
  /** Callback ketika template dipilih */
  onSelectTemplate: (content: string, fileName: string) => void;
  /** Callback untuk close dialog/modal */
  onClose: () => void;
  /** Custom toast configuration */
  toastConfig?: {
    /** Custom success title */
    successTitle?: string;
    /** Custom success description */
    successDescription?: string;
    /** Show toast atau tidak */
    showToast?: boolean;
  };
  /** Custom file name generation */
  fileNameGenerator?: (templateName: string) => string;
}

/**
 * Interface untuk template preview options
 */
export interface TemplatePreviewOptions {
  /** Callback ketika preview dibuka */
  onPreviewOpen?: (template: DocumentTemplate) => void;
  /** Callback ketika preview ditutup */
  onPreviewClose?: () => void;
  /** Auto close preview setelah selection */
  autoClosePreview?: boolean;
}

/**
 * Interface untuk template action handlers
 */
export interface TemplateActionHandlers {
  /** Handle template selection */
  handleSelectTemplate: (template: DocumentTemplate) => void;
  /** Handle template preview */
  handlePreviewTemplate: (template: DocumentTemplate) => void;
  /** Handle preview close */
  handleClosePreview: () => void;
  /** Handle template quick select (tanpa preview) */
  handleQuickSelect?: (template: DocumentTemplate) => void;
}

/**
 * Interface untuk template selection state
 */
export interface TemplateSelectionState {
  /** Template yang sedang dipilih untuk preview */
  selectedTemplate: DocumentTemplate | null;
  /** Status preview modal */
  showPreview: boolean;
  /** Loading state untuk template operations */
  isLoading: boolean;
  /** Error state */
  error: string | null;
}

/**
 * Interface untuk useTemplateSelection return values
 */
export interface UseTemplateSelectionReturn extends TemplateSelectionState {
  /** Select template function */
  selectTemplate: (template: DocumentTemplate) => Promise<void>;
  /** Preview template function */
  previewTemplate: (template: DocumentTemplate) => void;
  /** Close preview function */
  closePreview: () => void;
  /** Clear error function */
  clearError: () => void;
  /** Reset state function */
  resetState: () => void;
}

/**
 * Interface untuk useTemplateActions return values (backward compatibility)
 */
export interface UseTemplateActionsReturn {
  /** Handle template selection */
  handleSelectTemplate: (template: DocumentTemplate) => void;
  /** Handle template preview */
  handlePreviewTemplate: (template: DocumentTemplate) => void;
  /** Selected template untuk preview */
  selectedTemplate: DocumentTemplate | null;
  /** Show preview status */
  showPreview: boolean;
  /** Set show preview function */
  setShowPreview: (show: boolean) => void;
}

/**
 * Interface untuk template action analytics
 */
export interface TemplateActionAnalytics {
  /** Template yang dipilih */
  templateId: string;
  /** Template name */
  templateName: string;
  /** Template category */
  templateCategory: string;
  /** Action type */
  actionType: 'select' | 'preview' | 'quick_select';
  /** Timestamp */
  timestamp: number;
  /** User session info */
  sessionInfo?: {
    /** Device type */
    deviceType: string;
    /** User agent */
    userAgent: string;
  };
}

/**
 * Type untuk template action events
 */
export type TemplateActionEvent = 
  | { type: 'TEMPLATE_SELECTED'; payload: { template: DocumentTemplate; fileName: string } }
  | { type: 'TEMPLATE_PREVIEWED'; payload: { template: DocumentTemplate } }
  | { type: 'PREVIEW_CLOSED'; payload: Record<string, never> }
  | { type: 'ERROR_OCCURRED'; payload: { error: string } }
  | { type: 'LOADING_STARTED'; payload: Record<string, never> }
  | { type: 'LOADING_FINISHED'; payload: Record<string, never> };

/**
 * Interface untuk template validation result
 */
export interface TemplateValidationResult {
  /** Apakah template valid */
  isValid: boolean;
  /** Error messages jika ada */
  errors: string[];
  /** Warning messages jika ada */
  warnings: string[];
}

/**
 * Interface untuk template processing options
 */
export interface TemplateProcessingOptions {
  /** Validate template sebelum selection */
  validateTemplate?: boolean;
  /** Process template content (e.g., replace variables) */
  processContent?: boolean;
  /** Custom content processor */
  contentProcessor?: (content: string) => string;
  /** Custom validation rules */
  customValidation?: (template: DocumentTemplate) => TemplateValidationResult;
}
