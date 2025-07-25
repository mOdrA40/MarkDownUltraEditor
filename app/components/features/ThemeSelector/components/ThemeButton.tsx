/**
 * ThemeButton Component
 * Individual button component for selecting themes
 *
 * @author Axel Modra
 */

import { Check } from 'lucide-react';
import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useThemeButton } from '../hooks/useThemeSelector';
import type { ThemeButtonProps } from '../types/theme.types';

/**
 * Komponen ThemeButton
 * Menampilkan satu button tema dengan gradient background dan indikator aktif
 *
 * @param props - Props untuk komponen
 * @returns JSX Element
 */
export const ThemeButton: React.FC<ThemeButtonProps> = React.memo(
  ({ theme, isActive, onClick, className, compact = false }) => {
    // Menggunakan custom hook untuk logic button
    const { buttonStyle, buttonClassName, handleClick, ariaLabel } = useThemeButton({
      theme,
      currentTheme: { ...theme, id: isActive ? theme.id : 'other' },
      onClick,
      compact,
    });

    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={handleClick}
        className={cn(
          buttonClassName,
          'prevent-layout-shift', // Mencegah layout shift
          className
        )}
        style={buttonStyle}
        title={theme.name}
        aria-label={ariaLabel}
        data-testid={`theme-button-${theme.id}`}
      >
        {isActive && (
          <Check
            className={cn('text-white drop-shadow-sm', compact ? 'h-2 w-2' : 'h-3 w-3')}
            aria-hidden="true"
          />
        )}
      </Button>
    );
  }
);

// Set display name untuk debugging
ThemeButton.displayName = 'ThemeButton';
