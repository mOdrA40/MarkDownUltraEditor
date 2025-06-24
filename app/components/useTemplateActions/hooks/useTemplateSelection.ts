/**
 * useTemplateSelection Hook
 * 
 * Custom hook untuk template selection dengan state management,
 * validation, dan error handling yang komprehensif.
 * 
 * @author Senior Developer
 * @version 2.0.0
 */

import { useState, useCallback } from 'react';
import { DocumentTemplate } from '@/types/templates';
import { UseTemplateSelectionReturn, TemplateSelectionOptions, TemplateProcessingOptions } from '../types';
import { 
  validateTemplate, 
  processTemplateContent, 
  generateTemplateFileName,
  createTemplateActionAnalytics,
  createTemplateActionToast,
  sanitizeTemplateContent,
  isTemplateCompatible
} from '../utils/templateActionUtils';
import { useToast } from '@/hooks/use-toast';

/**
 * Hook untuk template selection dengan comprehensive state management
 * 
 * @param options - Template selection options
 * @param processingOptions - Template processing options
 * @returns Object dengan template selection functions dan state
 */
export const useTemplateSelection = (
  options: TemplateSelectionOptions,
  processingOptions: TemplateProcessingOptions = {}
): UseTemplateSelectionReturn => {
  const { 
    onSelectTemplate, 
    onClose, 
    toastConfig = {},
    fileNameGenerator = generateTemplateFileName
  } = options;

  const {
    validateTemplate: shouldValidate = true,
    processContent = true,
    contentProcessor,
    customValidation
  } = processingOptions;

  const { toast } = useToast();

  // State management
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Select template dengan validation dan processing
   * 
   * @param template - Template yang akan dipilih
   */
  const selectTemplate = useCallback(async (template: DocumentTemplate) => {
    try {
      setIsLoading(true);
      setError(null);

      // Compatibility check
      if (!isTemplateCompatible(template)) {
        throw new Error('Template is not compatible with current editor version');
      }

      // Validation
      if (shouldValidate) {
        const validationResult = customValidation 
          ? customValidation(template)
          : validateTemplate(template);

        if (!validationResult.isValid) {
          throw new Error(`Template validation failed: ${validationResult.errors.join(', ')}`);
        }

        // Show warnings jika ada
        if (validationResult.warnings.length > 0) {
          console.warn('Template validation warnings:', validationResult.warnings);
        }
      }

      // Process content
      let processedContent = template.content;
      
      if (processContent) {
        // Sanitize content untuk security
        processedContent = sanitizeTemplateContent(processedContent);
        
        // Apply custom content processor jika ada
        if (contentProcessor) {
          processedContent = contentProcessor(processedContent);
        } else {
          // Default processing dengan variable replacement
          processedContent = processTemplateContent(processedContent);
        }
      }

      // Generate file name
      const fileName = fileNameGenerator(template.name);

      // Call selection callback
      await onSelectTemplate(processedContent, fileName);

      // Show success toast
      if (toastConfig.showToast !== false) {
        const toastData = createTemplateActionToast(template, 'select');
        toast({
          title: toastConfig.successTitle || toastData.title,
          description: toastConfig.successDescription || toastData.description,
          variant: toastData.variant,
        });
      }

      // Analytics tracking
      const analyticsEvent = createTemplateActionAnalytics(template, 'select');
      console.info('Template selected:', analyticsEvent);

      // Close dialog/modal
      onClose();

      // Reset state
      setSelectedTemplate(null);
      setShowPreview(false);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to select template';
      setError(errorMessage);
      
      // Show error toast
      toast({
        title: 'Template Selection Failed',
        description: errorMessage,
        variant: 'destructive',
      });

      console.error('Template selection error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [
    onSelectTemplate, 
    onClose, 
    toast, 
    toastConfig, 
    fileNameGenerator,
    shouldValidate,
    processContent,
    contentProcessor,
    customValidation
  ]);

  /**
   * Preview template
   * 
   * @param template - Template yang akan di-preview
   */
  const previewTemplate = useCallback((template: DocumentTemplate) => {
    try {
      setSelectedTemplate(template);
      setShowPreview(true);
      setError(null);

      // Analytics tracking
      const analyticsEvent = createTemplateActionAnalytics(template, 'preview');
      console.info('Template previewed:', analyticsEvent);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to preview template';
      setError(errorMessage);
      console.error('Template preview error:', err);
    }
  }, []);

  /**
   * Close preview
   */
  const closePreview = useCallback(() => {
    setShowPreview(false);
    setSelectedTemplate(null);
    setError(null);
  }, []);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Reset semua state ke initial values
   */
  const resetState = useCallback(() => {
    setSelectedTemplate(null);
    setShowPreview(false);
    setIsLoading(false);
    setError(null);
  }, []);

  return {
    selectedTemplate,
    showPreview,
    isLoading,
    error,
    selectTemplate,
    previewTemplate,
    closePreview,
    clearError,
    resetState
  };
};
