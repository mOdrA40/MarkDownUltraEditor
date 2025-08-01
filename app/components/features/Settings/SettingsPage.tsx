import { QueryClientProvider } from "@tanstack/react-query";
import { RotateCcw, Save } from "lucide-react";
import type React from "react";
import { memo } from "react";
import { PageLoader } from "@/components/shared/PageLoader";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { useFileStorage } from "@/hooks/files";
import { queryClient } from "@/lib/queryClient";
import {
  AccountTab,
  AppearanceTab,
  BehaviorTab,
  EditorTab,
  SettingsHeader,
  SettingsTabs,
  StorageTab,
} from "./components";
import { useSettingsState } from "./hooks/useSettingsState";
import type { SettingsActions, SettingsState } from "./types";

interface SettingsPageContentProps {
  state: SettingsState;
  actions: SettingsActions;
}

/**
 * Renders the actual content of the settings page once everything is loaded.
 */
const SettingsPageContent: React.FC<SettingsPageContentProps> = memo(
  ({ state, actions }) => {
    return (
      <div
        className="min-h-screen bg-background text-foreground"
        data-settings-page
      >
        <SettingsHeader hasUnsavedChanges={state.hasUnsavedChanges} />

        <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
          <div className="max-w-4xl mx-auto">
            <Tabs
              value={state.activeTab}
              onValueChange={actions.setActiveTab}
              className="space-y-4 sm:space-y-6"
            >
              <SettingsTabs
                activeTab={state.activeTab}
                onTabChange={actions.setActiveTab}
              />

              <TabsContent
                value="appearance"
                className="space-y-4 sm:space-y-6"
              >
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
  }
);
SettingsPageContent.displayName = "SettingsPageContent";

/**
 * Component that handles the initialization logic for the settings page.
 * It ensures that all required data is loaded before rendering the content.
 */
const SettingsPageInitializer: React.FC = () => {
  const { isInitialized: isStorageInitialized } = useFileStorage();
  const { state, actions } = useSettingsState();

  if (!isStorageInitialized || state.isLoading) {
    return <PageLoader text="Loading settings..." />;
  }

  return <SettingsPageContent state={state} actions={actions} />;
};

/**
 * The main entry component for the settings page.
 * It wraps the initializer with the necessary QueryClientProvider.
 */
export const SettingsPage: React.FC = memo(() => {
  return (
    <QueryClientProvider client={queryClient}>
      <SettingsPageInitializer />
    </QueryClientProvider>
  );
});
SettingsPage.displayName = "SettingsPage";
