import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/core";
import { useResponsiveBreakpoint } from "@/hooks/ui";
import { Download } from "lucide-react";
import './styles.css';

// Import types
import {
  AdvancedExportProps,
  PreviewMode
} from './types/export.types';

// Import hooks
import { useExportOptions } from './hooks/useExportOptions';
import { useExportToPDF } from './hooks/useExportToPDF';
import { useExportToDocx } from './hooks/useExportToDocx';
import { useExportToEpub } from './hooks/useExportToEpub';
import { useExportToPresentation } from './hooks/useExportToPresentation';

// Import components
import { FormatSelector } from './components/FormatSelector';
import { StyleOptions } from './components/StyleOptions';
import { AdvancedOptions } from './components/AdvancedOptions';
import { PreviewPanel } from './components/PreviewPanel';

/**
 * Advanced Export Component - Main Component
 * 
 * Komponen utama yang sudah direfactor dengan arsitektur yang lebih baik:
 * - Menggunakan custom hooks untuk state management dan business logic
 * - Memisahkan UI components untuk better maintainability
 * - Type-safe dengan TypeScript interfaces
 * - Responsive design dengan mobile-first approach
 */
export const AdvancedExport: React.FC<AdvancedExportProps> = ({
  markdown,
  fileName,
  isOpen,
  onClose,
  currentTheme
}) => {
  // Responsive breakpoints
  const { isMobile, isTablet } = useResponsiveBreakpoint();

  // Toast notifications
  const { toast } = useToast();

  // Preview mode state
  const [previewMode, setPreviewMode] = useState<PreviewMode>('desktop');

  // Export options management
  const {
    options,
    updateOption,
    validateOptions,
    getValidatedOptions
  } = useExportOptions(fileName);

  // Success and error handlers
  const handleExportSuccess = (message: string) => {
    toast({
      title: "Export berhasil",
      description: message,
    });
  };

  const handleExportError = (error: string) => {
    toast({
      title: "Export gagal",
      description: error,
      variant: "destructive"
    });
  };

  // Export hooks
  const pdfExport = useExportToPDF(markdown, handleExportSuccess, handleExportError);
  const docxExport = useExportToDocx(markdown, fileName, handleExportSuccess, handleExportError);
  const epubExport = useExportToEpub(markdown, fileName, handleExportSuccess, handleExportError);
  const presentationExport = useExportToPresentation(markdown, fileName, handleExportSuccess, handleExportError);

  // Get current export state based on selected format
  const getCurrentExportState = () => {
    switch (options.format) {
      case 'pdf':
        return pdfExport;
      case 'docx':
        return docxExport;
      case 'epub':
        return epubExport;
      case 'presentation':
        return presentationExport;
      default:
        return pdfExport;
    }
  };

  // Handle export based on format
  const handleExport = async () => {
    const validation = validateOptions();
    if (!validation.isValid) {
      toast({
        title: "Validasi gagal",
        description: validation.errors.join(', '),
        variant: "destructive"
      });
      return;
    }

    const validatedOptions = getValidatedOptions();
    if (!validatedOptions) return;

    try {
      switch (options.format) {
        case 'pdf':
          await pdfExport.startExport(validatedOptions);
          break;
        case 'docx':
          await docxExport.startExport(validatedOptions);
          break;
        case 'epub':
          await epubExport.startExport(validatedOptions);
          break;
        case 'presentation':
          await presentationExport.startExport(validatedOptions);
          break;
      }
    } catch (error) {
      console.error('Export error:', error);
      handleExportError('Terjadi kesalahan saat export');
    }
  };

  const currentExportState = getCurrentExportState();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`flex flex-col p-0 mx-auto ${isMobile
        ? 'w-[92vw] h-[94vh] max-w-none'
        : isTablet
          ? 'w-[95vw] h-[92vh] max-w-5xl'
          : 'w-[95vw] max-w-7xl h-[90vh]'
        }`}>
        {/* Dialog Header */}
        <DialogHeader className={`flex-shrink-0 ${isMobile ? 'p-4 pb-2' : 'p-3 sm:p-4 pb-2'
          }`}>
          <DialogTitle className={`flex items-center ${isMobile ? 'text-sm' : 'text-sm sm:text-base'
            }`}>
            <Download className={`mr-2 ${isMobile ? 'h-4 w-4' : 'h-4 w-4 sm:h-5 sm:w-5'
              }`} />
            Advanced Export
            <Badge variant="secondary" className="ml-2 text-xs">
              {options.format.toUpperCase()}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        {/* Main Content */}
        <div className={`flex-1 flex overflow-hidden min-h-0 ${isMobile || isTablet ? 'flex-col' : 'flex-col lg:flex-row'
          }`}>
          {/* Export Options Panel */}
          <div className={`bg-muted/20 flex flex-col advanced-export-options-panel ${isMobile || isTablet
            ? 'w-full border-b flex-shrink-0'
            : 'w-full lg:w-80 xl:w-96 border-b lg:border-b-0 lg:border-r flex-shrink-0'
            } ${isMobile ? 'max-h-[45vh]' : isTablet ? 'max-h-[50vh]' : ''
            }`}>
            <Tabs defaultValue="format" className={`h-full flex flex-col ${isMobile || isTablet ? 'advanced-export-tabs-container' : ''
              }`}>
              {/* Tabs Navigation */}
              <TabsList className={`grid z-20 flex-shrink-0 ${isMobile || isTablet
                ? 'advanced-export-mobile-tabs grid-cols-1'
                : 'advanced-export-tabs-list grid-cols-3'
                }`}>
                {isMobile || isTablet ? (
                  // Mobile/Tablet: Vertical layout
                  <>
                    <div className="grid grid-cols-2 gap-2">
                      <TabsTrigger
                        value="format"
                        className={`advanced-export-mobile-tab-trigger ${isMobile ? 'text-xs px-3 py-2' : 'text-sm px-4 py-2'
                          }`}
                      >
                        Format
                      </TabsTrigger>
                      <TabsTrigger
                        value="style"
                        className={`advanced-export-mobile-tab-trigger ${isMobile ? 'text-xs px-3 py-2' : 'text-sm px-4 py-2'
                          }`}
                      >
                        Style
                      </TabsTrigger>
                    </div>
                    <div className="grid grid-cols-1 mt-2">
                      <TabsTrigger
                        value="advanced"
                        className={`advanced-export-mobile-tab-trigger ${isMobile ? 'text-xs px-3 py-2' : 'text-sm px-4 py-2'
                          }`}
                      >
                        Advanced
                      </TabsTrigger>
                    </div>
                  </>
                ) : (
                  // Desktop: Horizontal layout
                  <>
                    <TabsTrigger value="format" className="advanced-export-tabs-trigger">
                      Format
                    </TabsTrigger>
                    <TabsTrigger value="style" className="advanced-export-tabs-trigger">
                      Style
                    </TabsTrigger>
                    <TabsTrigger value="advanced" className="advanced-export-tabs-trigger">
                      Advanced
                    </TabsTrigger>
                  </>
                )}
              </TabsList>

              {/* Tabs Content */}
              <div className="advanced-export-tabs-content flex-1 overflow-auto pb-4 space-y-3 sm:space-y-4">
                <TabsContent value="format" className="mt-0">
                  <FormatSelector
                    selectedFormat={options.format}
                    onFormatChange={(format) => updateOption('format', format)}
                    options={options}
                    onOptionsChange={updateOption}
                    isMobile={isMobile}
                    isTablet={isTablet}
                  />
                </TabsContent>

                <TabsContent value="style" className="mt-0">
                  <StyleOptions
                    options={options}
                    onOptionsChange={updateOption}
                    isMobile={isMobile}
                    isTablet={isTablet}
                  />
                </TabsContent>

                <TabsContent value="advanced" className="mt-0">
                  <AdvancedOptions
                    options={options}
                    onOptionsChange={updateOption}
                    isMobile={isMobile}
                    isTablet={isTablet}
                  />
                </TabsContent>
              </div>
            </Tabs>
          </div>

          {/* Preview Panel */}
          <div className="advanced-export-preview-panel">
            <PreviewPanel
              markdown={markdown}
              options={options}
              previewMode={previewMode}
              onPreviewModeChange={setPreviewMode}
              onExport={handleExport}
              exportState={currentExportState}
              isMobile={isMobile}
              isTablet={isTablet}
              currentTheme={currentTheme}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
