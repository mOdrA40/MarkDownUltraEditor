import { useAuth, useUser } from '@clerk/react-router';
import { QueryClientProvider } from '@tanstack/react-query';
import {
  ArrowLeft,
  Cloud,
  Database,
  Edit,
  Eye,
  Monitor,
  Palette,
  RotateCcw,
  Save,
  Settings as SettingsIcon,
  Type,
  User,
  X,
  Zap,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { type LoaderFunctionArgs, type MetaFunction, useNavigate } from 'react-router';
import { AuthButtons } from '@/components/auth/AuthButtons';
import { type Theme, ThemeSelector, themes, useTheme } from '@/components/features/ThemeSelector';
import { WritingSettings } from '@/components/features/WritingSettings';
import SecureErrorBoundary from '@/components/shared/SecureErrorBoundary';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/core/useToast';
import { useFileStorage } from '@/hooks/files';
import { useResponsiveDetection } from '@/hooks/ui/useResponsive';
import { queryClient } from '@/lib/queryClient';
import { type SessionData, type SessionStats, sessionManager } from '@/services/sessionManager';
import {
  DEFAULT_WRITING_SETTINGS,
  type WritingSettings as WritingSettingsType,
} from '@/types/writingSettings';
import { safeConsole } from '@/utils/console';
import { securityMiddleware } from '@/utils/security/routeMiddleware';
import { ErrorCategory } from '@/utils/sentry';
import { loadSettingsFromStorage, saveSettingsToStorage } from '@/utils/writingSettingsUtils';

export const meta: MetaFunction = () => {
  return [
    { title: 'Settings - MarkDown Ultra Editor' },
    {
      name: 'description',
      content:
        'Customize your markdown editor experience with themes, writing settings, and account management',
    },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    { property: 'og:title', content: 'Settings - MarkDown Ultra Editor' },
    {
      property: 'og:description',
      content:
        'Customize your markdown editor experience with themes, writing settings, and account management',
    },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary' },
    { name: 'twitter:title', content: 'Settings - MarkDown Ultra Editor' },
    {
      name: 'twitter:description',
      content:
        'Customize your markdown editor experience with themes, writing settings, and account management',
    },
  ];
};

export async function loader(args: LoaderFunctionArgs) {
  const security = await securityMiddleware.protected(args);
  return security;
}

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
  const fileStorage = useFileStorage();

  const [preferences, setPreferences] = useState<AppPreferences>({
    ...DEFAULT_PREFERENCES,
    theme: currentTheme,
  });
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [activeTab, setActiveTab] = useState('appearance');
  const [isLoading, setIsLoading] = useState(true);
  const [sessionStats, setSessionStats] = useState<SessionStats | null>(null);
  const [userSessions, setUserSessions] = useState<SessionData[]>([]);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');

  useEffect(() => {
    const loadSessions = async () => {
      if (isSignedIn && user?.id) {
        try {
          const currentSessionId = `session_${user.id}_${Date.now()}`;
          await sessionManager.createSession(user.id, currentSessionId);

          const stats = await sessionManager.getSessionStats(user.id);
          const sessions = await sessionManager.getUserSessions(user.id);
          setSessionStats(stats);
          setUserSessions(sessions);
        } catch (error) {
          safeConsole.error('Failed to load sessions:', error);
        }
      }
    };

    loadSessions();
  }, [isSignedIn, user?.id]);

  useEffect(() => {
    if (!isSignedIn || !user?.id) return;

    const currentSessionId = `session_${user.id}_${Date.now()}`;

    // Update activity every 5 minutes
    const activityInterval = setInterval(
      async () => {
        try {
          await sessionManager.updateActivity(currentSessionId);
        } catch (error) {
          safeConsole.error('Failed to update session activity:', error);
        }
      },
      5 * 60 * 1000
    ); // 5 minutes

    // Cleanup on unmount
    return () => {
      clearInterval(activityInterval);
    };
  }, [isSignedIn, user?.id]);

  useEffect(() => {
    const loadPreferences = async () => {
      try {
        setIsLoading(true);

        const savedWritingSettings = loadSettingsFromStorage();
        const savedPreferences = localStorage.getItem('markdownEditor_preferences');

        let loadedPrefs = {
          ...DEFAULT_PREFERENCES,
          theme: currentTheme,
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
  }, [toast, currentTheme]);

  const updatePreference = <K extends keyof AppPreferences>(key: K, value: AppPreferences[K]) => {
    setPreferences((prev) => ({ ...prev, [key]: value }));
    setHasUnsavedChanges(true);

    if (key === 'theme') {
      setGlobalTheme(value as Theme);
    }
  };

  const savePreferences = async () => {
    try {
      // Save app preferences
      localStorage.setItem('markdownEditor_theme', preferences.theme.id);
      saveSettingsToStorage(preferences.writingSettings);

      const { theme: _theme, writingSettings: _writingSettings, ...appPrefs } = preferences;
      localStorage.setItem('markdownEditor_preferences', JSON.stringify(appPrefs));

      // Save name changes if in editing mode
      if (isEditingName && user) {
        try {
          await user.update({
            firstName: editFirstName,
            lastName: editLastName,
          });
          setIsEditingName(false);
        } catch (nameError) {
          safeConsole.error('Failed to update name:', nameError);
          toast({
            title: 'Name Update Failed',
            description: 'Settings saved but name update failed. Please try again.',
            variant: 'destructive',
          });
          return;
        }
      }

      setHasUnsavedChanges(false);

      toast({
        title: 'Settings Saved',
        description: isEditingName
          ? 'Your preferences and name have been saved successfully.'
          : 'Your preferences have been saved successfully.',
      });
    } catch (error) {
      safeConsole.error('Error saving preferences:', error);
      toast({
        title: 'Save Error',
        description: 'Failed to save your settings. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const resetToDefaults = () => {
    if (
      window.confirm(
        'Are you sure you want to reset all settings to defaults? This cannot be undone.'
      )
    ) {
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
          <div className="w-8 h-8 bg-primary rounded-full animate-pulse mx-auto mb-4" />
          <p className="text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground" data-settings-page>
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
                onSettings={() => {
                  // Already on settings page - no action needed
                }}
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
                  <CardDescription>Customize the visual appearance of your editor</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <div className="text-sm font-medium mb-3 block">Color Theme</div>
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
                        <label htmlFor="showLineNumbers" className="text-sm">
                          Show line numbers
                        </label>
                      </div>

                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          id="showWordCount"
                          checked={preferences.showWordCount}
                          onChange={(e) => updatePreference('showWordCount', e.target.checked)}
                          className="rounded"
                        />
                        <label htmlFor="showWordCount" className="text-sm">
                          Show word count
                        </label>
                      </div>

                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          id="showCharacterCount"
                          checked={preferences.showCharacterCount}
                          onChange={(e) => updatePreference('showCharacterCount', e.target.checked)}
                          className="rounded"
                        />
                        <label htmlFor="showCharacterCount" className="text-sm">
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
                          id="reducedMotion"
                          checked={preferences.reducedMotion}
                          onChange={(e) => updatePreference('reducedMotion', e.target.checked)}
                          className="rounded"
                        />
                        <label htmlFor="reducedMotion" className="text-sm">
                          Reduce motion effects
                        </label>
                      </div>

                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          id="soundEffects"
                          checked={preferences.soundEffects}
                          onChange={(e) => updatePreference('soundEffects', e.target.checked)}
                          className="rounded"
                        />
                        <label htmlFor="soundEffects" className="text-sm">
                          Enable sound effects
                        </label>
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
                      onFontSizeChange={(size) =>
                        updatePreference('writingSettings', {
                          ...preferences.writingSettings,
                          fontSize: size,
                        })
                      }
                      lineHeight={preferences.writingSettings.lineHeight}
                      onLineHeightChange={(height) =>
                        updatePreference('writingSettings', {
                          ...preferences.writingSettings,
                          lineHeight: height,
                        })
                      }
                      focusMode={preferences.writingSettings.focusMode}
                      onFocusModeToggle={() =>
                        updatePreference('writingSettings', {
                          ...preferences.writingSettings,
                          focusMode: !preferences.writingSettings.focusMode,
                        })
                      }
                      typewriterMode={preferences.writingSettings.typewriterMode}
                      onTypewriterModeToggle={() =>
                        updatePreference('writingSettings', {
                          ...preferences.writingSettings,
                          typewriterMode: !preferences.writingSettings.typewriterMode,
                        })
                      }
                      wordWrap={preferences.writingSettings.wordWrap}
                      onWordWrapToggle={() =>
                        updatePreference('writingSettings', {
                          ...preferences.writingSettings,
                          wordWrap: !preferences.writingSettings.wordWrap,
                        })
                      }
                      vimMode={preferences.writingSettings.vimMode}
                      onVimModeToggle={() =>
                        updatePreference('writingSettings', {
                          ...preferences.writingSettings,
                          vimMode: !preferences.writingSettings.vimMode,
                        })
                      }
                      zenMode={preferences.writingSettings.zenMode}
                      onZenModeToggle={() =>
                        updatePreference('writingSettings', {
                          ...preferences.writingSettings,
                          zenMode: !preferences.writingSettings.zenMode,
                        })
                      }
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
                  <CardTitle className="flex items-center gap-2">
                    <Database className="w-5 h-5" />
                    Storage Management
                  </CardTitle>
                  <CardDescription>Manage your local and cloud storage settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Storage Status */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Storage Status</h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="p-4 border rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Database className="w-4 h-4" />
                          <span className="font-medium">Local Storage</span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          Browser storage for offline access
                        </p>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Used</span>
                            <span>~2.3 MB</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: '15%' }}
                            />
                          </div>
                        </div>
                      </div>

                      {isSignedIn && (
                        <div className="p-4 border rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Cloud className="w-4 h-4" />
                            <span className="font-medium">Cloud Storage</span>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            Synced across all your devices
                          </p>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Used</span>
                              <span>~1.8 MB</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-green-600 h-2 rounded-full"
                                style={{ width: '12%' }}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Storage Actions */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Storage Actions</h3>
                    <div className="flex flex-wrap gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={async () => {
                          try {
                            // Clear localStorage
                            const keysToRemove = [
                              'markdownEditor_content',
                              'markdownEditor_fileName',
                              'markdownEditor_theme',
                              'markdownEditor_preferences',
                              'markdownEditor_writingSettings',
                              'markdownEditor_hasVisited',
                            ];

                            keysToRemove.forEach((key) => {
                              localStorage.removeItem(key);
                            });

                            toast({
                              title: 'Cache Cleared',
                              description: 'Local storage cache has been cleared successfully.',
                            });
                          } catch (error) {
                            safeConsole.error('Failed to clear cache:', error);
                            toast({
                              title: 'Clear Failed',
                              description: 'Failed to clear cache. Please try again.',
                              variant: 'destructive',
                            });
                          }
                        }}
                      >
                        Clear Cache
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={async () => {
                          try {
                            const files = fileStorage.files;
                            const exportData = {
                              files,
                              preferences,
                              exportedAt: new Date().toISOString(),
                              version: '1.0.0',
                            };

                            const blob = new Blob([JSON.stringify(exportData, null, 2)], {
                              type: 'application/json',
                            });
                            const url = URL.createObjectURL(blob);
                            const link = document.createElement('a');
                            link.href = url;
                            link.download = `storage-export-${
                              new Date().toISOString().split('T')[0]
                            }.json`;
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                            URL.revokeObjectURL(url);

                            toast({
                              title: 'Data Exported',
                              description: 'Your data has been exported successfully.',
                            });
                          } catch (error) {
                            safeConsole.error('Failed to export data:', error);
                            toast({
                              title: 'Export Failed',
                              description: 'Failed to export data. Please try again.',
                              variant: 'destructive',
                            });
                          }
                        }}
                      >
                        Export Data
                      </Button>

                      {isSignedIn && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={async () => {
                            try {
                              // Force refresh files from cloud
                              fileStorage.refreshFiles();

                              toast({
                                title: 'Sync Complete',
                                description: 'Your data has been synced with the cloud.',
                              });
                            } catch (error) {
                              safeConsole.error('Failed to sync data:', error);
                              toast({
                                title: 'Sync Failed',
                                description: 'Failed to sync data. Please try again.',
                                variant: 'destructive',
                              });
                            }
                          }}
                        >
                          Sync Now
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="account" className="space-y-6">
              {isSignedIn && user ? (
                <div className="space-y-6">
                  {/* Account Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <User className="w-5 h-5" />
                        Account Information
                      </CardTitle>
                      <CardDescription>Manage your account details and preferences</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="flex items-center gap-4">
                        {user.imageUrl && (
                          <img
                            src={user.imageUrl}
                            alt={user.fullName || 'User'}
                            className="w-16 h-16 rounded-full"
                          />
                        )}
                        <div>
                          <h3 className="text-lg font-medium">{user.fullName || 'User'}</h3>
                          <p className="text-sm text-muted-foreground">
                            {user.primaryEmailAddress?.emailAddress}
                          </p>
                          <Badge variant="secondary" className="mt-1">
                            {(user.publicMetadata?.role as string) || 'User'}
                          </Badge>
                        </div>
                      </div>

                      {/* Name Fields - Properly Aligned */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium">Name Information</h4>
                          {!isEditingName ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setIsEditingName(true);
                                setEditFirstName(user.firstName || '');
                                setEditLastName(user.lastName || '');
                              }}
                            >
                              <Edit className="w-3 h-3 mr-1" />
                              Edit
                            </Button>
                          ) : (
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setIsEditingName(false);
                                  setEditFirstName('');
                                  setEditLastName('');
                                  setHasUnsavedChanges(false);
                                }}
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          )}
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <label htmlFor="firstName" className="text-sm font-medium">
                              First Name
                            </label>
                            {isEditingName ? (
                              <Input
                                id="firstName"
                                value={editFirstName}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                  setEditFirstName(e.target.value);
                                  setHasUnsavedChanges(true);
                                }}
                                placeholder="Enter first name"
                              />
                            ) : (
                              <p className="text-sm text-muted-foreground py-2">
                                {user.firstName || 'Not set'}
                              </p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <label htmlFor="lastName" className="text-sm font-medium">
                              Last Name
                            </label>
                            {isEditingName ? (
                              <Input
                                id="lastName"
                                value={editLastName}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                  setEditLastName(e.target.value);
                                  setHasUnsavedChanges(true);
                                }}
                                placeholder="Enter last name"
                              />
                            ) : (
                              <p className="text-sm text-muted-foreground py-2">
                                {user.lastName || 'Not set'}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Other Account Information */}
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <div className="text-sm font-medium">Member Since</div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {user.createdAt
                              ? new Date(user.createdAt).toLocaleDateString()
                              : 'Unknown'}
                          </p>
                        </div>
                        <div>
                          <div className="text-sm font-medium">Last Sign In</div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {user.lastSignInAt
                              ? new Date(user.lastSignInAt).toLocaleDateString()
                              : 'Unknown'}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Account Management */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <User className="w-5 h-5" />
                        Account Information
                      </CardTitle>
                      <CardDescription>
                        View and edit your account details. Use "Save Settings" button to save
                        changes.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Data Export</p>
                          <p className="text-sm text-muted-foreground">
                            Download a copy of your data
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={async () => {
                            try {
                              // Export user data
                              const userData = {
                                profile: {
                                  id: user?.id,
                                  email: user?.primaryEmailAddress?.emailAddress,
                                  name: user?.fullName,
                                  createdAt: user?.createdAt,
                                },
                                files: fileStorage.files,
                                exportedAt: new Date().toISOString(),
                              };

                              const blob = new Blob([JSON.stringify(userData, null, 2)], {
                                type: 'application/json',
                              });
                              const url = URL.createObjectURL(blob);
                              const link = document.createElement('a');
                              link.href = url;
                              link.download = `user-data-export-${
                                new Date().toISOString().split('T')[0]
                              }.json`;
                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);
                              URL.revokeObjectURL(url);
                            } catch (error) {
                              console.error('Export failed:', error);
                            }
                          }}
                        >
                          Export Data
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Session Management */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Monitor className="w-5 h-5" />
                        Session Management
                      </CardTitle>
                      <CardDescription>
                        View and manage your active sessions across devices
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {sessionStats && (
                        <div className="grid gap-4 md:grid-cols-3">
                          <div className="text-center p-3 bg-muted rounded-lg">
                            <div className="text-2xl font-bold">{sessionStats.activeSessions}</div>
                            <div className="text-sm text-muted-foreground">Active Sessions</div>
                          </div>
                          <div className="text-center p-3 bg-muted rounded-lg">
                            <div className="text-2xl font-bold">{sessionStats.uniqueIPs}</div>
                            <div className="text-sm text-muted-foreground">Unique Locations</div>
                          </div>
                          <div className="text-center p-3 bg-muted rounded-lg">
                            <div className="text-2xl font-bold">
                              {sessionStats.suspiciousActivity.length}
                            </div>
                            <div className="text-sm text-muted-foreground">Security Alerts</div>
                          </div>
                        </div>
                      )}

                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">Recent Sessions</h4>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={async () => {
                              if (user?.id) {
                                try {
                                  await sessionManager.terminateAllOtherSessions(
                                    user.id,
                                    'current'
                                  );
                                  // Reload sessions
                                  const stats = await sessionManager.getSessionStats(user.id);
                                  const sessions = await sessionManager.getUserSessions(user.id);
                                  setSessionStats(stats);
                                  setUserSessions(sessions);

                                  toast({
                                    title: 'Sessions Terminated',
                                    description: 'All other sessions have been terminated.',
                                  });
                                } catch (error) {
                                  safeConsole.error('Failed to terminate sessions:', error);
                                  toast({
                                    title: 'Termination Failed',
                                    description: 'Failed to terminate sessions. Please try again.',
                                    variant: 'destructive',
                                  });
                                }
                              }
                            }}
                          >
                            Terminate All Others
                          </Button>
                        </div>

                        <div className="space-y-2 max-h-60 overflow-y-auto">
                          {userSessions.length > 0 ? (
                            userSessions.slice(0, 5).map((session, index) => (
                              <div
                                key={session.id || index}
                                className="flex items-center justify-between p-3 border rounded-lg"
                              >
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <div className="text-sm font-medium">
                                      {session.device_info?.browser} on {session.device_info?.os}
                                    </div>
                                    {Boolean(
                                      (session.security_flags as Record<string, unknown>)
                                        ?.new_location
                                    ) && (
                                      <Badge variant="outline" className="text-xs">
                                        New Location
                                      </Badge>
                                    )}
                                    {Boolean(
                                      (session.security_flags as Record<string, unknown>)
                                        ?.new_device
                                    ) && (
                                      <Badge variant="outline" className="text-xs">
                                        New Device
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {session.location?.city}, {session.location?.country} •{' '}
                                    {session.ip_address}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    Last active:{' '}
                                    {session.last_activity
                                      ? new Date(session.last_activity).toLocaleString()
                                      : 'Unknown'}
                                  </div>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={async () => {
                                    try {
                                      await sessionManager.terminateSession(session.session_id);
                                      // Remove from local state
                                      setUserSessions((prev) =>
                                        prev.filter((s) => s.id !== session.id)
                                      );

                                      toast({
                                        title: 'Session Terminated',
                                        description: 'Session has been terminated successfully.',
                                      });
                                    } catch (error) {
                                      safeConsole.error('Failed to terminate session:', error);
                                      toast({
                                        title: 'Termination Failed',
                                        description:
                                          'Failed to terminate session. Please try again.',
                                        variant: 'destructive',
                                      });
                                    }
                                  }}
                                >
                                  Terminate
                                </Button>
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-4 text-muted-foreground">
                              No active sessions found
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>Account Information</CardTitle>
                    <CardDescription>
                      Please sign in to manage your account settings
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <AuthButtons
                      responsive={{
                        isMobile: responsive.isMobile,
                        isTablet: responsive.isTablet,
                        isSmallTablet: responsive.windowWidth <= 640,
                      }}
                      onViewFiles={() => navigate('/files')}
                      onSettings={() => navigate('/settings')}
                    />
                  </CardContent>
                </Card>
              )}
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
    <SecureErrorBoundary category={ErrorCategory.USER_ACTION}>
      <QueryClientProvider client={queryClient}>
        <SettingsPageContent />
      </QueryClientProvider>
    </SecureErrorBoundary>
  );
}
