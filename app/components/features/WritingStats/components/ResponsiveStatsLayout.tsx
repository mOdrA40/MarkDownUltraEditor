/**
 * ResponsiveStatsLayout Component - Layout Responsif untuk Stats
 * Komponen wrapper yang menangani layout berbeda untuk setiap screen size
 * 
 * @author Axel Modra
 */

import React, { memo } from 'react';
import { Clock } from "lucide-react";
import { StatItem } from './StatItem';
import { StatBadge } from './StatBadge';
import { BREAKPOINTS_STATS } from '../constants/stats.constants';
import { getDocumentStatus } from '../utils/stats.utils';
import type { ResponsiveStatsLayoutProps } from '../types/stats.types';

/**
 * Komponen ResponsiveStatsLayout untuk menangani layout responsif
 */
export const ResponsiveStatsLayout: React.FC<ResponsiveStatsLayoutProps> = memo(({
  children,
  screenSize,
  stats,
  className = '',
  layoutStyles = {}
}) => {
  const breakpointConfig = BREAKPOINTS_STATS[screenSize === 'small-tablet' ? 'smallTablet' : screenSize];
  const customStyles = layoutStyles[screenSize] || '';
  const documentStatus = getDocumentStatus(stats);

  // Mobile Layout - Vertical Stack dengan prioritas stats
  if (screenSize === 'mobile') {
    return (
      <div className={`${breakpointConfig.classes.container} ${customStyles} ${className}`}>
        <div className={breakpointConfig.classes.statsLeft}>
          {/* Top Row: Essential stats */}
          <div className="writing-stats-row">
            <div className="flex items-center gap-2 flex-wrap min-w-0">
              <StatItem type="words" value={stats.words} format="short" />
              <div className={breakpointConfig.classes.separator}></div>
              <StatItem type="characters" value={stats.characters} format="short" />
              <div className={breakpointConfig.classes.separator}></div>
              <StatItem type="paragraphs" value={stats.paragraphs} format="short" />
            </div>

            {/* Reading time and status - always visible */}
            <div className={breakpointConfig.classes.statsRight}>
              <StatBadge variant="secondary">
                <Clock className="h-3 w-3 flex-shrink-0" />
                <span className="ml-1">{stats.readingTime} min</span>
              </StatBadge>
              <StatBadge variant="outline">
                {documentStatus}
              </StatBadge>
            </div>
          </div>

          {/* Bottom Row: Additional stats */}
          <div className="flex items-center gap-2 text-muted-foreground text-xs">
            <StatItem type="sentences" value={stats.sentences} format="short" />
            <div className={breakpointConfig.classes.separator}></div>
            <StatItem type="lines" value={stats.lines} format="short" />
            <div className={breakpointConfig.classes.separator}></div>
            <StatItem 
              type="charactersNoSpaces" 
              value={stats.charactersNoSpaces} 
              format="long"
              className="text-xs opacity-75"
            />
          </div>
        </div>
        {children}
      </div>
    );
  }

  // Small Tablet & Tablet Layout - Horizontal dengan semua stats dalam satu baris
  if (screenSize === 'small-tablet' || screenSize === 'tablet') {
    return (
      <div className={`${breakpointConfig.classes.container} ${customStyles} ${className}`}>
        <div className={breakpointConfig.classes.statsLeft}>
          <StatItem type="words" value={stats.words} iconSize="sm" />
          <div className={breakpointConfig.classes.separator}></div>
          <StatItem type="characters" value={stats.characters} iconSize="sm" />
          <div className={breakpointConfig.classes.separator}></div>
          <StatItem type="paragraphs" value={stats.paragraphs} iconSize="sm" />
          <div className={breakpointConfig.classes.separator}></div>
          <StatItem type="sentences" value={stats.sentences} iconSize="sm" />
          <div className={breakpointConfig.classes.separator}></div>
          <StatItem type="lines" value={stats.lines} iconSize="sm" />
          <div className={breakpointConfig.classes.separator}></div>
          <StatItem
            type="charactersNoSpaces"
            value={stats.charactersNoSpaces}
            iconSize="sm"
            className="text-muted-foreground"
          />
        </div>

        <div className={breakpointConfig.classes.statsRight}>
          <StatBadge variant="secondary">
            <Clock className="h-3 w-3 flex-shrink-0" />
            <span className="ml-1">{stats.readingTime} min</span>
          </StatBadge>
          <StatBadge variant="outline">
            {documentStatus}
          </StatBadge>
        </div>
        {children}
      </div>
    );
  }

  // Desktop Layout - Horizontal dengan inline styles untuk force layout
  const desktopContainerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.5rem 1rem',
    fontSize: '0.75rem',
    minHeight: '40px',
    flexDirection: 'row'
  };

  const statsLeftStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    flex: 1,
    minWidth: 0,
    overflowX: 'auto',
    scrollbarWidth: 'none',
    msOverflowStyle: 'none',
    flexDirection: 'row',
    flexWrap: 'nowrap'
  };

  const statsRightStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    flexShrink: 0,
    marginLeft: '0.75rem',
    flexDirection: 'row'
  };

  const separatorStyle: React.CSSProperties = {
    width: '1px',
    height: '0.75rem',
    backgroundColor: 'currentColor',
    opacity: 0.3,
    flexShrink: 0
  };

  return (
    <div 
      className={`bg-muted/20 border-t ${customStyles} ${className}`} 
      style={desktopContainerStyle}
    >
      <div style={statsLeftStyle}>
        <StatItem type="words" value={stats.words} iconSize="sm" />
        <div style={separatorStyle}></div>
        <StatItem type="characters" value={stats.characters} iconSize="sm" />
        <div style={separatorStyle}></div>
        <StatItem type="paragraphs" value={stats.paragraphs} iconSize="sm" />
        <div style={separatorStyle}></div>
        <StatItem type="sentences" value={stats.sentences} iconSize="sm" />
        <div style={separatorStyle}></div>
        <StatItem type="lines" value={stats.lines} iconSize="sm" />
        <div style={separatorStyle}></div>
        <StatItem 
          type="charactersNoSpaces" 
          value={stats.charactersNoSpaces} 
          iconSize="sm"
          className="text-muted-foreground"
        />
      </div>

      <div style={statsRightStyle}>
        <StatBadge variant="secondary">
          <Clock className="h-3 w-3 flex-shrink-0" />
          <span className="ml-1">{stats.readingTime} min</span>
        </StatBadge>
        <StatBadge variant="outline">
          {documentStatus}
        </StatBadge>
      </div>
      {children}
    </div>
  );
});

ResponsiveStatsLayout.displayName = 'ResponsiveStatsLayout';

export default ResponsiveStatsLayout;
