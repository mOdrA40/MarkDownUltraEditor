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
import { generateHeaderStyles } from '@/utils/themeUtils';
import {
  generateRTFPreviewHTML,
  generateEpubPreviewHTML,
  generateSlidesPreviewHTML
} from '../utils/formatPreviewGenerators';
import '../styles/formatPreview.css';

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
  isTablet = false,
  currentTheme
}) => {
  const previewRef = useRef<HTMLDivElement>(null);

  // Generate preview HTML berdasarkan format yang dipilih
  const generatePreviewHTML = (): string => {
    const { html: htmlContent } = convertMarkdownToHTML(markdown);
    const themeConfig = THEMES[options.theme] || THEMES.default;

    // Generate HTML berdasarkan format export yang dipilih
    switch (options.format) {
      case 'pdf':
        return generateStyledHTML({
          ...options,
          htmlContent,
          themeConfig
        });

      case 'docx': // RTF format
        return generateRTFPreviewHTML({
          ...options,
          htmlContent,
          themeConfig
        });

      case 'epub': // HTML format
        return generateEpubPreviewHTML({
          ...options,
          htmlContent,
          themeConfig
        });

      case 'presentation': // Slides format
        return generateSlidesPreviewHTML({
          ...options,
          htmlContent,
          themeConfig
        });

      default:
        return generateStyledHTML({
          ...options,
          htmlContent,
          themeConfig
        });
    }
  };

  // Extract body content untuk preview
  const getPreviewContent = (): string => {
    const fullHTML = generatePreviewHTML();
    const bodyMatch = fullHTML.match(/<body[^>]*>(.*?)<\/body>/s);
    return bodyMatch?.[1] || '';
  };

  // Get header styles for consistent theming
  const headerStyles = generateHeaderStyles(currentTheme);

  // Format-specific styling helpers
  const getFormatSpecificFontSize = (format: string): string => {
    switch (format) {
      case 'pdf':
        return '14px';
      case 'docx':
        return '13px';
      case 'epub':
        return '15px';
      case 'presentation':
        return '16px';
      default:
        return '14px';
    }
  };

  const getFormatSpecificLineHeight = (format: string): string => {
    switch (format) {
      case 'pdf':
        return '1.6';
      case 'docx':
        return '1.8';
      case 'epub':
        return '1.7';
      case 'presentation':
        return '1.5';
      default:
        return '1.6';
    }
  };

  const getFormatSpecificMinHeight = (format: string): string => {
    switch (format) {
      case 'pdf':
        return '600px';
      case 'docx':
        return '550px';
      case 'epub':
        return '650px';
      case 'presentation':
        return '700px';
      default:
        return '600px';
    }
  };

  return (
    <div className="flex flex-col min-h-0 overflow-hidden flex-1">
      {/* Preview Header */}
      <div
        className={`advanced-export-preview-header ${
          isMobile ? 'p-2' : 'p-2 sm:p-3'
        }`}
        style={{
          ...headerStyles,
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)'
        }}
      >
        {/* Format Indicator */}
        <div className="flex items-center justify-between mb-2">
          <Badge
            variant="secondary"
            className="text-xs font-medium"
            style={{
              backgroundColor: currentTheme?.primary || '#3b82f6',
              color: 'white'
            }}
          >
            {options.format.toUpperCase()} Preview
          </Badge>
          <div className="text-xs opacity-70">
            {options.format === 'pdf' && 'Print-ready document'}
            {options.format === 'docx' && 'Rich Text Format'}
            {options.format === 'epub' && 'Web Document'}
            {options.format === 'presentation' && 'HTML Presentation'}
          </div>
        </div>
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
            } ${options.format}-preview`}
            style={{
              fontSize: isMobile ? '15px' : getFormatSpecificFontSize(options.format),
              lineHeight: isMobile ? '1.7' : getFormatSpecificLineHeight(options.format),
              minHeight: isMobile ? '480px' : getFormatSpecificMinHeight(options.format),
              position: 'relative'
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
