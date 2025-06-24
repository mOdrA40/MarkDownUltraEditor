/**
 * @fileoverview Advanced Export Component - Legacy Wrapper
 * @author Senior Developer
 * @version 2.0.0
 *
 * File ini adalah wrapper untuk komponen AdvancedExport yang sudah direfactor.
 * Menggunakan arsitektur baru dengan separation of concerns.
 *
 * REFACTORED ARCHITECTURE:
 * - Separation of concerns dengan custom hooks dan sub-components
 * - Type safety dengan TypeScript interfaces
 * - Reusable utility functions
 * - Better maintainability dan testability
 * - Responsive design dengan mobile-first approach
 */

import React from 'react';
import { AdvancedExport as RefactoredAdvancedExport } from './AdvancedExport/index';

// Import types untuk backward compatibility
import { AdvancedExportProps } from './AdvancedExport/types/export.types';

/**
 * Legacy wrapper untuk backward compatibility
 * Menggunakan komponen AdvancedExport yang sudah direfactor
 *
 * @param props - Props yang sama dengan komponen original
 * @returns JSX Element dari komponen yang sudah direfactor
 */
export const AdvancedExport: React.FC<AdvancedExportProps> = (props) => {
  return <RefactoredAdvancedExport {...props} />;
};

// Export types untuk backward compatibility
export type { AdvancedExportProps } from './AdvancedExport/types/export.types';