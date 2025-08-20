import { Eye, Monitor, Palette } from "lucide-react";
import type React from "react";
import { memo, useId } from "react";
import { ThemeSelector } from "@/components/features/ThemeSelector";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { AppPreferences } from "../types/settings";

interface AppearanceTabProps {
  preferences: AppPreferences;
  onUpdatePreference: <K extends keyof AppPreferences>(
    key: K,
    value: AppPreferences[K]
  ) => void;
}

/**
 * Appearance settings tab component
 */
export const AppearanceTab: React.FC<AppearanceTabProps> = memo(
  ({ preferences, onUpdatePreference }) => {
    const showLineNumbersId = useId();
    const showWordCountId = useId();
    const showCharacterCountId = useId();
    const reducedMotionId = useId();
    const soundEffectsId = useId();
    return (
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Palette className="w-5 h-5" />
            Theme & Visual Settings
          </CardTitle>
          <CardDescription className="text-sm">
            Customize the visual appearance of your editor
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
          <div>
            <div className="text-sm font-medium mb-3 block">Color Theme</div>
            <div className="p-3 sm:p-4 border rounded-lg bg-muted/50 overflow-hidden">
              <ThemeSelector
                currentTheme={preferences.theme}
                onThemeChange={(theme) => onUpdatePreference("theme", theme)}
              />
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-4">
              <h4 className="font-medium flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Display Options
              </h4>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id={showLineNumbersId}
                  checked={preferences.showLineNumbers}
                  onChange={(e) =>
                    onUpdatePreference("showLineNumbers", e.target.checked)
                  }
                  className="rounded"
                />
                <label htmlFor={showLineNumbersId} className="text-sm">
                  Show line numbers
                </label>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id={showWordCountId}
                  checked={preferences.showWordCount}
                  onChange={(e) =>
                    onUpdatePreference("showWordCount", e.target.checked)
                  }
                  className="rounded"
                />
                <label htmlFor={showWordCountId} className="text-sm">
                  Show word count
                </label>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id={showCharacterCountId}
                  checked={preferences.showCharacterCount}
                  onChange={(e) =>
                    onUpdatePreference("showCharacterCount", e.target.checked)
                  }
                  className="rounded"
                />
                <label htmlFor={showCharacterCountId} className="text-sm">
                  Show character count
                </label>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium flex items-center gap-2">
                <Monitor className="w-4 h-4" />
                Accessibility
              </h4>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id={reducedMotionId}
                  checked={preferences.reducedMotion}
                  onChange={(e) =>
                    onUpdatePreference("reducedMotion", e.target.checked)
                  }
                  className="rounded"
                />
                <label htmlFor={reducedMotionId} className="text-sm">
                  Reduce motion effects
                </label>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id={soundEffectsId}
                  checked={preferences.soundEffects}
                  onChange={(e) =>
                    onUpdatePreference("soundEffects", e.target.checked)
                  }
                  className="rounded"
                />
                <label htmlFor={soundEffectsId} className="text-sm">
                  Enable sound effects
                </label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
);

AppearanceTab.displayName = "AppearanceTab";
