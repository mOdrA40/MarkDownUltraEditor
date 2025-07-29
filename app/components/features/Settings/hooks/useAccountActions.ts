/**
 * @fileoverview Account actions hook
 * @author Axel Modra
 */

import { useAuth, useUser } from '@clerk/react-router';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useToast } from '@/hooks/core/useToast';
import { useFileStorage } from '@/hooks/files';
import { createClerkSupabaseClient } from '@/lib/supabase';
import { createUserCleanupService } from '@/services/userCleanup';
import { safeConsole } from '@/utils/console';
import type { AccountState, UseAccountReturn } from '../types/account';

/**
 * Account actions hook
 */
export const useAccountActions = (): UseAccountReturn => {
  const { isSignedIn, getToken } = useAuth();
  const { user } = useUser();
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileStorage = useFileStorage();

  const [state, setState] = useState<AccountState>({
    accountInfo: null,
    isLoading: false,
    error: null,
  });

  // Update account info from user
  const updateAccountInfo = useCallback(() => {
    if (user) {
      setState((prev) => ({
        ...prev,
        accountInfo: {
          id: user.id,
          email: user.primaryEmailAddress?.emailAddress || '',
          firstName: user.firstName || undefined,
          lastName: user.lastName || undefined,
          fullName: user.fullName || undefined,
          imageUrl: user.imageUrl || undefined,
          createdAt: user.createdAt ? new Date(user.createdAt) : undefined,
          lastSignInAt: user.lastSignInAt ? new Date(user.lastSignInAt) : undefined,
          role: (user.publicMetadata?.role as string) || 'User',
        },
      }));
    }
  }, [user]);

  // Update name
  const updateName = useCallback(
    async (firstName: string, lastName: string) => {
      if (!user) return;

      try {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));

        await user.update({
          firstName,
          lastName,
        });

        // Update local state
        updateAccountInfo();

        toast({
          title: 'Name Updated',
          description: 'Your name has been updated successfully.',
        });
      } catch (error) {
        safeConsole.error('Failed to update name:', error);
        setState((prev) => ({
          ...prev,
          error: 'Failed to update name',
        }));
        toast({
          title: 'Name Update Failed',
          description: 'Failed to update your name. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setState((prev) => ({ ...prev, isLoading: false }));
      }
    },
    [user, updateAccountInfo, toast]
  );

  // Export user data
  const exportUserData = useCallback(async () => {
    if (!user) return;

    try {
      const userData = {
        profile: {
          id: user.id,
          email: user.primaryEmailAddress?.emailAddress,
          name: user.fullName,
          createdAt: user.createdAt,
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
      link.download = `user-data-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: 'Data Exported',
        description: 'Your user data has been exported successfully.',
      });
    } catch (error) {
      safeConsole.error('Export failed:', error);
      toast({
        title: 'Export Failed',
        description: 'Failed to export user data. Please try again.',
        variant: 'destructive',
      });
    }
  }, [user, fileStorage.files, toast]);

  // Delete account
  const deleteAccount = useCallback(async () => {
    if (!user || !getToken) return;

    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      // First cleanup user data in Supabase
      try {
        const supabaseClient = createClerkSupabaseClient(getToken);
        const cleanupService = createUserCleanupService(supabaseClient);
        const cleanupResult = await cleanupService.cleanupUserData(user.id);

        import('@/utils/console').then(({ safeConsole }) => {
          safeConsole.dev('User data cleanup result:', cleanupResult);
        });

        if (!cleanupResult.success && cleanupResult.errors.length > 0) {
          import('@/utils/console').then(({ safeConsole }) => {
            safeConsole.warn('Some data cleanup errors occurred:', cleanupResult.errors);
          });
        }
      } catch (cleanupError) {
        import('@/utils/console').then(({ safeConsole }) => {
          safeConsole.error('Error cleaning up user data:', cleanupError);
        });
        // Continue with account deletion even if cleanup fails
      }

      // Delete user account through Clerk
      await user.delete();
      navigate('/');

      toast({
        title: 'Account Deleted',
        description: 'Your account has been deleted successfully.',
      });
    } catch (error) {
      safeConsole.error('Error deleting account:', error);
      setState((prev) => ({
        ...prev,
        error: 'Failed to delete account',
      }));
      toast({
        title: 'Delete Failed',
        description: 'Failed to delete account. Please try again or contact support.',
        variant: 'destructive',
      });
    } finally {
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  }, [user, getToken, navigate, toast]);

  // Refresh account info
  const refreshAccountInfo = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true }));
    updateAccountInfo();
    setState((prev) => ({ ...prev, isLoading: false }));
  }, [updateAccountInfo]);

  // Update account info when user changes
  useEffect(() => {
    if (isSignedIn && user) {
      updateAccountInfo();
    } else {
      setState((prev) => ({ ...prev, accountInfo: null }));
    }
  }, [isSignedIn, user, updateAccountInfo]);

  return {
    state,
    actions: {
      updateName,
      exportUserData,
      deleteAccount,
      refreshAccountInfo,
    },
  };
};
