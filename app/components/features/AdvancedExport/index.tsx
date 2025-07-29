import { Download } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/core';
import { useResponsiveBreakpoint } from '@/hooks/ui';
import './styles.css';
import { getThemeTextColor } from '@/utils/themeUtils';
import { AdvancedOptions } from './components/AdvancedOptions';
// Import components
import { FormatSelector } from './components/FormatSelector';
import { PreviewPanel } from './components/PreviewPanel';
import { StyleOptions } from './components/StyleOptions';
// Import hooks
import { useExportOptions } from './hooks/useExportOptions';
import { useExportToDocx } from './hooks/useExportToDocx';
import { useExportToEpub } from './hooks/useExportToEpub';
import { useExportToPDF } from './hooks/useExportToPDF';
import { useExportToPresentation } from './hooks/useExportToPresentation';
// Import types
import type { AdvancedExportProps, PreviewMode } from './types/export.types';

/**
 * Advanced Export Component
 */
export const AdvancedExport: React.FC<AdvancedExportProps> = ({
  markdown,
  fileName,
  isOpen,
  onClose,
  currentTheme,
}) => {
  const { isMobile, isTablet } = useResponsiveBreakpoint();

  const { toast } = useToast();

  const [previewMode, setPreviewMode] = useState<PreviewMode>('desktop');

  const { options, updateOption, validateOptions, getValidatedOptions } =
    useExportOptions(fileName);

  const handleExportSuccess = (message: string) => {
    toast({
      title: 'Export berhasil',
      description: message,
    });
  };

  const handleExportError = (error: string) => {
    toast({
      title: 'Export gagal',
      description: error,
      variant: 'destructive',
    });
  };

  const pdfExport = useExportToPDF(markdown, handleExportSuccess, handleExportError);
  const docxExport = useExportToDocx(markdown, fileName, handleExportSuccess, handleExportError);
  const epubExport = useExportToEpub(markdown, fileName, handleExportSuccess, handleExportError);
  const presentationExport = useExportToPresentation(
    markdown,
    fileName,
    handleExportSuccess,
    handleExportError
  );

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

  const handleExport = async () => {
    const validation = validateOptions();
    if (!validation.isValid) {
      toast({
        title: 'Validasi gagal',
        description: validation.errors.join(', '),
        variant: 'destructive',
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
      import('@/utils/console').then(({ safeConsole }) => {
        safeConsole.error('Export error:', error);
      });
      handleExportError('Terjadi kesalahan saat export');
    }
  };

  const currentExportState = getCurrentExportState();

  const textColor = getThemeTextColor(currentTheme);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className={`flex flex-col p-0 mx-auto ${
          isMobile
            ? 'w-[92vw] h-[94vh] max-w-none'
            : isTablet
              ? 'w-[95vw] h-[92vh] max-w-5xl'
              : 'w-[95vw] max-w-7xl h-[90vh]'
        }`}
        style={{
          backgroundColor: currentTheme?.background || undefined,
          borderColor: currentTheme?.accent || undefined,
          color: textColor,
        }}
      >
        {/* Dialog Header */}
        <DialogHeader
          className={`flex-shrink-0 ${isMobile ? 'p-4 pb-2' : 'p-3 sm:p-4 pb-2'}`}
          style={{
            backgroundColor: currentTheme?.surface ? `${currentTheme.surface}80` : undefined,
            borderColor: currentTheme?.accent || undefined,
          }}
        >
          <DialogTitle
            className={`flex items-center ${isMobile ? 'text-sm' : 'text-sm sm:text-base'}`}
            style={{ color: textColor }}
          >
            <Download className={`mr-2 ${isMobile ? 'h-4 w-4' : 'h-4 w-4 sm:h-5 sm:w-5'}`} />
            Advanced Export
            <Badge variant="secondary" className="ml-2 text-xs">
              {options.format.toUpperCase()}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        {/* Main Content */}
        <div
          className={`flex-1 flex overflow-hidden min-h-0 ${
            isMobile || isTablet ? 'flex-col' : 'flex-col lg:flex-row'
          }`}
        >
          {/* Export Options Panel */}
          <div
            className={`bg-muted/20 flex flex-col ${
              isMobile || isTablet
                ? 'w-full border-b flex-shrink-0 max-h-[45vh] md:max-h-[50vh]'
                : 'w-full lg:w-80 xl:w-96 border-b lg:border-b-0 lg:border-r flex-shrink-0 lg:min-w-80 lg:max-w-96'
            }`}
          >
            <Tabs
              defaultValue="format"
              className={`h-full flex flex-col ${
                isMobile || isTablet ? 'advanced-export-tabs-container' : ''
              }`}
            >
              {/* Tabs Navigation */}
              <TabsList
                className={`grid z-20 flex-shrink-0 ${
                  isMobile || isTablet
                    ? 'advanced-export-mobile-tabs grid-cols-1'
                    : 'advanced-export-tabs-list grid-cols-3'
                }`}
              >
                {isMobile || isTablet ? (
                  // Mobile/Tablet: Vertical layout
                  <>
                    <div className="grid grid-cols-2 gap-2">
                      <TabsTrigger
                        value="format"
                        className={`advanced-export-mobile-tab-trigger ${
                          isMobile ? 'text-xs px-3 py-2' : 'text-sm px-4 py-2'
                        }`}
                      >
                        Format
                      </TabsTrigger>
                      <TabsTrigger
                        value="style"
                        className={`advanced-export-mobile-tab-trigger ${
                          isMobile ? 'text-xs px-3 py-2' : 'text-sm px-4 py-2'
                        }`}
                      >
                        Style
                      </TabsTrigger>
                    </div>
                    <div className="grid grid-cols-1 mt-2">
                      <TabsTrigger
                        value="advanced"
                        className={`advanced-export-mobile-tab-trigger ${
                          isMobile ? 'text-xs px-3 py-2' : 'text-sm px-4 py-2'
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
              <div
                className={`flex-1 overflow-auto pb-4 space-y-3 sm:space-y-4 ${
                  isMobile
                    ? 'px-3 pt-6 pb-4 max-h-[calc(45vh-120px)]'
                    : isTablet
                      ? 'px-4 pt-5 pb-3 max-h-[calc(50vh-110px)]'
                      : 'px-4 py-5 lg:px-5 max-h-[calc(90vh-120px)]'
                }`}
              >
                <TabsContent value="format" className="mt-0">
                  <FormatSelector
                    selectedFormat={options.format}
                    onFormatChange={(format) => updateOption('format', format)}
                    options={options}
                    onOptionsChange={updateOption}
                    isMobile={isMobile}
                    isTablet={isTablet}
                    currentTheme={currentTheme}
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
          <div
            className={`flex-1 flex flex-col min-h-0 ${isMobile || isTablet ? 'mt-4' : 'lg:mt-0'}`}
          >
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
