import { FileText } from 'lucide-react';
import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useTemplateActions, useTemplateFilters } from '@/hooks/templates';
import { useResponsiveBreakpoint } from '@/hooks/ui';
import type { DocumentTemplatesProps, ViewMode } from '@/types/templates';
import { documentTemplates } from '@/utils/documentTemplates';
import { getThemeAwareDialogClasses } from '@/utils/templateUtils';
import './styles.css';

// Sub-components
import { TemplateFilters } from './TemplateFilters';
import { TemplateGrid } from './TemplateGrid';
import { TemplatePreview } from './TemplatePreview';

/**
 * Main DocumentTemplates component
 * Dialog untuk memilih dan preview template dokumen
 */
export const DocumentTemplates: React.FC<DocumentTemplatesProps> = ({
  isOpen,
  onClose,
  onSelectTemplate,
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const { isMobile, isTablet } = useResponsiveBreakpoint();

  // Template filtering logic
  const { searchTerm, setSearchTerm, selectedCategory, setSelectedCategory, filteredTemplates } =
    useTemplateFilters({ templates: documentTemplates });

  // Template actions logic dengan callback yang langsung menutup dialog
  const handleTemplateSelect = React.useCallback(
    (content: string, fileName: string) => {
      console.log(
        'DocumentTemplates: handleTemplateSelect called with fileName:',
        fileName,
        'content length:',
        content.length
      );
      onSelectTemplate(content, fileName);
      console.log('DocumentTemplates: closing dialog');
      onClose(); // Tutup dialog setelah template dipilih
    },
    [onSelectTemplate, onClose]
  );

  const {
    handleSelectTemplate,
    handlePreviewTemplate,
    selectedTemplate,
    showPreview,
    setShowPreview,
  } = useTemplateActions({ onSelectTemplate: handleTemplateSelect, onClose });

  const dialogClasses = getThemeAwareDialogClasses(isMobile, isTablet);

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent
          className={`document-templates-dialog flex flex-col p-0 mx-auto ${dialogClasses}`}
          data-document-templates
        >
          <DialogHeader className={`flex-shrink-0 ${isMobile ? 'p-4 pb-2' : 'p-3 sm:p-4 pb-2'}`}>
            <DialogTitle
              className={`flex items-center ${isMobile ? 'text-sm' : 'text-sm sm:text-base'}`}
            >
              <FileText className={`mr-2 ${isMobile ? 'h-4 w-4' : 'h-4 w-4 sm:h-5 sm:w-5'}`} />
              Document Templates
              <Badge variant="secondary" className="ml-2 text-xs">
                {filteredTemplates.length} templates
              </Badge>
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 flex flex-col overflow-hidden min-h-0">
            {/* Search and Filters */}
            <TemplateFilters
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              categories={['readme', 'blog', 'documentation', 'academic', 'business', 'personal']}
              isMobile={isMobile}
              isTablet={isTablet}
            />

            {/* Templates Grid/List */}
            <TemplateGrid
              templates={filteredTemplates}
              viewMode={viewMode}
              isMobile={isMobile}
              isTablet={isTablet}
              onPreview={handlePreviewTemplate}
              onSelect={handleSelectTemplate}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Template Preview Dialog */}
      <TemplatePreview
        template={selectedTemplate}
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        onSelect={handleSelectTemplate}
      />
    </>
  );
};
