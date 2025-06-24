/**
 * @fileoverview Centralized dialog container component
 * @author Senior Developer
 * @version 1.0.0
 */

import React from 'react';
import { SearchDialog } from "../../../SearchDialog";
import { KeyboardShortcuts } from "../../../KeyboardShortcuts";
import { ImageManager } from "../../../ImageManager";
import { DocumentTemplates } from "../../../DocumentTemplates";
import { AdvancedExport } from "../../../AdvancedExport";
import { DialogState } from '../../types';

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
  onInsertImage: (imageUrl: string, altText: string) => void;
  onLoadTemplate: (content: string, fileName: string) => void;
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
  onInsertImage,
  onLoadTemplate
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
        />
      )}

      {/* Image Manager Dialog */}
      {dialogState.showImageManager && (
        <ImageManager
          onInsertImage={onInsertImage}
          isOpen={dialogState.showImageManager}
          onClose={() => onCloseDialog('showImageManager')}
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
        />
      )}
    </>
  );
};
