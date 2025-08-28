/**
 * @fileoverview Editor footer component with writing statistics
 * @author Axel Modra
 */

import type React from "react";
import { WritingStats } from "../../../../features/WritingStats";
import type { ResponsiveState } from "../../types";

/**
 * Props for EditorFooter component
 */
export interface EditorFooterProps {
  markdown: string;
  responsive: ResponsiveState;
  zenMode: boolean;
}

/**
 * Editor footer component with writing statistics and status information
 */
export const EditorFooter: React.FC<EditorFooterProps> = ({
  markdown,
  zenMode,
}) => {
  if (zenMode) return null;

  return (
    <div className="border-t overflow-x-hidden">
      <WritingStats markdown={markdown} />
    </div>
  );
};
