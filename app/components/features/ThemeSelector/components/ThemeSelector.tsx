/**
 * ThemeSelector Component
 * Komponen utama untuk memilih tema aplikasi
 *
 * @author Axel Modra
 */

import { Palette } from 'lucide-react';
import React from 'react';
import { cn } from '@/lib/utils';
import { useThemeSelector } from '../hooks/useThemeSelector';
import type { ThemeSelectorProps } from '../types/theme.types';
import { ThemeButton } from './ThemeButton';
/**
 * Komponen ThemeSelector
 * Menampilkan daftar tema yang tersedia dengan icon palette dan theme buttons
 *
 * @param props - Props untuk komponen
 * @returns JSX Element
 */
export const ThemeSelector: React.FC<ThemeSelectorProps> = React.memo(
  ({ currentTheme, onThemeChange, className, compact = false }) => {
    // Menggunakan custom hook untuk theme selector logic
    const { availableThemes, changeTheme, isThemeActive } = useThemeSelector({
      currentTheme,
      onThemeChange,
    });
    return (
      <fieldset
        className={cn(
          'flex items-center border-0 p-0 m-0',
          compact ? 'space-x-1' : 'space-x-2',
          className
        )}
      >
        <legend className="sr-only">Theme selector</legend>
        {/* Icon Palette */}
        <Palette
          className={cn('text-muted-foreground', compact ? 'h-3 w-3' : 'h-4 w-4')}
          aria-hidden="true"
        />

        {/* Container untuk theme buttons */}
        <div
          className={cn(
            'flex scroll-container-stable', // Tambahkan class untuk mencegah scroll
            compact ? 'space-x-0.5' : 'space-x-1'
          )}
          role="radiogroup"
          aria-label="Available themes"
        >
          {availableThemes.map((theme) => (
            <ThemeButton
              key={theme.id}
              theme={theme}
              isActive={isThemeActive(theme)}
              onClick={changeTheme}
              compact={compact}
            />
          ))}
        </div>
      </fieldset>
    );
  }
);
// Set display name untuk debugging
ThemeSelector.displayName = 'ThemeSelector';
