import { ArrowLeft, Settings as SettingsIcon } from 'lucide-react';
import type React from 'react';
import { memo } from 'react';
import { useNavigate } from 'react-router';
import { AuthButtons } from '@/components/auth/AuthButtons';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useResponsiveDetection } from '@/hooks/ui/useResponsive';

interface SettingsHeaderProps {
  hasUnsavedChanges: boolean;
}

/**
 * Settings page header with navigation and auth buttons
 */
export const SettingsHeader: React.FC<SettingsHeaderProps> = memo(({ hasUnsavedChanges }) => {
  const navigate = useNavigate();
  const responsive = useResponsiveDetection();

  return (
    <div className="border-b bg-card/80 backdrop-blur-md sticky top-0 z-40">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 min-w-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="flex items-center gap-2 w-fit"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden xs:inline">Back to Editor</span>
              <span className="xs:hidden">Back</span>
            </Button>

            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                <SettingsIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                Settings
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Customize your Markdown editor experience
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end sm:justify-start gap-3">
            {hasUnsavedChanges && (
              <Badge variant="secondary" className="animate-pulse text-xs">
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
  );
});

SettingsHeader.displayName = 'SettingsHeader';
