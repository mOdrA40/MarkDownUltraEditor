/**
 * Storage Status Component
 * Displays localStorage usage and provides cleanup controls
 *
 * @author Axel Modra
 */

import { AlertTriangle, CheckCircle, HardDrive, Info, RefreshCw, Trash2 } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useStorageMonitor, useStorageStatus } from '@/hooks/core';
import { cn } from '@/lib/utils';

interface StorageStatusProps {
  /** Show as compact version */
  compact?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Show cleanup button */
  showCleanup?: boolean;
}

/**
 * Storage Status Component
 */
export const StorageStatus: React.FC<StorageStatusProps> = ({
  compact = false,
  className,
  showCleanup = true,
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCleaningUp, setIsCleaningUp] = useState(false);

  const { storageInfo, isNearCapacity, isCritical, statusColor, statusText, progressBarColor } =
    useStorageStatus();

  const { triggerCleanup, refreshInfo } = useStorageMonitor();

  /**
   * Handle manual cleanup
   */
  const handleCleanup = async () => {
    setIsCleaningUp(true);
    try {
      const cleanedBytes = await triggerCleanup();
      if (cleanedBytes > 0) {
        // Show success feedback
        console.log(`Cleanup successful: ${cleanedBytes} bytes freed`);
      }
    } catch (error) {
      console.error('Cleanup failed:', error);
    } finally {
      setIsCleaningUp(false);
    }
  };

  /**
   * Get status icon
   */
  const getStatusIcon = () => {
    if (isCritical) return <AlertTriangle className="h-4 w-4" />;
    if (isNearCapacity) return <AlertTriangle className="h-4 w-4" />;
    return <CheckCircle className="h-4 w-4" />;
  };

  if (compact) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={cn(
                'flex items-center space-x-2 px-2 py-1 rounded-md',
                statusColor,
                className
              )}
            >
              <HardDrive className="h-3 w-3" />
              <span className="text-xs font-medium">{storageInfo.usedPercentage.toFixed(0)}%</span>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <div className="space-y-1">
              <p className="font-medium">Storage Usage</p>
              <p className="text-sm">
                {storageInfo.usedFormatted} / {storageInfo.totalFormatted}
              </p>
              <p className="text-sm text-muted-foreground">Status: {statusText}</p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <div className={cn('space-y-2', className)}>
      {/* Storage Status Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <HardDrive className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Storage</span>
          <Badge variant="outline" className={statusColor}>
            {statusText}
          </Badge>
        </div>

        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={refreshInfo}
            className="h-6 w-6 p-0"
            title="Refresh storage info"
          >
            <RefreshCw className="h-3 w-3" />
          </Button>

          {showCleanup && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  title="Storage details and cleanup"
                >
                  <Info className="h-3 w-3" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center space-x-2">
                    <HardDrive className="h-5 w-5" />
                    <span>Storage Management</span>
                  </DialogTitle>
                  <DialogDescription>Monitor and manage your local storage usage</DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  {/* Detailed Storage Info */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Used:</span>
                      <span className="font-mono">{storageInfo.usedFormatted}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Available:</span>
                      <span className="font-mono">{storageInfo.availableFormatted}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Total:</span>
                      <span className="font-mono">{storageInfo.totalFormatted}</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <Progress value={storageInfo.usedPercentage} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>0%</span>
                      <span className={statusColor}>{storageInfo.usedPercentage.toFixed(1)}%</span>
                      <span>100%</span>
                    </div>
                  </div>

                  {/* Warning Messages */}
                  {(isNearCapacity || isCritical) && (
                    <div
                      className={cn(
                        'flex items-start space-x-2 p-3 rounded-md',
                        isCritical
                          ? 'bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800'
                          : 'bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800'
                      )}
                    >
                      <AlertTriangle
                        className={cn(
                          'h-4 w-4 mt-0.5',
                          isCritical ? 'text-red-600' : 'text-yellow-600'
                        )}
                      />
                      <div className="space-y-1">
                        <p
                          className={cn(
                            'text-sm font-medium',
                            isCritical
                              ? 'text-red-800 dark:text-red-200'
                              : 'text-yellow-800 dark:text-yellow-200'
                          )}
                        >
                          {isCritical ? 'Critical Storage Level' : 'Storage Nearly Full'}
                        </p>
                        <p
                          className={cn(
                            'text-xs',
                            isCritical
                              ? 'text-red-700 dark:text-red-300'
                              : 'text-yellow-700 dark:text-yellow-300'
                          )}
                        >
                          {isCritical
                            ? 'Storage is critically low. Auto-save may fail.'
                            : 'Consider cleaning up old data to free space.'}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Cleanup Button */}
                  <Button
                    onClick={handleCleanup}
                    disabled={isCleaningUp}
                    className="w-full"
                    variant={isCritical ? 'destructive' : 'outline'}
                  >
                    {isCleaningUp ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Cleaning up...
                      </>
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Clean Up Old Data
                      </>
                    )}
                  </Button>

                  <p className="text-xs text-muted-foreground">
                    Cleanup removes old auto-save data while preserving your current work.
                  </p>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1">
        <Progress value={storageInfo.usedPercentage} className="h-1.5" />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{storageInfo.usedFormatted}</span>
          <span>{storageInfo.totalFormatted}</span>
        </div>
      </div>

      {/* Warning for near capacity */}
      {isNearCapacity && !compact && (
        <div className="flex items-center space-x-2 text-xs text-yellow-600 dark:text-yellow-400">
          <AlertTriangle className="h-3 w-3" />
          <span>Storage is {isCritical ? 'critically' : 'nearly'} full</span>
        </div>
      )}
    </div>
  );
};
