/**
 * @fileoverview Update notification component for Service Worker updates
 * @author Axel Modra
 */

import type React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { RefreshCw, X } from 'lucide-react';
import { useServiceWorkerUpdate } from '@/hooks/core/useServiceWorker';

/**
 * Update notification component
 * Shows when a new version of the app is available
 */
export const UpdateNotification: React.FC = () => {
  const { showUpdatePrompt, acceptUpdate, dismissUpdate } = useServiceWorkerUpdate();

  if (!showUpdatePrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <Card className="border-blue-200 bg-blue-50 shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <RefreshCw className="w-5 h-5 text-blue-600" />
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-blue-900">Update Available</h3>
              <p className="text-sm text-blue-700 mt-1">
                A new version of the app is ready. Refresh to get the latest features and
                improvements.
              </p>

              <div className="flex gap-2 mt-3">
                <Button
                  size="sm"
                  onClick={acceptUpdate}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <RefreshCw className="w-3 h-3 mr-1" />
                  Update
                </Button>

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={dismissUpdate}
                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-100"
                >
                  Later
                </Button>
              </div>
            </div>

            <Button
              size="sm"
              variant="ghost"
              onClick={dismissUpdate}
              className="flex-shrink-0 p-1 h-auto text-blue-600 hover:text-blue-700 hover:bg-blue-100"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UpdateNotification;
