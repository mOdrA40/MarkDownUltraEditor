/**
 * useTemplateActions Hook (Backward Compatibility)
 *
 * Hook untuk backward compatibility yang mempertahankan interface
 * yang sama dengan versi sebelumnya.
 *
 * @author Axel Modra
 */

import { useCallback, useState } from 'react';
import type { DocumentTemplate } from '@/types/templates';

/**
 * Template selection options interface
 */
interface TemplateSelectionOptions {
  onSelectTemplate?: (content: string, fileName: string) => void;
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
export const useTemplateActions = (options: TemplateSelectionOptions): UseTemplateActionsReturn => {
  const { onSelectTemplate } = options;
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const handleSelectTemplate = useCallback(
    (template: DocumentTemplate) => {
      // Debug logging (development only)
      if (process.env.NODE_ENV === 'development') {
        console.log(
          'useTemplateActions: handleSelectTemplate called with template:',
          template.name
        );
        console.log('useTemplateActions: template content length:', template.content.length);
      }

      setSelectedTemplate(template);
      if (onSelectTemplate) {
        onSelectTemplate(template.content, template.name);
      }
    },
    [onSelectTemplate]
  );

  const handlePreviewTemplate = useCallback((template: DocumentTemplate) => {
    setSelectedTemplate(template);
    setShowPreview(true);
  }, []);

  return {
    handleSelectTemplate,
    handlePreviewTemplate,
    selectedTemplate,
    showPreview,
    setShowPreview,
  };
};
