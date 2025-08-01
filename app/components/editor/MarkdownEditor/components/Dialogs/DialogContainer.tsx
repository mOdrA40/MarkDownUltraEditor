/**
 * @fileoverview Centralized dialog container component
 * @author Axel Modra
 */

import React from 'react';
import { AdvancedExport } from '../../../../features/AdvancedExport';
import { SearchDialog } from '../../../../features/SearchDialog';
import type { Theme } from '../../../../features/ThemeSelector';
import { KeyboardShortcuts } from '../../../../navigation/KeyboardShortcuts';
import { DocumentTemplates } from '../../../../templates/DocumentTemplates';
import type { DialogState } from '../../types';

/**
 * Props for DialogContainer component
 */
export interface DialogContainerProps {
  // Dialog state
  dialogState: DialogState;

  // Dialog actions
  onCloseDialog: (dialog: keyof DialogState) => void;
  onCloseAllDialogs: () => void;

  // Content and operations
  markdown: string;
  fileName: string;
  onMarkdownChange: (markdown: string) => void;
  onLoadTemplate: (content: string, fileName: string) => void;

  // Theme
  currentTheme?: Theme;
}

/**
 * Centralized dialog container that manages all modal dialogs
 */
export const DialogContainer: React.FC<DialogContainerProps> = ({
  dialogState,
  onCloseDialog,
  markdown,
  fileName,
  onMarkdownChange,
  onLoadTemplate,
  currentTheme,
}) => {
  // Handle escape key to close dialogs
  React.useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        const openDialogs = Object.entries(dialogState)
          .filter(([, isOpen]) => isOpen)
          .map(([dialog]) => dialog as keyof DialogState);

        if (openDialogs.length > 0) {
          // Close the most recently opened dialog
          const lastDialog = openDialogs[openDialogs.length - 1];
          onCloseDialog(lastDialog);
        }
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => document.removeEventListener('keydown', handleEscapeKey);
  }, [dialogState, onCloseDialog]);

  return (
    <>
      {/* Search Dialog */}
      {dialogState.showSearch && (
        <SearchDialog
          markdown={markdown}
          onReplace={onMarkdownChange}
          onClose={() => onCloseDialog('showSearch')}
        />
      )}

      {/* Keyboard Shortcuts Dialog */}
      {dialogState.showShortcuts && (
        <KeyboardShortcuts
          onClose={() => onCloseDialog('showShortcuts')}
          currentTheme={currentTheme}
        />
      )}

      {/* Document Templates Dialog */}
      {dialogState.showTemplates && (
        <DocumentTemplates
          isOpen={dialogState.showTemplates}
          onClose={() => onCloseDialog('showTemplates')}
          onSelectTemplate={onLoadTemplate}
        />
      )}

      {/* Advanced Export Dialog */}
      {dialogState.showAdvancedExport && (
        <AdvancedExport
          markdown={markdown}
          fileName={fileName}
          isOpen={dialogState.showAdvancedExport}
          onClose={() => onCloseDialog('showAdvancedExport')}
          currentTheme={currentTheme}
        />
      )}
    </>
  );
};
