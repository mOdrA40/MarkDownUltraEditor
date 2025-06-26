/**
 * useTemplateActions Hook (Backward Compatibility)
 *
 * Hook untuk backward compatibility yang mempertahankan interface
 * yang sama dengan versi sebelumnya.
 *
 * @author Senior Developer
 * @version 2.0.0
 */

import { useState, useCallback } from 'react';
import { DocumentTemplate } from '@/types/templates';

/**
 * Template selection options interface
 */
interface TemplateSelectionOptions {
  onSelectTemplate?: (template: DocumentTemplate) => void;
  onClose?: () => void;
}

/**
 * Template actions return interface
 */
interface UseTemplateActionsReturn {
  handleSelectTemplate: (template: DocumentTemplate) => void;
  handlePreviewTemplate: (template: DocumentTemplate) => void;
  selectedTemplate: DocumentTemplate | null;
  showPreview: boolean;
  setShowPreview: (show: boolean) => void;
}

/**
 * Hook untuk template actions dengan backward compatibility
 */
export const useTemplateActions = (
  options: TemplateSelectionOptions
): UseTemplateActionsReturn => {
  const { onSelectTemplate } = options;
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const handleSelectTemplate = useCallback((template: DocumentTemplate) => {
    setSelectedTemplate(template);
    if (onSelectTemplate) {
      onSelectTemplate(template);
    }
  }, [onSelectTemplate]);

  const handlePreviewTemplate = useCallback((template: DocumentTemplate) => {
    setSelectedTemplate(template);
    setShowPreview(true);
  }, []);

  return {
    handleSelectTemplate,
    handlePreviewTemplate,
    selectedTemplate,
    showPreview,
    setShowPreview
  };
};
