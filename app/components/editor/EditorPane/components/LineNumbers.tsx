import React from 'react';
import { LineNumbersConfig } from "../types/editorPane.types";
import { generateLineNumberStyles } from "../utils/editorStyles";

/**
 * Line numbers overlay component
 */
export const LineNumbers: React.FC<LineNumbersConfig> = ({
  show,
  markdown,
  fontSize,
  lineHeight,
  theme
}) => {
  // Don't render if not shown
  if (!show) return null;

  const lineNumberStyles = generateLineNumberStyles(fontSize, lineHeight, theme);

  return (
    <div
      className="absolute left-0 top-0 w-12 h-full border-r text-xs font-mono pt-6 px-2 pointer-events-none select-none"
      style={lineNumberStyles}
    >
      {markdown.split('\n').map((_, index) => (
        <div key={index} style={{ lineHeight }}>
          {index + 1}
        </div>
      ))}
    </div>
  );
};
