import React from 'react';
import { FocusModeConfig } from "../types/editorPane.types";
import { generateFocusModeGradient } from "../utils/editorStyles";

/**
 * Focus mode overlay component that creates a gradient effect
 */
export const FocusModeOverlay: React.FC<FocusModeConfig> = ({
  enabled,
  theme
}) => {
  // Don't render if not enabled
  if (!enabled) return null;

  const gradientBackground = generateFocusModeGradient(theme);

  return (
    <div className="absolute inset-0 pointer-events-none">
      <div
        className="absolute inset-0 transition-all duration-300"
        style={{
          background: gradientBackground
        }}
      />
    </div>
  );
};
