/**
 * TabletToolbar Component
 * Layout toolbar khusus untuk tablet devices (500px - 1279px)
 *
 * @author Axel Modra
 */

import { Code, FileText } from "lucide-react";
import React from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { TabletToolbarProps } from "../types/toolbar.types";
import { ToolbarButton } from "./ToolbarButton";

/**
 * Komponen TabletToolbar
 * Menampilkan toolbar dalam layout yang optimal untuk tablet
 * Mendukung dua mode: small tablet (500-767px) dan medium tablet (768-1279px)
 *
 * @param props - Props untuk komponen
 * @returns JSX Element
 */
export const TabletToolbar: React.FC<TabletToolbarProps> = React.memo(
  ({
    formatButtons,
    onInsertText,
    className,
    compact = false,
    currentTheme,
  }) => {
    // Pisahkan buttons berdasarkan kategori
    const headingButtons = formatButtons
      .filter((btn) => btn.category === "heading")
      .slice(0, 3);
    const formattingButtons = formatButtons
      .filter((btn) => btn.category === "formatting")
      .slice(0, 2);
    const contentButtons = formatButtons.filter(
      (btn) =>
        btn.category === "content" ||
        btn.category === "list" ||
        btn.category === "media"
    );

    // Action untuk code block
    const insertCodeBlock = () => {
      onInsertText(
        '```javascript\n// Your code here\nfunction greet(name) {\n  return "Hello, " + name + "!";\n}\n```'
      );
    };

    // Small Tablet Layout (500px-767px) - Compact
    if (compact) {
      return (
        <div
          className={cn(
            "hidden sm:block md:hidden px-2 py-2 border-b bg-background/50 backdrop-blur",
            className
          )}
        >
          {/* Row 1: Essential formatting - Compact */}
          <div className="flex items-center justify-center space-x-1 mb-2 overflow-x-auto scroll-container-stable">
            {headingButtons.map((button) => (
              <ToolbarButton
                key={button.label}
                button={button}
                className="h-6 px-2 text-xs font-medium flex-shrink-0"
                size="sm"
                variant="ghost"
                currentTheme={currentTheme}
              />
            ))}

            <Separator orientation="vertical" className="h-4 mx-1" />

            {formattingButtons.map((button) => (
              <ToolbarButton
                key={button.label}
                button={button}
                className="h-6 px-2 text-xs flex-shrink-0"
                size="sm"
                variant="ghost"
                currentTheme={currentTheme}
              />
            ))}

            <Separator orientation="vertical" className="h-4 mx-1" />

            <Button
              variant="ghost"
              size="sm"
              onClick={() => onInsertText("`code`")}
              className="h-6 px-2 text-xs flex-shrink-0 clean-button toolbar-button-fix prevent-layout-shift"
              title="Inline Code"
              style={currentTheme ? { color: currentTheme.text } : undefined}
              data-theme-button="true"
            >
              <Code className="h-3 w-3" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={insertCodeBlock}
              className="h-6 px-2 text-xs flex-shrink-0 clean-button toolbar-button-fix prevent-layout-shift"
              title="Code Block"
              style={currentTheme ? { color: currentTheme.text } : undefined}
              data-theme-button="true"
            >
              <FileText className="h-3 w-3" />
            </Button>
          </div>

          {/* Row 2: Content elements - Compact */}
          <div className="flex items-center justify-center space-x-1 overflow-x-auto scroll-container-stable">
            {contentButtons.map((button) => (
              <ToolbarButton
                key={button.label}
                button={button}
                className="h-6 px-2 text-xs flex-shrink-0"
                size="sm"
                variant="ghost"
                currentTheme={currentTheme}
              />
            ))}
          </div>
        </div>
      );
    }

    // Medium Tablet Layout (768px-1279px) - Standard
    return (
      <div
        className={cn(
          "hidden md:block xl:hidden px-3 py-2 border-b bg-background/50 backdrop-blur",
          className
        )}
      >
        {/* Row 1: Headings & Formatting */}
        <div className="flex items-center justify-center space-x-2 mb-2">
          {headingButtons.map((button) => (
            <ToolbarButton
              key={button.label}
              button={button}
              className="h-7 px-3 text-xs font-medium"
              size="sm"
              variant="ghost"
              currentTheme={currentTheme}
            />
          ))}

          <Separator orientation="vertical" className="h-5" />

          {formattingButtons.map((button) => (
            <ToolbarButton
              key={button.label}
              button={button}
              className="h-7 px-3 text-xs"
              size="sm"
              variant="ghost"
              currentTheme={currentTheme}
            />
          ))}

          <Separator orientation="vertical" className="h-5" />

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onInsertText("`code`")}
            className="h-7 px-3 text-xs clean-button toolbar-button-fix prevent-layout-shift"
            title="Inline Code"
            style={currentTheme ? { color: currentTheme.text } : undefined}
            data-theme-button="true"
          >
            <Code className="h-3 w-3 mr-1" />
            Code
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={insertCodeBlock}
            className="h-7 px-3 text-xs clean-button toolbar-button-fix prevent-layout-shift"
            title="Code Block"
            style={currentTheme ? { color: currentTheme.text } : undefined}
            data-theme-button="true"
          >
            <FileText className="h-3 w-3 mr-1" />
            Block
          </Button>
        </div>

        {/* Row 2: Content elements */}
        <div className="flex items-center justify-center space-x-2">
          {contentButtons.map((button) => (
            <ToolbarButton
              key={button.label}
              button={button}
              className="h-7 px-3 text-xs"
              size="sm"
              variant="ghost"
              currentTheme={currentTheme}
            />
          ))}
        </div>
      </div>
    );
  }
);

// Set display name untuk debugging
TabletToolbar.displayName = "TabletToolbar";
