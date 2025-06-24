/**
 * Empty state component untuk DocumentOutline
 */

import React from 'react';
import { List } from "lucide-react";
import { EmptyOutlineProps } from '@/types/outline';
import { getHeaderStyles } from '@/utils/outlineUtils';

/**
 * Empty state ketika tidak ada headings ditemukan
 */
export const EmptyOutline: React.FC<EmptyOutlineProps> = ({ theme }) => {
  const headerStyles = getHeaderStyles(theme);

  return (
    <div className="h-full flex flex-col">
      <div
        className="px-4 py-2 border-b backdrop-blur-md"
        style={{
          backgroundColor: headerStyles.backgroundColor,
          borderColor: headerStyles.borderColor
        }}
      >
        <h3
          className="text-sm font-medium flex items-center"
          style={{ color: headerStyles.color }}
        >
          <List className="h-4 w-4 mr-2" />
          🗺️ Outline
        </h3>
      </div>
      <div
        className="flex-1 flex items-center justify-center text-sm italic"
        style={{ color: theme?.text ? `${theme.text}60` : 'inherit' }}
      >
        No headings found
      </div>
    </div>
  );
};
