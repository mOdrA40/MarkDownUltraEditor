/**
 * @fileoverview EmptyToc - Empty state component untuk Table of Contents
 * @author Axel Modra
 */

import React from 'react';
import { EmptyTocProps } from '../types/toc.types';

/**
 * Empty state component for Table of Contents
 */
export const EmptyToc: React.FC<EmptyTocProps> = ({
  message = "No headings found. Add some headings to your document to see the table of contents.",
  theme
}) => {
  return (
    <div className="p-4 flex flex-col items-center justify-center min-h-[200px] text-center">
      <div className="text-4xl mb-3 opacity-50">📝</div>
      <p 
        className="text-sm italic"
        style={{ color: theme?.text ? `${theme.text}60` : 'rgba(0,0,0,0.6)' }}
      >
        {message}
      </p>
      <div className="mt-4 text-xs opacity-40">
        <p>Try adding headings like:</p>
        <div className="mt-2 space-y-1 font-mono text-left">
          <div># Main Heading</div>
          <div>## Sub Heading</div>
          <div>### Section</div>
        </div>
      </div>
    </div>
  );
};
