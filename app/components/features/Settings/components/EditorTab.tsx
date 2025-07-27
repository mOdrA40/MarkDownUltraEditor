import { Type } from 'lucide-react';
import type React from 'react';
import { memo } from 'react';
import { WritingSettings } from '@/components/features/WritingSettings';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { AppPreferences } from '../types/settings';

interface EditorTabProps {
  preferences: AppPreferences;
  onUpdatePreference: <K extends keyof AppPreferences>(key: K, value: AppPreferences[K]) => void;
}

/**
 * Editor settings tab component
 */
export const EditorTab: React.FC<EditorTabProps> = memo(({ preferences, onUpdatePreference }) => {
  return (
    <Card>
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
          <Type className="w-5 h-5" />
          Writing & Editor Settings
        </CardTitle>
        <CardDescription className="text-sm">
          Configure your writing experience and editor behavior
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
        <div className="p-3 sm:p-4 border rounded-lg bg-muted/50 overflow-hidden">
          <WritingSettings
            fontSize={preferences.writingSettings.fontSize}
            onFontSizeChange={(size) =>
              onUpdatePreference('writingSettings', {
                ...preferences.writingSettings,
                fontSize: size,
              })
            }
            lineHeight={preferences.writingSettings.lineHeight}
            onLineHeightChange={(height) =>
              onUpdatePreference('writingSettings', {
                ...preferences.writingSettings,
                lineHeight: height,
              })
            }
            focusMode={preferences.writingSettings.focusMode}
            onFocusModeToggle={() =>
              onUpdatePreference('writingSettings', {
                ...preferences.writingSettings,
                focusMode: !preferences.writingSettings.focusMode,
              })
            }
            typewriterMode={preferences.writingSettings.typewriterMode}
            onTypewriterModeToggle={() =>
              onUpdatePreference('writingSettings', {
                ...preferences.writingSettings,
                typewriterMode: !preferences.writingSettings.typewriterMode,
              })
            }
            wordWrap={preferences.writingSettings.wordWrap}
            onWordWrapToggle={() =>
              onUpdatePreference('writingSettings', {
                ...preferences.writingSettings,
                wordWrap: !preferences.writingSettings.wordWrap,
              })
            }
            vimMode={preferences.writingSettings.vimMode}
            onVimModeToggle={() =>
              onUpdatePreference('writingSettings', {
                ...preferences.writingSettings,
                vimMode: !preferences.writingSettings.vimMode,
              })
            }
            zenMode={preferences.writingSettings.zenMode}
            onZenModeToggle={() =>
              onUpdatePreference('writingSettings', {
                ...preferences.writingSettings,
                zenMode: !preferences.writingSettings.zenMode,
              })
            }
          />
        </div>
      </CardContent>
    </Card>
  );
});

EditorTab.displayName = 'EditorTab';
