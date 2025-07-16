/**
 * @fileoverview Welcome dialog for first-time visitors
 * @author Axel Modra
 */

import { SignUpButton, useAuth } from '@clerk/react-router';
import { Check, Cloud, HardDrive, Shield, Smartphone, X, Zap } from 'lucide-react';
import type React from 'react';
import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { getStorageItem, removeStorageItem, setStorageItem } from '@/utils/common';

/**
 * Props for WelcomeDialog component
 */
export interface WelcomeDialogProps {
  isOpen?: boolean;
  onClose: () => void;
  onSignUp?: () => void;
  onContinueAsGuest: () => void;
}

/**
 * Welcome dialog component
 * Shows benefits of signing up vs continuing as guest
 */
export const WelcomeDialog: React.FC<WelcomeDialogProps> = ({
  isOpen: controlledIsOpen,
  onClose,
  onSignUp,
  onContinueAsGuest,
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);

  // Check if this is first visit
  useEffect(() => {
    const hasVisited = getStorageItem('markdownEditor_hasVisited');
    if (!hasVisited && controlledIsOpen === undefined) {
      setInternalIsOpen(true);
      setStorageItem('markdownEditor_hasVisited', 'true');
    }
  }, [controlledIsOpen]);

  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;

  const handleClose = () => {
    if (controlledIsOpen === undefined) {
      setInternalIsOpen(false);
    }
    onClose();
  };

  const handleContinueAsGuest = () => {
    onContinueAsGuest();
    handleClose();
  };

  const handleSignUp = () => {
    if (onSignUp) {
      onSignUp();
    }
    handleClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            Welcome to MarkDown Ultra Editor
          </DialogTitle>
          <DialogDescription className="text-center text-base">
            Choose how you'd like to use the editor
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Cloud Storage Benefits */}
          <div className="border rounded-lg p-4 bg-blue-50 border-blue-200">
            <div className="flex items-center gap-2 mb-3">
              <Cloud className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-blue-900">Sign Up for Cloud Storage</h3>
              <Badge variant="default" className="bg-blue-600">
                Recommended
              </Badge>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-blue-800">
                <Check className="w-4 h-4 text-green-600" />
                <span>Access your files from any device</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-blue-800">
                <Check className="w-4 h-4 text-green-600" />
                <span>Automatic cloud backup and sync</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-blue-800">
                <Check className="w-4 h-4 text-green-600" />
                <span>Never lose your work</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-blue-800">
                <Check className="w-4 h-4 text-green-600" />
                <span>Secure and private storage</span>
              </div>
            </div>

            <SignUpButton mode="redirect" fallbackRedirectUrl="/" forceRedirectUrl="/">
              <Button
                size="lg"
                onClick={handleSignUp}
                className="w-full font-semibold signup-button auth-button"
                data-component="auth-button"
              >
                Sign Up Now
              </Button>
            </SignUpButton>
          </div>

          {/* Local Storage Option */}
          <div className="border rounded-lg p-4 bg-gray-50 border-gray-200">
            <div className="flex items-center gap-2 mb-3">
              <HardDrive className="w-5 h-5 text-gray-600" />
              <h3 className="font-semibold text-gray-900">Continue as Guest</h3>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <Check className="w-4 h-4 text-green-600" />
                <span>Start using immediately</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <Check className="w-4 h-4 text-green-600" />
                <span>Files stored locally in browser</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <X className="w-4 h-4 text-red-500" />
                <span>Limited to this device only</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <X className="w-4 h-4 text-red-500" />
                <span>Files may be lost if browser data is cleared</span>
              </div>
            </div>

            <Button variant="outline" className="w-full" onClick={handleContinueAsGuest}>
              <HardDrive className="w-4 h-4 mr-2" />
              Continue as Guest
            </Button>
          </div>

          {/* Feature Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Smartphone className="w-6 h-6 text-green-600" />
              </div>
              <h4 className="font-medium text-sm">Responsive Design</h4>
              <p className="text-xs text-gray-600">Works on all devices</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Shield className="w-6 h-6 text-purple-600" />
              </div>
              <h4 className="font-medium text-sm">Secure & Private</h4>
              <p className="text-xs text-gray-600">Your data stays safe</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Zap className="w-6 h-6 text-orange-600" />
              </div>
              <h4 className="font-medium text-sm">Lightning Fast</h4>
              <p className="text-xs text-gray-600">Optimized performance</p>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <p className="text-xs text-gray-500 text-center sm:text-left flex-1">
            You can always sign up later to enable cloud storage
          </p>
          <Button variant="ghost" size="sm" onClick={handleClose} className="text-gray-500">
            Maybe Later
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

/**
 * Hook to manage welcome dialog state
 */
export const useWelcomeDialog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { isSignedIn, isLoaded } = useAuth();

  const showWelcomeDialog = () => setIsOpen(true);
  const hideWelcomeDialog = () => setIsOpen(false);

  // Check if should show welcome dialog on mount
  useEffect(() => {
    // Wait for Clerk to finish loading
    if (!isLoaded) return;

    // If user is already signed in, don't show welcome dialog
    if (isSignedIn) {
      setIsOpen(false);
      return;
    }

    // Check if first-time visitor (guest user)
    const hasVisited = getStorageItem('markdownEditor_hasVisited');
    if (!hasVisited) {
      // Small delay to ensure page is loaded
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [isLoaded, isSignedIn]);

  // Auto-close dialog if user signs in while dialog is open
  useEffect(() => {
    if (isSignedIn && isOpen) {
      setIsOpen(false);
    }
  }, [isSignedIn, isOpen]);

  const handleClose = () => {
    setStorageItem('markdownEditor_hasVisited', 'true');
    setIsOpen(false);
  };

  const handleContinueAsGuest = () => {
    handleClose();
  };

  const handleSignUp = () => {
    handleClose();
  };

  // Track previous sign-in state to detect logout
  const [wasSignedIn, setWasSignedIn] = useState(false);

  useEffect(() => {
    if (isLoaded) {
      if (isSignedIn) {
        setWasSignedIn(true);
      } else if (wasSignedIn && !isSignedIn) {
        // User just logged out, reset hasVisited flag for future guest sessions
        removeStorageItem('markdownEditor_hasVisited');
        setWasSignedIn(false);
      }
    }
  }, [isLoaded, isSignedIn, wasSignedIn]);

  return {
    isOpen,
    showWelcomeDialog,
    hideWelcomeDialog,
    handleClose,
    handleContinueAsGuest,
    handleSignUp,
  };
};

export default WelcomeDialog;
