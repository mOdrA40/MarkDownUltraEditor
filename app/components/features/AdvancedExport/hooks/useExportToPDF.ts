/**
 * @fileoverview Hook untuk export ke PDF
 * @author Axel Modra
 */

import { useCallback, useState } from 'react';
import type { ExportOptions, UseExportReturn } from '../types/export.types';
import { ERROR_MESSAGES, EXPORT_PROGRESS_STEPS, SUCCESS_MESSAGES } from '../utils/constants';
import { generateStyledHTML } from '../utils/htmlGenerator';
import { convertMarkdownToHTML } from '../utils/markdownConverter';

/**
 * Custom hook untuk export ke PDF
 *
 * @param markdown - Konten markdown
 * @param onSuccess - Callback ketika export berhasil
 * @param onError - Callback ketika export gagal
 * @returns Export state dan functions
 */
export const useExportToPDF = (
  markdown: string,
  onSuccess?: (message: string) => void,
  onError?: (error: string) => void
): UseExportReturn => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  const startExport = useCallback(
    async (options: ExportOptions) => {
      if (!markdown?.trim()) {
        onError?.(ERROR_MESSAGES.EMPTY_CONTENT);
        return;
      }

      setIsExporting(true);
      setExportProgress(EXPORT_PROGRESS_STEPS.INITIALIZING);

      try {
        // Convert markdown to HTML
        const { html: htmlContent } = convertMarkdownToHTML(markdown);
        setExportProgress(EXPORT_PROGRESS_STEPS.PROCESSING);

        // Generate styled HTML
        const styledHTML = generateStyledHTML({
          ...options,
          htmlContent,
          themeConfig: { name: '', primaryColor: '', backgroundColor: '', accentColor: '' }, // Will be set in generateStyledHTML
        });
        setExportProgress(EXPORT_PROGRESS_STEPS.GENERATING);

        // Create new window untuk print
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
          throw new Error('Popup blocked. Please allow popups for this site.');
        }

        setExportProgress(EXPORT_PROGRESS_STEPS.STYLING);

        // Write content ke window
        printWindow.document.write(styledHTML);
        printWindow.document.close();

        setExportProgress(EXPORT_PROGRESS_STEPS.FINALIZING);

        // Setup print handler
        printWindow.onload = () => {
          setTimeout(() => {
            printWindow.print();
            printWindow.close();
          }, 500);
        };

        setExportProgress(EXPORT_PROGRESS_STEPS.COMPLETE);
        onSuccess?.(SUCCESS_MESSAGES.PDF_EXPORTED);
      } catch (error) {
        console.error('PDF export error:', error);
        const errorMessage = error instanceof Error ? error.message : ERROR_MESSAGES.EXPORT_FAILED;
        onError?.(errorMessage);
      } finally {
        setIsExporting(false);
        setExportProgress(0);
      }
    },
    [markdown, onSuccess, onError]
  );

  const resetExport = useCallback(() => {
    setIsExporting(false);
    setExportProgress(0);
  }, []);

  return {
    isExporting,
    exportProgress,
    startExport,
    resetExport,
  };
};
