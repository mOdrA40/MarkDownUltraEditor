/**
 * @fileoverview TocHeader - Header component untuk Table of Contents
 * @author Axel Modra
 */

import React from 'react';
import { TocHeaderProps } from '../types/toc.types';

/**
 * Komponen header untuk Table of Contents
 */
export const TocHeader: React.FC<TocHeaderProps> = ({
  itemCount,
  theme
}) => {
  return (
    <div
      className="px-4 py-3 border-b backdrop-blur-md"
      style={{
        backgroundColor: theme?.surface ? `${theme.surface}80` : 'rgba(0,0,0,0.05)',
        borderColor: theme?.accent
      }}
    >
      <h3
        className="text-sm font-semibold flex items-center"
        style={{ color: theme?.text || 'inherit' }}
        id="toc-heading"
      >
        📋 Table of Contents
        {itemCount > 0 && (
          <span className="ml-2 text-xs opacity-60">({itemCount})</span>
        )}
      </h3>
    </div>
  );
};
