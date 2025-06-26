import React, { useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Eye, 
  Monitor, 
  Tablet, 
  Smartphone, 
  Download, 
  Loader2 
} from "lucide-react";
import { PreviewPanelProps } from '../types/export.types';
import { convertMarkdownToHTML } from '../utils/markdownConverter';
import { generateStyledHTML } from '../utils/htmlGenerator';
import { THEMES } from '../utils/constants';

/**
 * Komponen untuk preview panel dengan kontrol responsif dan export
 */
export const PreviewPanel: React.FC<PreviewPanelProps> = ({
  markdown,
  options,
  previewMode,
  onPreviewModeChange,
  onExport,
  exportState,
  isMobile = false,
  isTablet = false
}) => {
  const previewRef = useRef<HTMLDivElement>(null);

  // Generate preview HTML
  const generatePreviewHTML = (): string => {
    const { html: htmlContent } = convertMarkdownToHTML(markdown);
    const themeConfig = THEMES[options.theme] || THEMES.default;
    
    return generateStyledHTML({
      ...options,
      htmlContent,
      themeConfig
    });
  };

  // Extract body content untuk preview
  const getPreviewContent = (): string => {
    const fullHTML = generatePreviewHTML();
    const bodyMatch = fullHTML.match(/<body[^>]*>(.*?)<\/body>/s);
    return bodyMatch?.[1] || '';
  };

  return (
    <div className="flex flex-col min-h-0 overflow-hidden flex-1">
      {/* Preview Header */}
      <div className={`advanced-export-preview-header ${
        isMobile ? 'p-2' : 'p-2 sm:p-3'
      }`}>
        <div className={`flex items-center gap-2 ${
          isMobile ? 'flex-col space-y-2' : 'flex-row justify-between'
        }`}>
          {/* Preview Title */}
          <div className="flex items-center space-x-2">
            <Eye className={`${
              isMobile ? 'h-3 w-3' : 'h-3 w-3 sm:h-4 sm:w-4'
            }`} />
            <span className={`font-medium ${
              isMobile ? 'text-xs' : 'text-xs sm:text-sm'
            }`}>
              Preview
            </span>
            <Badge variant="outline" className="text-xs">
              {options.theme}
            </Badge>
          </div>

          {/* Controls */}
          <div className={`flex items-stretch gap-2 ${
            isMobile ? 'w-full flex-col' : 'flex-row items-center'
          }`}>
            {isMobile ? (
              // Mobile: Compact layout
              <div className="w-full space-y-1">
                <div className="grid grid-cols-3 gap-1">
                  <Button
                    variant={previewMode === 'desktop' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => onPreviewModeChange('desktop')}
                    className="text-xs h-7 px-1"
                  >
                    <Monitor className="h-3 w-3" />
                  </Button>
                  <Button
                    variant={previewMode === 'tablet' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => onPreviewModeChange('tablet')}
                    className="text-xs h-7 px-1"
                  >
                    <Tablet className="h-3 w-3" />
                  </Button>
                  <Button
                    variant={previewMode === 'mobile' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => onPreviewModeChange('mobile')}
                    className="text-xs h-7 px-1"
                  >
                    <Smartphone className="h-3 w-3" />
                  </Button>
                </div>
                <Button
                  onClick={onExport}
                  disabled={exportState.isExporting}
                  className="advanced-export-button w-full text-xs h-7"
                  size="sm"
                >
                  {exportState.isExporting ? (
                    <>
                      <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                      <span>Exporting... {exportState.exportProgress}%</span>
                    </>
                  ) : (
                    <>
                      <Download className="h-3 w-3 mr-1" />
                      <span>Export {options.format.toUpperCase()}</span>
                    </>
                  )}
                </Button>
              </div>
            ) : (
              // Desktop/Tablet: Horizontal layout
              <>
                <div className="flex items-center border rounded-md overflow-hidden">
                  <Button
                    variant={previewMode === 'desktop' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => onPreviewModeChange('desktop')}
                    className="rounded-none flex-1 text-xs h-7"
                  >
                    <Monitor className="h-3 w-3" />
                    <span className="ml-1 hidden sm:inline">Desktop</span>
                  </Button>
                  <Button
                    variant={previewMode === 'tablet' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => onPreviewModeChange('tablet')}
                    className="rounded-none flex-1 text-xs h-7"
                  >
                    <Tablet className="h-3 w-3" />
                    <span className="ml-1 hidden sm:inline">Tablet</span>
                  </Button>
                  <Button
                    variant={previewMode === 'mobile' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => onPreviewModeChange('mobile')}
                    className="rounded-none flex-1 text-xs h-7"
                  >
                    <Smartphone className="h-3 w-3" />
                    <span className="ml-1 hidden sm:inline">Mobile</span>
                  </Button>
                </div>
                <Button
                  onClick={onExport}
                  disabled={exportState.isExporting}
                  className="advanced-export-button text-xs h-7 px-3"
                  size="sm"
                >
                  {exportState.isExporting ? (
                    <>
                      <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                      <span>Exporting... {exportState.exportProgress}%</span>
                    </>
                  ) : (
                    <>
                      <Download className="h-3 w-3 mr-1" />
                      <span>Export {options.format.toUpperCase()}</span>
                    </>
                  )}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Preview Content */}
      <div className={`advanced-export-preview-content flex-1 overflow-y-auto min-h-0 ${
        isMobile ? 'p-2' : isTablet ? 'p-2' : 'p-2 sm:p-3'
      }`}>
        <div
          className={`
            advanced-export-preview-document mx-auto transition-all duration-300
            ${previewMode === 'desktop' ? (isMobile ? 'max-w-full' : 'advanced-export-preview-desktop') : ''}
            ${previewMode === 'tablet' ? (isMobile ? 'max-w-full' : 'advanced-export-preview-tablet') : ''}
            ${previewMode === 'mobile' ? (isMobile ? 'max-w-full' : 'advanced-export-preview-mobile') : ''}
          `}
        >
          <div
            ref={previewRef}
            className={`preview-content ${
              isMobile
                ? previewMode === 'mobile'
                  ? 'p-4 text-base leading-relaxed'
                  : 'p-4 text-sm leading-relaxed'
                : 'p-3 sm:p-4 text-xs sm:text-sm'
            }`}
            style={{
              fontSize: isMobile ? '15px' : undefined,
              lineHeight: isMobile ? '1.7' : undefined,
              minHeight: isMobile ? '480px' : undefined
            }}
            dangerouslySetInnerHTML={{
              __html: getPreviewContent()
            }}
          />
        </div>
      </div>

      {/* Progress Bar */}
      {exportState.isExporting && exportState.exportProgress > 0 && (
        <div className="advanced-export-progress">
          <div
            className="advanced-export-progress-bar"
            style={{ width: `${exportState.exportProgress}%` }}
          />
        </div>
      )}
    </div>
  );
};
