/**
 * DesktopToolbar Component
 * Layout toolbar khusus untuk desktop devices (1280px+)
 * 
 * @author Axel Modra
 */

import React from 'react';
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DesktopToolbarProps } from '../types/toolbar.types';
import { ToolbarButton } from './ToolbarButton';

/**
 * Komponen DesktopToolbar
 * Menampilkan toolbar dalam single row layout yang optimal untuk desktop
 * 
 * @param props - Props untuk komponen
 * @returns JSX Element
 */
export const DesktopToolbar: React.FC<DesktopToolbarProps> = React.memo(({
  formatButtons,
  onInsertText,
  className,
  currentTheme
}) => {
  // Pisahkan buttons berdasarkan kategori untuk grouping yang lebih baik
  const headingButtons = formatButtons.filter(btn => btn.category === 'heading').slice(0, 3);
  const formattingButtons = formatButtons.filter(btn => btn.category === 'formatting').slice(0, 2);
  const codeButtons = formatButtons.filter(btn => btn.category === 'code').slice(0, 1);
  const contentButtons = formatButtons.filter(btn => 
    btn.category === 'content' || btn.category === 'list' || btn.category === 'media'
  );

  // Action untuk code block
  const insertCodeBlock = () => {
    onInsertText('```javascript\n// Your code here\nconsole.log("Hello World!");\n```');
  };

  return (
    <div className={cn(
      "hidden xl:block px-4 py-2 border-b bg-background/50 backdrop-blur",
      className
    )}>
      <div className="flex items-center space-x-1 overflow-x-auto scroll-container-stable">
        {/* Heading Buttons Group */}
        {headingButtons.map((button, index) => (
          <ToolbarButton
            key={`heading-${index}`}
            button={button}
            className="h-8 text-xs font-medium"
            size="sm"
            variant="ghost"
            currentTheme={currentTheme}
          />
        ))}

        <Separator orientation="vertical" className="h-6" />

        {/* Formatting Buttons Group */}
        {formattingButtons.map((button, index) => (
          <ToolbarButton
            key={`formatting-${index}`}
            button={button}
            className="h-8 text-xs"
            size="sm"
            variant="ghost"
            currentTheme={currentTheme}
          />
        ))}

        <Separator orientation="vertical" className="h-6" />

        {/* Code Buttons Group */}
        {codeButtons.map((button, index) => (
          <ToolbarButton
            key={`code-${index}`}
            button={button}
            className="h-8 text-xs"
            size="sm"
            variant="ghost"
            currentTheme={currentTheme}
          />
        ))}

        <Button
          variant="ghost"
          size="sm"
          onClick={insertCodeBlock}
          className="h-8 text-xs clean-button toolbar-button-fix prevent-layout-shift"
          title="Code Block"
          style={currentTheme ? { color: currentTheme.text } : undefined}
          data-theme-button="true"
        >
          <FileText className="h-3 w-3 mr-1" />
          Block
        </Button>

        <Separator orientation="vertical" className="h-6" />

        {/* Content Buttons Group */}
        {contentButtons.map((button, index) => (
          <ToolbarButton
            key={`content-${index}`}
            button={button}
            className="h-8 text-xs"
            size="sm"
            variant="ghost"
            currentTheme={currentTheme}
          />
        ))}
      </div>
    </div>
  );
});

// Set display name untuk debugging
DesktopToolbar.displayName = 'DesktopToolbar';
