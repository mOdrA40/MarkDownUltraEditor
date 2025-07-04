import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth, useUser } from '@clerk/react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  User, 
  Palette, 
  Type, 
  Settings as SettingsIcon, 
  Save,
  RotateCcw,
  Database,
  Zap,
  Eye,
  Monitor
} from 'lucide-react';

import { ThemeSelector, Theme, themes, useTheme } from '@/components/features/ThemeSelector';
import { WritingSettings } from '@/components/features/WritingSettings';
import { AuthButtons } from '@/components/auth/AuthButtons';
import { useResponsiveDetection } from '@/hooks/ui/useResponsive';
import { useToast } from '@/hooks/core/useToast';
import { 
  loadSettingsFromStorage, 
  saveSettingsToStorage
} from '@/utils/writingSettingsUtils';
import { 
  DEFAULT_WRITING_SETTINGS,
  type WritingSettings as WritingSettingsType
} from '@/types/writingSettings';

// Create QueryClient instance
const queryClient = new QueryClient();

export interface AppPreferences {
  theme: Theme;
  writingSettings: WritingSettingsType;
  showLineNumbers: boolean;
  showWordCount: boolean;
  showCharacterCount: boolean;
  reducedMotion: boolean;
  soundEffects: boolean;
}

const DEFAULT_PREFERENCES: AppPreferences = {
  theme: themes[0],
  writingSettings: DEFAULT_WRITING_SETTINGS,
  showLineNumbers: false,
  showWordCount: true,
  showCharacterCount: true,
  reducedMotion: false,
  soundEffects: false,
};

function SettingsPageContent() {
  const navigate = useNavigate();
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const { toast } = useToast();
  const responsive = useResponsiveDetection();
  const { currentTheme, setTheme: setGlobalTheme } = useTheme();

  const [preferences, setPreferences] = useState<AppPreferences>({
    ...DEFAULT_PREFERENCES,
    theme: currentTheme
  });
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [activeTab, setActiveTab] = useState('appearance');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadPreferences = async () => {
      try {
        setIsLoading(true);
        
        const savedWritingSettings = loadSettingsFromStorage();
        const savedPreferences = localStorage.getItem('markdownEditor_preferences');
        
        let loadedPrefs = {
          ...DEFAULT_PREFERENCES,
          theme: currentTheme // Use global theme
        };
        
        loadedPrefs.writingSettings = savedWritingSettings;
        
        if (savedPreferences) {
          try {
            const parsed = JSON.parse(savedPreferences);
            loadedPrefs = { ...loadedPrefs, ...parsed };
          } catch (error) {
            console.warn('Failed to parse saved preferences:', error);
          }
        }
        
        setPreferences(loadedPrefs);
      } catch (error) {
        console.error('Error loading preferences:', error);
        toast({
          title: 'Settings Load Error',
          description: 'Failed to load your settings. Using defaults.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadPreferences();
  }, [toast]);

  const updatePreference = <K extends keyof AppPreferences>(
    key: K,
    value: AppPreferences[K]
  ) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
    setHasUnsavedChanges(true);

    // Apply theme immediately when changed
    if (key === 'theme') {
      setGlobalTheme(value as Theme);
    }
  };

  const savePreferences = async () => {
    try {
      localStorage.setItem('markdownEditor_theme', preferences.theme.id);
      saveSettingsToStorage(preferences.writingSettings);
      
      const { theme, writingSettings, ...appPrefs } = preferences;
      localStorage.setItem('markdownEditor_preferences', JSON.stringify(appPrefs));
      
      setHasUnsavedChanges(false);
      
      toast({
        title: 'Settings Saved',
        description: 'Your preferences have been saved successfully.',
      });
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast({
        title: 'Save Error',
        description: 'Failed to save your settings. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const resetToDefaults = () => {
    if (window.confirm('Are you sure you want to reset all settings to defaults? This cannot be undone.')) {
      setPreferences(DEFAULT_PREFERENCES);
      setHasUnsavedChanges(true);
      toast({
        title: 'Settings Reset',
        description: 'All settings have been reset to defaults.',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 bg-primary rounded-full animate-pulse mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="border-b bg-card/80 backdrop-blur-md sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Editor
              </Button>
              
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <SettingsIcon className="w-6 h-6" />
                  Settings
                </h1>
                <p className="text-sm text-muted-foreground">
                  Customize your Markdown editor experience
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {hasUnsavedChanges && (
                <Badge variant="secondary" className="animate-pulse">
                  Unsaved Changes
                </Badge>
              )}
              
              <AuthButtons
                responsive={{
                  isMobile: responsive.isMobile,
                  isTablet: responsive.isTablet,
                  isSmallTablet: responsive.windowWidth <= 640,
                }}
                onViewFiles={() => navigate('/files')}
                onSettings={() => {}}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 gap-1">
              <TabsTrigger value="appearance" className="flex items-center gap-2">
                <Palette className="w-4 h-4" />
                <span className="hidden sm:inline">Appearance</span>
              </TabsTrigger>
              <TabsTrigger value="editor" className="flex items-center gap-2">
                <Type className="w-4 h-4" />
                <span className="hidden sm:inline">Editor</span>
              </TabsTrigger>
              <TabsTrigger value="behavior" className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                <span className="hidden sm:inline">Behavior</span>
              </TabsTrigger>
              <TabsTrigger value="storage" className="flex items-center gap-2">
                <Database className="w-4 h-4" />
                <span className="hidden sm:inline">Storage</span>
              </TabsTrigger>
              <TabsTrigger value="account" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">Account</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="appearance" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="w-5 h-5" />
                    Theme & Visual Settings
                  </CardTitle>
                  <CardDescription>
                    Customize the visual appearance of your editor
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <label className="text-sm font-medium mb-3 block">Color Theme</label>
                    <div className="p-4 border rounded-lg bg-muted/50">
                      <ThemeSelector
                        currentTheme={preferences.theme}
                        onThemeChange={(theme) => updatePreference('theme', theme)}
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-4">
                      <h4 className="font-medium flex items-center gap-2">
                        <Eye className="w-4 h-4" />
                        Display Options
                      </h4>
                      
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          id="showLineNumbers"
                          checked={preferences.showLineNumbers}
                          onChange={(e) => updatePreference('showLineNumbers', e.target.checked)}
                          className="rounded"
                        />
                        <label htmlFor="showLineNumbers" className="text-sm">Show line numbers</label>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          id="showWordCount"
                          checked={preferences.showWordCount}
                          onChange={(e) => updatePreference('showWordCount', e.target.checked)}
                          className="rounded"
                        />
                        <label htmlFor="showWordCount" className="text-sm">Show word count</label>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          id="showCharacterCount"
                          checked={preferences.showCharacterCount}
                          onChange={(e) => updatePreference('showCharacterCount', e.target.checked)}
                          className="rounded"
                        />
                        <label htmlFor="showCharacterCount" className="text-sm">Show character count</label>
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
                          id="reducedMotion"
                          checked={preferences.reducedMotion}
                          onChange={(e) => updatePreference('reducedMotion', e.target.checked)}
                          className="rounded"
                        />
                        <label htmlFor="reducedMotion" className="text-sm">Reduce motion effects</label>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          id="soundEffects"
                          checked={preferences.soundEffects}
                          onChange={(e) => updatePreference('soundEffects', e.target.checked)}
                          className="rounded"
                        />
                        <label htmlFor="soundEffects" className="text-sm">Enable sound effects</label>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="editor" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Type className="w-5 h-5" />
                    Writing & Editor Settings
                  </CardTitle>
                  <CardDescription>
                    Configure your writing experience and editor behavior
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="p-4 border rounded-lg bg-muted/50">
                    <WritingSettings
                      fontSize={preferences.writingSettings.fontSize}
                      onFontSizeChange={(size) => updatePreference('writingSettings', { ...preferences.writingSettings, fontSize: size })}
                      lineHeight={preferences.writingSettings.lineHeight}
                      onLineHeightChange={(height) => updatePreference('writingSettings', { ...preferences.writingSettings, lineHeight: height })}
                      focusMode={preferences.writingSettings.focusMode}
                      onFocusModeToggle={() => updatePreference('writingSettings', { ...preferences.writingSettings, focusMode: !preferences.writingSettings.focusMode })}
                      typewriterMode={preferences.writingSettings.typewriterMode}
                      onTypewriterModeToggle={() => updatePreference('writingSettings', { ...preferences.writingSettings, typewriterMode: !preferences.writingSettings.typewriterMode })}
                      wordWrap={preferences.writingSettings.wordWrap}
                      onWordWrapToggle={() => updatePreference('writingSettings', { ...preferences.writingSettings, wordWrap: !preferences.writingSettings.wordWrap })}
                      vimMode={preferences.writingSettings.vimMode}
                      onVimModeToggle={() => updatePreference('writingSettings', { ...preferences.writingSettings, vimMode: !preferences.writingSettings.vimMode })}
                      zenMode={preferences.writingSettings.zenMode}
                      onZenModeToggle={() => updatePreference('writingSettings', { ...preferences.writingSettings, zenMode: !preferences.writingSettings.zenMode })}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="behavior" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Behavior Settings</CardTitle>
                  <CardDescription>Coming soon...</CardDescription>
                </CardHeader>
              </Card>
            </TabsContent>

            <TabsContent value="storage" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Storage Management</CardTitle>
                  <CardDescription>Coming soon...</CardDescription>
                </CardHeader>
              </Card>
            </TabsContent>

            <TabsContent value="account" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Account Information</CardTitle>
                  <CardDescription>
                    {isSignedIn && user ? `Welcome back, ${user.fullName || 'User'}!` : 'Please sign in to manage your account.'}
                  </CardDescription>
                </CardHeader>
              </Card>
            </TabsContent>
            
            <Card className="sticky bottom-4 bg-card/95 backdrop-blur-md border shadow-lg">
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {hasUnsavedChanges && (
                      <div className="flex items-center gap-2 text-sm text-amber-600">
                        <div className="w-2 h-2 bg-amber-600 rounded-full animate-pulse" />
                        You have unsaved changes
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Button 
                      variant="outline" 
                      onClick={resetToDefaults}
                      className="flex items-center gap-2"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Reset to Defaults
                    </Button>
                    
                    <Button 
                      onClick={savePreferences}
                      disabled={!hasUnsavedChanges}
                      className="flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      Save Settings
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <SettingsPageContent />
    </QueryClientProvider>
  );
}
