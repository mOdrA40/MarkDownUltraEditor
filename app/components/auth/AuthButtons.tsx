/**
 * @fileoverview Authentication buttons component for header
 * @author Axel Modra
 */

import React from 'react';
import { useAuth, useUser, SignInButton, SignUpButton, UserButton } from '@clerk/react-router';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User, LogIn, UserPlus, Files, Cloud, HardDrive, Settings } from 'lucide-react';

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

  // Debug log untuk memastikan Clerk sudah loaded
  React.useEffect(() => {
    console.log('Clerk Auth Status:', { isLoaded, isSignedIn, user });
  }, [isLoaded, isSignedIn, user]);

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
        {/* Storage indicator */}
        <Badge variant="secondary" className="hidden sm:flex items-center gap-1 text-xs">
          <Cloud className="w-3 h-3" />
          Cloud
        </Badge>

        {/* Files button - hidden on mobile */}
        {!isMobile && onViewFiles && (
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
              className="w-56 z-dropdown auth-dropdown-content shadow-dropdown backdrop-blur-medium animate-slide-down dropdown-fixed"
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
                  afterSignOutUrl="/"
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
      {/* Storage indicator for local storage */}
      <Badge variant="outline" className="hidden sm:flex items-center gap-1 text-xs">
        <HardDrive className="w-3 h-3" />
        Local
      </Badge>

      {/* Sign in button */}
      <SignInButton mode="redirect">
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-2"
          onClick={() => console.log('Sign In button clicked')}
        >
          <LogIn className="w-4 h-4" />
          {!isSmallTablet && <span>Sign In</span>}
        </Button>
      </SignInButton>

      {/* Sign up button */}
      <SignUpButton mode="redirect">
        <Button
          variant="default"
          size="sm"
          className="flex items-center gap-2"
          onClick={() => console.log('Sign Up button clicked')}
        >
          <UserPlus className="w-4 h-4" />
          {!isSmallTablet && <span>Sign Up</span>}
        </Button>
      </SignUpButton>
    </div>
  );
};

export default AuthButtons;
