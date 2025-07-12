/**
 * @fileoverview Authentication buttons component for header
 * @author Axel Modra
 */

import { SignInButton, UserButton, useAuth, useUser } from '@clerk/react-router';
import { Cloud, Files, HardDrive, Settings, User } from 'lucide-react';
import type React from 'react';
import { useLocation } from 'react-router';
import { useTheme } from '@/components/features/ThemeSelector';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

/**
 * Props for AuthButtons component
 */
export interface AuthButtonsProps {
  onViewFiles?: () => void;
  onSettings?: () => void;
  responsive: {
    isMobile: boolean;
    isTablet: boolean;
    isSmallTablet: boolean;
  };
  className?: string;
}

/**
 * Authentication buttons component
 * Shows sign-in/sign-up for unauthenticated users
 * Shows user menu for authenticated users
 */
export const AuthButtons: React.FC<AuthButtonsProps> = ({
  onViewFiles,
  onSettings,
  responsive,
  className = '',
}) => {
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();
  const { isMobile, isSmallTablet } = responsive;
  const location = useLocation();
  const { currentTheme } = useTheme();

  // Determine current page for navigation logic
  const isFilesPage = location.pathname === '/files';
  const isSettingsPage = location.pathname === '/settings';

  // Get theme-aware badge styles
  const getCloudBadgeStyles = () => {
    if (!currentTheme) return {};

    return {
      backgroundColor: currentTheme.surface || currentTheme.background,
      color: currentTheme.text,
      borderColor: currentTheme.accent || currentTheme.primary,
    };
  };

  // Show loading state while auth is loading
  if (!isLoaded) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
      </div>
    );
  }

  // Authenticated user UI
  if (isSignedIn && user) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {/* Storage indicator with theme colors */}
        <Badge
          variant="secondary"
          className="hidden sm:flex items-center gap-1 text-xs border"
          style={getCloudBadgeStyles()}
          data-badge="cloud"
        >
          <Cloud className="w-3 h-3" />
          Cloud
        </Badge>

        {/* Navigation button - shows opposite of current page */}
        {!isMobile && (
          <>
            {isFilesPage && onSettings && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onSettings}
                className="hidden md:flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                Settings
              </Button>
            )}
            {isSettingsPage && onViewFiles && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onViewFiles}
                className="hidden md:flex items-center gap-2"
              >
                <Files className="w-4 h-4" />
                Files
              </Button>
            )}
            {!isFilesPage && !isSettingsPage && onViewFiles && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onViewFiles}
                className="hidden md:flex items-center gap-2"
              >
                <Files className="w-4 h-4" />
                Files
              </Button>
            )}
          </>
        )}

        {/* User menu */}
        <div className="relative">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-2 hover:bg-gray-100"
              >
                {user.imageUrl ? (
                  <img
                    src={user.imageUrl}
                    alt={user.fullName || 'User'}
                    className="w-6 h-6 rounded-full"
                  />
                ) : (
                  <User className="w-4 h-4" />
                )}
                {!isSmallTablet && (
                  <span className="text-sm font-medium truncate max-w-24">
                    {user.firstName || user.fullName || 'User'}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              side="bottom"
              className="w-56 z-[60] auth-dropdown-content shadow-dropdown backdrop-blur-md animate-slide-down fixed transform-none"
              sideOffset={8}
              alignOffset={0}
              avoidCollisions={true}
              collisionPadding={16}
            >
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user.fullName || 'User'}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user.primaryEmailAddress?.emailAddress}
                  </p>
                </div>
              </DropdownMenuLabel>

              <DropdownMenuSeparator />

              {/* Files option - always visible in menu */}
              {onViewFiles && (
                <DropdownMenuItem onClick={onViewFiles}>
                  <Files className="mr-2 h-4 w-4" />
                  <span>My Files</span>
                </DropdownMenuItem>
              )}

              {/* Settings option */}
              {onSettings && (
                <DropdownMenuItem onClick={onSettings}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
              )}

              <DropdownMenuSeparator />

              {/* Storage info */}
              <DropdownMenuItem disabled>
                <Cloud className="mr-2 h-4 w-4" />
                <span>Cloud Storage</span>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              {/* Sign out - using Clerk's UserButton for proper sign out */}
              <div className="p-1">
                <UserButton
                  appearance={{
                    elements: {
                      userButtonAvatarBox: 'w-0 h-0 hidden',
                      userButtonTrigger: 'w-full justify-start p-2 hover:bg-gray-100 rounded-sm',
                    },
                  }}
                />
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    );
  }

  // Unauthenticated user UI
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Storage indicator for local storage with theme colors */}
      <Badge
        variant="outline"
        className="hidden sm:flex items-center gap-1 text-xs"
        style={getCloudBadgeStyles()}
        data-badge="local"
      >
        <HardDrive className="w-3 h-3" />
        Local
      </Badge>

      {/* Single Auth Button - defaults to Sign In with Sign Up option */}
      <SignInButton mode="redirect">
        <Button
          variant="default"
          size="sm"
          className="flex items-center gap-2 auth-button"
          data-component="auth-button"
        >
          <User className="w-4 h-4" />
          {!isSmallTablet && <span>Sign In</span>}
        </Button>
      </SignInButton>
    </div>
  );
};

export default AuthButtons;
