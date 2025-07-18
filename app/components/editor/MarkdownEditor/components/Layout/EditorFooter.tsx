/**
 * @fileoverview Editor footer component with writing statistics
 * @author Axel Modra
 */

import type React from 'react';
import { WritingStats } from '../../../../features/WritingStats';
import type { ResponsiveState } from '../../types';

/**
 * Props for EditorFooter component
 */
export interface EditorFooterProps {
  // Content
  markdown: string;

  // Responsive
  responsive: ResponsiveState;

  // Zen mode
  zenMode: boolean;
}

/**
 * Editor footer component with writing statistics and status information
 */
export const EditorFooter: React.FC<EditorFooterProps> = ({ markdown, zenMode }) => {
  // Don't render footer in zen mode
  if (zenMode) return null;

  return (
    <div className="border-t overflow-x-hidden">
      <WritingStats markdown={markdown} />
    </div>
  );
};
