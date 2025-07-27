import { QueryClientProvider } from '@tanstack/react-query';
import { RotateCcw, Save } from 'lucide-react';
import type React from 'react';
import { memo } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { queryClient } from '@/lib/queryClient';
import {
  AccountTab,
  AppearanceTab,
  BehaviorTab,
  EditorTab,
  SettingsHeader,
  SettingsTabs,
  StorageTab,
} from './components';
import { useSettingsState } from './hooks/useSettingsState';

/**
 * Main settings page component
 */
export const SettingsPageContent: React.FC = memo(() => {
  const { state, actions } = useSettingsState();

  if (state.isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 bg-primary rounded-full animate-pulse mx-auto mb-4" />
          <p className="text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground" data-settings-page>
      <SettingsHeader hasUnsavedChanges={state.hasUnsavedChanges} />

      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
        <div className="max-w-4xl mx-auto">
          <Tabs
            value={state.activeTab}
            onValueChange={actions.setActiveTab}
            className="space-y-4 sm:space-y-6"
          >
            <SettingsTabs activeTab={state.activeTab} onTabChange={actions.setActiveTab} />

            <TabsContent value="appearance" className="space-y-4 sm:space-y-6">
              <AppearanceTab
                preferences={state.preferences}
                onUpdatePreference={actions.updatePreference}
              />
            </TabsContent>

            <TabsContent value="editor" className="space-y-4 sm:space-y-6">
              <EditorTab
                preferences={state.preferences}
                onUpdatePreference={actions.updatePreference}
              />
            </TabsContent>

            <TabsContent value="behavior" className="space-y-4 sm:space-y-6">
              <BehaviorTab />
            </TabsContent>

            <TabsContent value="storage" className="space-y-4 sm:space-y-6">
              <StorageTab />
            </TabsContent>

            <TabsContent value="account" className="space-y-4 sm:space-y-6">
              <AccountTab
                isEditingName={state.isEditingName}
                editFirstName={state.editFirstName}
                editLastName={state.editLastName}
                onSetIsEditingName={actions.setIsEditingName}
                onSetEditFirstName={actions.setEditFirstName}
                onSetEditLastName={actions.setEditLastName}
              />
            </TabsContent>
          </Tabs>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-6 sm:mt-8">
            <Button
              onClick={actions.savePreferences}
              disabled={!state.hasUnsavedChanges}
              className="flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save Settings
            </Button>

            <Button
              variant="outline"
              onClick={actions.resetToDefaults}
              className="flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Reset to Defaults
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
});

SettingsPageContent.displayName = 'SettingsPageContent';

/**
 * Settings page with QueryClient provider
 */
export const SettingsPage: React.FC = memo(() => {
  return (
    <QueryClientProvider client={queryClient}>
      <SettingsPageContent />
    </QueryClientProvider>
  );
});

SettingsPage.displayName = 'SettingsPage';
