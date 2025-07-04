/**
 * MobileToolbar Component
 * Layout toolbar khusus untuk mobile devices (320px - 499px)
 * 
 * @author Axel Modra
 */

import React from 'react';
import { Button } from "@/components/ui/button";
import { FileText, Code } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MobileToolbarProps } from '../types/toolbar.types';
import { ToolbarButton } from './ToolbarButton';

/**
 * Komponen MobileToolbar
 * Menampilkan toolbar dalam layout grid yang optimal untuk mobile
 * 
 * @param props - Props untuk komponen
 * @returns JSX Element
 */
export const MobileToolbar: React.FC<MobileToolbarProps> = React.memo(({
  formatButtons,
  onInsertText,
  className,
  currentTheme
}) => {
  // Pisahkan buttons berdasarkan kategori untuk layout yang lebih baik
  const headingButtons = formatButtons.filter(btn => btn.category === 'heading').slice(0, 3);
  const formattingButtons = formatButtons.filter(btn => btn.category === 'formatting').slice(0, 2);
  const contentButtons = formatButtons.filter(btn => 
    btn.category === 'content' || btn.category === 'list' || btn.category === 'media'
  );

  // Action untuk code block
  const insertCodeBlock = () => {
    onInsertText('```javascript\n// Your code here\nconsole.log("Hello World!");\n```');
  };

  return (
    <div className={cn("w-full block sm:hidden", className)}>
      {/* Row 1: Headings (H1, H2, H3) */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        {headingButtons.map((button, index) => (
          <ToolbarButton
            key={`heading-${index}`}
            button={button}
            className="h-9 text-xs font-medium"
            size="sm"
            variant="outline"
            currentTheme={currentTheme}
          />
        ))}
      </div>

      {/* Row 2: Text Formatting (Bold, Italic) */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        {formattingButtons.map((button, index) => (
          <ToolbarButton
            key={`formatting-${index}`}
            button={button}
            className="h-9 text-xs"
            size="sm"
            variant="outline"
            currentTheme={currentTheme}
          />
        ))}
      </div>
      
      {/* Row 3: Code Buttons */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onInsertText('`code`')}
          className="h-9 text-xs clean-button toolbar-button-fix prevent-layout-shift"
          title="Inline Code"
          style={currentTheme ? { color: currentTheme.text } : undefined}
          data-theme-button="true"
        >
          <Code className="h-3 w-3 mr-1" />
          Code
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={insertCodeBlock}
          className="h-9 text-xs clean-button toolbar-button-fix prevent-layout-shift"
          title="Code Block"
          style={currentTheme ? { color: currentTheme.text } : undefined}
          data-theme-button="true"
        >
          <FileText className="h-3 w-3 mr-1" />
          Block
        </Button>
      </div>

      {/* Row 4: Content Buttons (Link, Image, Quote, List, etc.) */}
      <div className="grid grid-cols-2 gap-2">
        {contentButtons.map((button, index) => (
          <ToolbarButton
            key={`content-${index}`}
            button={button}
            className="h-9 text-xs"
            size="sm"
            variant="outline"
            currentTheme={currentTheme}
          />
        ))}
      </div>
    </div>
  );
});

// Set display name untuk debugging
MobileToolbar.displayName = 'MobileToolbar';
