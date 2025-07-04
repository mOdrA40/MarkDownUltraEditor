/**
 * @fileoverview Main editor container component
 * @author Axel Modra
 */

import type React from 'react';
import { Button } from '@/components/ui/button';
import { Minimize2, Smartphone, Tablet, Monitor } from 'lucide-react';
import type { Theme } from '../../../../features/ThemeSelector';
import type { ResponsiveState } from '../../types';
import { generateResponsiveClasses, getDeviceType } from '../../utils';

/**
 * Props for EditorContainer component
 */
export interface EditorContainerProps {
  // Theme
  theme: Theme;

  // Responsive
  responsive: ResponsiveState;

  // Zen mode
  zenMode: boolean;
  onToggleZenMode: () => void;

  // Children
  children: React.ReactNode;

  // Custom styling
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Main editor container component that wraps the entire editor
 */
export const EditorContainer: React.FC<EditorContainerProps> = ({
  theme,
  responsive,
  zenMode,
  onToggleZenMode,
  children,
  className = '',
  style = {},
}) => {
  const { isMobile, isTablet } = responsive;

  // Generate responsive classes (safe for SSR)
  const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 1024;
  const deviceType = getDeviceType(screenWidth);
  const responsiveClasses = generateResponsiveClasses(deviceType);

  return (
    <div
      className={`
        min-h-screen flex flex-col transition-all duration-300 
        bg-gradient-to-br ${theme.gradient}
        ${responsiveClasses.join(' ')}
        ${className}
      `}
      style={{
        backgroundColor: theme.background,
        color: theme.text,
        ...style,
      }}
    >
      {children}

      {/* Device Indicator - Development helper */}
      <div className="fixed bottom-2 left-2 z-50 flex items-center space-x-1 bg-black/20 backdrop-blur-sm rounded px-2 py-1 text-xs opacity-50">
        {isMobile && <Smartphone className="h-3 w-3" />}
        {isTablet && <Tablet className="h-3 w-3" />}
        {!isMobile && !isTablet && <Monitor className="h-3 w-3" />}
        <span className="text-white">{isMobile ? 'Mobile' : isTablet ? 'Tablet' : 'Desktop'}</span>
      </div>

      {/* Zen Mode Toggle (floating) */}
      {zenMode && (
        <Button
          variant="outline"
          size="sm"
          onClick={onToggleZenMode}
          className="fixed top-4 right-4 z-50 backdrop-blur-md bg-white/80 dark:bg-gray-900/80"
        >
          <Minimize2 className="h-4 w-4 mr-2" />
          Exit Zen
        </Button>
      )}
    </div>
  );
};
