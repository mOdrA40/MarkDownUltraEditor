import type React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import type { FormatSelectorProps, ExportOptions } from '../types/export.types';
import { EXPORT_FORMATS } from '../utils/constants';
import type { Theme } from '@/components/features/ThemeSelector';
import { getThemeTextColor } from '@/utils/themeUtils';

/**
 * Komponen untuk memilih format export dan konfigurasi dasar
 */
interface FormatSelectorComponentProps extends FormatSelectorProps {
  options: ExportOptions;
  onOptionsChange: <K extends keyof ExportOptions>(key: K, value: ExportOptions[K]) => void;
  currentTheme?: Theme;
}

export const FormatSelector: React.FC<FormatSelectorComponentProps> = ({
  selectedFormat,
  onFormatChange,
  options,
  onOptionsChange,
  isMobile = false,
  isTablet = false,
  currentTheme,
}) => {
  const textColor = getThemeTextColor(currentTheme);

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Format Selection */}
      <div>
        <Label className="text-xs sm:text-sm font-medium mb-2 sm:mb-3 block">Export Format</Label>
        <div
          className={`grid gap-2 ${
            isMobile ? 'grid-cols-1' : isTablet ? 'grid-cols-2' : 'grid-cols-2'
          }`}
        >
          {EXPORT_FORMATS.map((format) => {
            const Icon = format.icon;
            return (
              <Card
                key={format.value}
                className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                  selectedFormat === format.value
                    ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950'
                    : ''
                }`}
                onClick={() => onFormatChange(format.value)}
              >
                <CardContent className={`text-center ${isMobile ? 'p-3' : 'p-2'}`}>
                  <Icon
                    className={`mx-auto mb-1 text-blue-600 ${
                      isMobile ? 'h-5 w-5' : 'h-4 w-4 sm:h-5 sm:w-5'
                    }`}
                  />
                  <div className={`font-medium ${isMobile ? 'text-sm' : 'text-xs'}`}>
                    {format.label}
                  </div>
                  <div
                    className={`${isMobile ? 'text-xs block' : 'text-xs hidden sm:block'}`}
                    style={{
                      color: currentTheme?.id === 'dark' ? '#e5e7eb' : '#374151',
                    }}
                  >
                    {format.desc}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      <Separator />

      {/* Document Information */}
      <div className={`space-y-2 ${isMobile ? 'space-y-2' : 'sm:space-y-3'}`}>
        <div>
          <Label htmlFor="title" className={`${isMobile ? 'text-xs' : 'text-xs sm:text-sm'}`}>
            Document Title
          </Label>
          <Input
            id="title"
            value={options.title}
            onChange={(e) => onOptionsChange('title', e.target.value)}
            placeholder="Enter document title"
            className={`${isMobile ? 'text-xs h-9' : 'text-xs sm:text-sm h-8 sm:h-9'}`}
          />
        </div>

        <div>
          <Label htmlFor="author" className={`${isMobile ? 'text-xs' : 'text-xs sm:text-sm'}`}>
            Author
          </Label>
          <Input
            id="author"
            value={options.author}
            onChange={(e) => onOptionsChange('author', e.target.value)}
            placeholder="Enter author name"
            className={`${isMobile ? 'text-xs h-9' : 'text-xs sm:text-sm h-8 sm:h-9'}`}
            style={{
              color: textColor,
              backgroundColor: currentTheme?.background || undefined,
              borderColor: currentTheme?.accent || undefined,
            }}
          />
        </div>

        <div>
          <Label htmlFor="description" className={`${isMobile ? 'text-xs' : 'text-xs sm:text-sm'}`}>
            Description
          </Label>
          <Textarea
            id="description"
            value={options.description}
            onChange={(e) => onOptionsChange('description', e.target.value)}
            placeholder="Enter document description"
            rows={isMobile ? 3 : 2}
            className={`resize-none ${isMobile ? 'text-xs' : 'text-xs sm:text-sm'}`}
          />
        </div>
      </div>

      <Separator />

      {/* Export Options */}
      <div className={`space-y-2 ${isMobile ? 'space-y-3' : 'sm:space-y-3'}`}>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="toc"
            checked={options.includeTableOfContents}
            onCheckedChange={(checked) =>
              onOptionsChange('includeTableOfContents', checked as boolean)
            }
            className={`${isMobile ? 'h-5 w-5' : 'h-4 w-4'}`}
          />
          <Label htmlFor="toc" className={`${isMobile ? 'text-sm' : 'text-xs sm:text-sm'}`}>
            Include Table of Contents
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="pageNumbers"
            checked={options.includePageNumbers}
            onCheckedChange={(checked) => onOptionsChange('includePageNumbers', checked as boolean)}
            className={`${isMobile ? 'h-5 w-5' : 'h-4 w-4'}`}
          />
          <Label htmlFor="pageNumbers" className={`${isMobile ? 'text-sm' : 'text-xs sm:text-sm'}`}>
            Include Page Numbers
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="headerFooter"
            checked={options.headerFooter}
            onCheckedChange={(checked) => onOptionsChange('headerFooter', checked as boolean)}
            className={`${isMobile ? 'h-5 w-5' : 'h-4 w-4'}`}
          />
          <Label
            htmlFor="headerFooter"
            className={`${isMobile ? 'text-sm' : 'text-xs sm:text-sm'}`}
          >
            Include Header & Footer
          </Label>
        </div>
      </div>
    </div>
  );
};
