import { useCallback, useState } from 'react';
import type { ExportOptions } from '../types/export.types';
import { DEFAULT_EXPORT_OPTIONS } from '../utils/constants';

export const useExportOptions = (fileName: string, currentTheme?: any) => {
  const [options, setOptions] = useState<ExportOptions>({
    ...DEFAULT_EXPORT_OPTIONS,
    title: fileName.replace('.md', ''),
    author: 'Document Author',
  });

  /**
   * Update single option
   */
  const updateOption = useCallback(
    <K extends keyof ExportOptions>(key: K, value: ExportOptions[K]) => {
      setOptions((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  /**
   * Update multiple options sekaligus
   */
  const updateOptions = useCallback((updates: Partial<ExportOptions>) => {
    setOptions((prev) => ({ ...prev, ...updates }));
  }, []);

  /**
   * Reset options ke default
   */
  const resetOptions = useCallback(() => {
    setOptions({
      ...DEFAULT_EXPORT_OPTIONS,
      title: fileName.replace('.md', ''),
      author: 'Document Author',
    });
  }, [fileName]);

  /**
   * Validate options sebelum export
   */
  const validateOptions = useCallback((): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!options.title.trim()) {
      errors.push('Title tidak boleh kosong');
    }

    if (!options.author.trim()) {
      errors.push('Author tidak boleh kosong');
    }

    if (options.fontSize < 8 || options.fontSize > 24) {
      errors.push('Font size harus antara 8-24px');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }, [options]);

  /**
   * Get options yang sudah divalidasi
   */
  const getValidatedOptions = useCallback((): ExportOptions | null => {
    const validation = validateOptions();
    return validation.isValid ? options : null;
  }, [options, validateOptions]);

  return {
    options,
    updateOption,
    updateOptions,
    resetOptions,
    validateOptions,
    getValidatedOptions,
  };
};
