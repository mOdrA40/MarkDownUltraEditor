/**
 * ToolbarButton Component
 * Komponen button individual untuk toolbar markdown
 * 
 * @author Axel Modra
 */

import React from 'react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ToolbarButtonProps } from '../types/toolbar.types';

/**
 * Komponen ToolbarButton
 * Menampilkan satu button untuk format markdown dengan styling yang konsisten
 * 
 * @param props - Props untuk komponen
 * @returns JSX Element
 */
export const ToolbarButton: React.FC<ToolbarButtonProps> = React.memo(({
  button,
  className,
  size = 'sm',
  variant = 'ghost',
  disabled = false
}) => {
  return (
    <Button
      variant={variant}
      size={size}
      onClick={button.action}
      disabled={disabled}
      className={cn(
        // Base classes dengan fix untuk mencegah scroll - clean seperti vim/zen mode
        "clean-button", // Clean styling seperti vim/zen mode
        "toolbar-button-fix", // Menggunakan CSS fix untuk mencegah scroll
        "focus-fix", // Tambahan fix untuk focus state
        "prevent-layout-shift", // Mencegah layout shift
        // Custom style dari button config
        button.style,
        // Additional classes
        className
      )}
      title={`${button.tooltip}${button.shortcut ? ` (${button.shortcut})` : ''}`}
      aria-label={button.tooltip}
      data-testid={`toolbar-button-${button.label.toLowerCase().replace(/\s+/g, '-')}`}
    >
      {/* Icon jika ada */}
      {button.icon && (
        <button.icon
          className={cn(
            "mr-1",
            size === 'sm' ? "h-3 w-3" : size === 'lg' ? "h-5 w-5" : "h-4 w-4"
          )}
          aria-hidden="true"
        />
      )}
      
      {/* Label button */}
      <span className="select-none">
        {button.label}
      </span>
    </Button>
  );
});

// Set display name untuk debugging
ToolbarButton.displayName = 'ToolbarButton';
