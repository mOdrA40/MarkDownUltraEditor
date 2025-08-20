import type React from 'react';
import { useId } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import type {
  FontFamily,
  PageOrientation,
  PageSize,
  StyleOptionsProps,
  ThemeType,
} from '../types/export.types';
import {
  FONT_FAMILIES,
  FONT_SIZE_RANGE,
  PAGE_ORIENTATIONS,
  PAGE_SIZES,
  THEMES,
} from '../utils/constants';

/**
 * Komponen untuk konfigurasi style, theme, dan layout
 */
export const StyleOptions: React.FC<StyleOptionsProps> = ({
  options,
  onOptionsChange,
  isMobile = false,
  isTablet = false,
}) => {
  // Generate unique ID for form elements
  const fontSizeId = useId();
  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Theme Selection */}
      <div>
        <Label className="text-xs sm:text-sm font-medium mb-2 sm:mb-3 block">Theme</Label>
        <div
          className={`grid gap-2 ${
            isMobile ? 'grid-cols-1' : isTablet ? 'grid-cols-2' : 'grid-cols-2'
          }`}
        >
          {Object.entries(THEMES).map(([key, theme]) => (
            <Card
              key={key}
              className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                options.theme === key ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() => onOptionsChange('theme', key as ThemeType)}
            >
              <CardContent className={`${isMobile ? 'p-3' : 'p-2'}`}>
                <div className="flex items-center space-x-1 mb-1">
                  <div
                    className={`rounded-full ${isMobile ? 'w-4 h-4' : 'w-3 h-3'}`}
                    style={{ backgroundColor: theme.accentColor }}
                  />
                  <span className={`font-medium ${isMobile ? 'text-sm' : 'text-xs'}`}>
                    {theme.name}
                  </span>
                </div>
                <div className="flex space-x-1">
                  <div
                    className={`rounded ${isMobile ? 'w-3 h-3' : 'w-2 h-2'}`}
                    style={{ backgroundColor: theme.primaryColor }}
                  />
                  <div
                    className={`rounded ${isMobile ? 'w-3 h-3' : 'w-2 h-2'}`}
                    style={{ backgroundColor: theme.backgroundColor }}
                  />
                  <div
                    className={`rounded ${isMobile ? 'w-3 h-3' : 'w-2 h-2'}`}
                    style={{ backgroundColor: theme.accentColor }}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Separator />

      {/* Typography Settings */}
      <div className="space-y-3">
        <div>
          <Label htmlFor="fontFamily" className={`${isMobile ? 'text-xs' : 'text-xs sm:text-sm'}`}>
            Font Family
          </Label>
          <Select
            value={options.fontFamily}
            onValueChange={(value) => onOptionsChange('fontFamily', value as FontFamily)}
          >
            <SelectTrigger
              className={`${isMobile ? 'text-xs h-9' : 'text-xs sm:text-sm h-8 sm:h-9'}`}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FONT_FAMILIES.map((font) => (
                <SelectItem key={font} value={font}>
                  {font}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor={fontSizeId} className={`${isMobile ? 'text-xs' : 'text-xs sm:text-sm'}`}>
            Font Size: {options.fontSize}px
          </Label>
          <input
            type="range"
            id={fontSizeId}
            min={FONT_SIZE_RANGE.min}
            max={FONT_SIZE_RANGE.max}
            value={options.fontSize}
            onChange={(e) => onOptionsChange('fontSize', Number.parseInt(e.target.value, 10))}
            className={`w-full ${isMobile ? 'h-6' : 'h-5'}`}
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>{FONT_SIZE_RANGE.min}px</span>
            <span>{FONT_SIZE_RANGE.max}px</span>
          </div>
        </div>
      </div>

      <Separator />

      {/* Page Layout Settings */}
      <div className="space-y-3">
        <div>
          <Label htmlFor="pageSize" className={`${isMobile ? 'text-xs' : 'text-xs sm:text-sm'}`}>
            Page Size
          </Label>
          <Select
            value={options.pageSize}
            onValueChange={(value) => onOptionsChange('pageSize', value as PageSize)}
          >
            <SelectTrigger
              className={`${isMobile ? 'text-xs h-9' : 'text-xs sm:text-sm h-8 sm:h-9'}`}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAGE_SIZES.map((size) => (
                <SelectItem key={size.value} value={size.value}>
                  {size.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="orientation" className={`${isMobile ? 'text-xs' : 'text-xs sm:text-sm'}`}>
            Orientation
          </Label>
          <Select
            value={options.orientation}
            onValueChange={(value) => onOptionsChange('orientation', value as PageOrientation)}
          >
            <SelectTrigger
              className={`${isMobile ? 'text-xs h-9' : 'text-xs sm:text-sm h-8 sm:h-9'}`}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAGE_ORIENTATIONS.map((orientation) => (
                <SelectItem key={orientation.value} value={orientation.value}>
                  {orientation.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};
