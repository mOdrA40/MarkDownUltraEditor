/**
 * WritingSettings Component - Komponen Utama Writing Settings
 * Komponen orchestrator yang menggabungkan semua sub-komponen
 *
 * @author Axel Modra
 */

import type React from 'react';
import { memo } from 'react';
import { useResponsiveLayout } from '../hooks/useResponsiveLayout';
import type { WritingSettingsProps } from '../types/settings.types';
import { FontSizeControl } from './FontSizeControl';
import { LineHeightControl } from './LineHeightControl';
import { ResponsiveLayout } from './ResponsiveLayout';
import { WritingModeButtons } from './WritingModeButtons';

/**
 * Komponen WritingSettings utama
 * Menggabungkan semua kontrol dalam layout responsif
 */
export const WritingSettings: React.FC<WritingSettingsProps> = memo(
  ({
    fontSize,
    onFontSizeChange,
    lineHeight,
    onLineHeightChange,
    focusMode,
    onFocusModeToggle,
    typewriterMode,
    onTypewriterModeToggle,
    wordWrap,
    onWordWrapToggle,
    vimMode,
    onVimModeToggle,
    zenMode,
    onZenModeToggle,
    className = '',
    children,
    forceMobileLayout = false,
  }) => {
    const { breakpoint } = useResponsiveLayout();

    // Override breakpoint if forceMobileLayout is true
    const effectiveBreakpoint = forceMobileLayout ? 'mobile' : breakpoint;

    // Render berdasarkan breakpoint
    const renderContent = () => {
      switch (effectiveBreakpoint) {
        case 'mobile':
          return (
            <ResponsiveLayout breakpoint={effectiveBreakpoint} className={className}>
              {/* Font Size Control */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-sm">Font Size</span>
                </div>
                <FontSizeControl
                  fontSize={fontSize}
                  onFontSizeChange={onFontSizeChange}
                  size="lg"
                />
              </div>

              {/* Line Height Control */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-sm">Line Height</span>
                </div>
                <LineHeightControl
                  lineHeight={lineHeight}
                  onLineHeightChange={onLineHeightChange}
                  size="lg"
                />
              </div>

              {/* Writing Mode Buttons - Grid Layout */}
              <WritingModeButtons
                focusMode={focusMode}
                onFocusModeToggle={onFocusModeToggle}
                typewriterMode={typewriterMode}
                onTypewriterModeToggle={onTypewriterModeToggle}
                wordWrap={wordWrap}
                onWordWrapToggle={onWordWrapToggle}
                vimMode={vimMode}
                onVimModeToggle={onVimModeToggle}
                zenMode={zenMode}
                onZenModeToggle={onZenModeToggle}
                size="md"
                orientation="grid"
              />

              {children}
            </ResponsiveLayout>
          );

        case 'small-tablet':
          return (
            <ResponsiveLayout breakpoint={effectiveBreakpoint} className={className}>
              <FontSizeControl fontSize={fontSize} onFontSizeChange={onFontSizeChange} size="sm" />

              <LineHeightControl
                lineHeight={lineHeight}
                onLineHeightChange={onLineHeightChange}
                size="sm"
              />

              <WritingModeButtons
                focusMode={focusMode}
                onFocusModeToggle={onFocusModeToggle}
                typewriterMode={typewriterMode}
                onTypewriterModeToggle={onTypewriterModeToggle}
                wordWrap={wordWrap}
                onWordWrapToggle={onWordWrapToggle}
                vimMode={vimMode}
                onVimModeToggle={onVimModeToggle}
                zenMode={zenMode}
                onZenModeToggle={onZenModeToggle}
                size="sm"
                orientation="horizontal"
              />

              {children}
            </ResponsiveLayout>
          );
        default:
          return (
            <ResponsiveLayout breakpoint={effectiveBreakpoint} className={className}>
              <FontSizeControl fontSize={fontSize} onFontSizeChange={onFontSizeChange} size="md" />

              <LineHeightControl
                lineHeight={lineHeight}
                onLineHeightChange={onLineHeightChange}
                size="md"
              />

              <WritingModeButtons
                focusMode={focusMode}
                onFocusModeToggle={onFocusModeToggle}
                typewriterMode={typewriterMode}
                onTypewriterModeToggle={onTypewriterModeToggle}
                wordWrap={wordWrap}
                onWordWrapToggle={onWordWrapToggle}
                vimMode={vimMode}
                onVimModeToggle={onVimModeToggle}
                zenMode={zenMode}
                onZenModeToggle={onZenModeToggle}
                size="md"
                orientation="horizontal"
              />

              {children}
            </ResponsiveLayout>
          );
      }
    };

    return <div className="w-full">{renderContent()}</div>;
  },
  (prevProps, nextProps) => {
    // Custom comparison function untuk memo - mencegah re-render yang tidak perlu
    return (
      prevProps.fontSize === nextProps.fontSize &&
      prevProps.lineHeight === nextProps.lineHeight &&
      prevProps.focusMode === nextProps.focusMode &&
      prevProps.typewriterMode === nextProps.typewriterMode &&
      prevProps.wordWrap === nextProps.wordWrap &&
      prevProps.vimMode === nextProps.vimMode &&
      prevProps.zenMode === nextProps.zenMode &&
      prevProps.onFontSizeChange === nextProps.onFontSizeChange &&
      prevProps.onLineHeightChange === nextProps.onLineHeightChange &&
      prevProps.onFocusModeToggle === nextProps.onFocusModeToggle &&
      prevProps.onTypewriterModeToggle === nextProps.onTypewriterModeToggle &&
      prevProps.onWordWrapToggle === nextProps.onWordWrapToggle &&
      prevProps.onVimModeToggle === nextProps.onVimModeToggle &&
      prevProps.onZenModeToggle === nextProps.onZenModeToggle &&
      prevProps.className === nextProps.className
    );
  }
);

WritingSettings.displayName = 'WritingSettings';

export default WritingSettings;
