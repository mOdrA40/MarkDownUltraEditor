/**
 * @fileoverview Komponen untuk konfigurasi advanced options
 * @author Senior Developer
 * @version 1.0.0
 */

import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AdvancedOptionsProps } from '../types/export.types';

/**
 * Komponen untuk konfigurasi advanced options seperti watermark dan custom CSS
 */
export const AdvancedOptions: React.FC<AdvancedOptionsProps> = ({
  options,
  onOptionsChange,
  isMobile = false
}) => {
  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Watermark Settings */}
      <div>
        <Label htmlFor="watermark" className={`${
          isMobile ? 'text-xs' : 'text-xs sm:text-sm'
        }`}>
          Watermark Text
        </Label>
        <Input
          id="watermark"
          value={options.watermark}
          onChange={(e) => onOptionsChange('watermark', e.target.value)}
          placeholder="Enter watermark text (optional)"
          className={`${
            isMobile ? 'text-xs h-9' : 'text-xs sm:text-sm h-8 sm:h-9'
          }`}
        />
        <p className={`text-muted-foreground mt-1 ${
          isMobile ? 'text-xs' : 'text-xs'
        }`}>
          Watermark akan ditampilkan sebagai background text yang transparan
        </p>
      </div>

      {/* Custom CSS Settings */}
      <div>
        <Label htmlFor="customCSS" className={`${
          isMobile ? 'text-xs' : 'text-xs sm:text-sm'
        }`}>
          Custom CSS
        </Label>
        <Textarea
          id="customCSS"
          value={options.customCSS}
          onChange={(e) => onOptionsChange('customCSS', e.target.value)}
          placeholder="/* Enter custom CSS styles (optional) */
body {
  /* Your custom styles here */
}

h1 {
  /* Custom heading styles */
}"
          rows={isMobile ? 6 : 5}
          className={`font-mono resize-none ${
            isMobile ? 'text-xs' : 'text-xs sm:text-sm'
          }`}
        />
        <p className={`text-muted-foreground mt-1 ${
          isMobile ? 'text-xs' : 'text-xs'
        }`}>
          CSS kustom akan ditambahkan ke dokumen export untuk styling tambahan
        </p>
      </div>

      {/* CSS Helper Tips */}
      <div className={`bg-muted/50 rounded-lg p-3 ${
        isMobile ? 'text-xs' : 'text-xs'
      }`}>
        <h4 className="font-medium mb-2">💡 CSS Tips:</h4>
        <ul className="space-y-1 text-muted-foreground">
          <li>• Gunakan <code className="bg-muted px-1 rounded">body</code> untuk styling global</li>
          <li>• Gunakan <code className="bg-muted px-1 rounded">h1, h2, h3</code> untuk heading</li>
          <li>• Gunakan <code className="bg-muted px-1 rounded">p</code> untuk paragraf</li>
          <li>• Gunakan <code className="bg-muted px-1 rounded">blockquote</code> untuk quote</li>
          <li>• Gunakan <code className="bg-muted px-1 rounded">code, pre</code> untuk kode</li>
        </ul>
      </div>

      {/* Preview Warning */}
      {options.customCSS && (
        <div className={`bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 ${
          isMobile ? 'text-xs' : 'text-xs'
        }`}>
          <div className="flex items-start space-x-2">
            <span className="text-yellow-600 dark:text-yellow-400">⚠️</span>
            <div>
              <p className="font-medium text-yellow-800 dark:text-yellow-200">
                Custom CSS Detected
              </p>
              <p className="text-yellow-700 dark:text-yellow-300 mt-1">
                Preview mungkin tidak menampilkan custom CSS dengan sempurna. 
                Hasil akhir akan terlihat pada dokumen yang di-export.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
