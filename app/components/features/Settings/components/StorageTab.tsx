/**
 * @fileoverview Storage settings tab component
 * @author Axel Modra
 */

import { useAuth } from '@clerk/react-router';
import { Cloud, Database } from 'lucide-react';
import type React from 'react';
import { memo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useStorageActions } from '../hooks/useStorageActions';

/**
 * Storage settings tab component
 */
export const StorageTab: React.FC = memo(() => {
  const { isSignedIn } = useAuth();
  const { state, actions } = useStorageActions();

  return (
    <Card>
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
          <Database className="w-5 h-5" />
          Storage Management
        </CardTitle>
        <CardDescription className="text-sm">
          Manage your local and cloud storage settings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
        {/* Storage Status */}
        <div className="space-y-4">
          <h3 className="text-base sm:text-lg font-medium">Storage Status</h3>
          <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
            <div className="p-3 sm:p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Database className="w-4 h-4" />
                <span className="font-medium text-sm sm:text-base">Local Storage</span>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground mb-2">
                Browser storage for offline access
              </p>
              <div className="space-y-2">
                <div className="flex justify-between text-xs sm:text-sm">
                  <span>Used</span>
                  <span>{state.localStorage.used}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${state.localStorage.percentage}%` }}
                  />
                </div>
              </div>
            </div>

            {isSignedIn && state.cloudStorage && (
              <div className="p-3 sm:p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Cloud className="w-4 h-4" />
                  <span className="font-medium text-sm sm:text-base">Cloud Storage</span>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground mb-2">
                  Synced across all your devices
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span>Used</span>
                    <span>{state.cloudStorage.used}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: `${state.cloudStorage.percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Storage Actions */}
        <div className="space-y-4">
          <h3 className="text-base sm:text-lg font-medium">Storage Actions</h3>
          <div className="flex flex-col sm:flex-row flex-wrap gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={actions.clearCache}
              disabled={state.isLoading}
            >
              Clear Cache
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={actions.exportData}
              disabled={state.isLoading}
            >
              Export Data
            </Button>

            {isSignedIn && (
              <Button
                variant="outline"
                size="sm"
                onClick={actions.syncData}
                disabled={state.isLoading}
              >
                Sync Now
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

StorageTab.displayName = 'StorageTab';
