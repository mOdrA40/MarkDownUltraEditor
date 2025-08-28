import type React from 'react';
import type { FocusModeConfig } from '../types/editorPane.types';
import { generateFocusModeGradient } from '../utils/editorStyles';

export const FocusModeOverlay: React.FC<FocusModeConfig> = ({ enabled, theme }) => {
  if (!enabled) return null;

  const gradientBackground = generateFocusModeGradient(theme);

  return (
    <div className="absolute inset-0 pointer-events-none">
      <div
        className="absolute inset-0 transition-all duration-300"
        style={{
          background: gradientBackground,
        }}
      />
    </div>
  );
};
