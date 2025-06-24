/**
 * useTemplateActions Hook (Backward Compatibility)
 * 
 * Hook untuk backward compatibility yang mempertahankan interface
 * yang sama dengan versi sebelumnya.
 * 
 * @author Senior Developer
 * @version 2.0.0
 */

import { useCallback } from 'react';
import { DocumentTemplate } from '@/types/templates';
import { UseTemplateActionsReturn, TemplateSelectionOptions } from '../types';
import { useTemplateSelection } from './useTemplateSelection';

/**
 * Hook untuk template actions dengan backward compatibility
 * 
 * @param options - Template action options
 * @returns Object dengan template action functions (backward compatible)
 */
export const useTemplateActions = (
  options: TemplateSelectionOptions
): UseTemplateActionsReturn => {
  // Use new template selection hook
  const {
    selectedTemplate,
    showPreview,
    selectTemplate,
    previewTemplate,
    closePreview
  } = useTemplateSelection(options);

  /**
   * Handle template selection (backward compatible)
   * 
   * @param template - Template yang akan dipilih
   */
  const handleSelectTemplate = useCallback((template: DocumentTemplate) => {
    selectTemplate(template);
  }, [selectTemplate]);

  /**
   * Handle template preview (backward compatible)
   * 
   * @param template - Template yang akan di-preview
   */
  const handlePreviewTemplate = useCallback((template: DocumentTemplate) => {
    previewTemplate(template);
  }, [previewTemplate]);

  /**
   * Set show preview (backward compatible)
   * 
   * @param show - Boolean untuk show/hide preview
   */
  const setShowPreview = useCallback((show: boolean) => {
    if (!show) {
      closePreview();
    }
    // Note: untuk show=true, gunakan handlePreviewTemplate dengan template
  }, [closePreview]);

  return {
    handleSelectTemplate,
    handlePreviewTemplate,
    selectedTemplate,
    showPreview,
    setShowPreview
  };
};
