/**
 * @fileoverview Dialog component for handling multi-device file conflicts
 * @author MarkDownUltraRemix Team
 */

import { AlertTriangle, Monitor, Smartphone, Tablet } from 'lucide-react';
import type React from 'react';
import { Badge } from '@/components/ui/badge';
// import { useTheme } from "@/components/features/ThemeSelector";
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export interface DeviceConflictInfo {
  currentDevice: {
    fileId: string;
    fileName: string;
    lastModified: string;
    deviceName: string;
  };
  otherDevice: {
    fileId: string;
    fileName: string;
    lastModified: string;
    deviceName: string;
  };
}

interface DeviceConflictDialogProps {
  isOpen: boolean;
  onClose: () => void;
  conflictInfo: DeviceConflictInfo | null;
  onSelectFile: (fileId: string, deviceName: string) => void;
  onKeepBoth: () => void;
}

/**
 * Get device icon based on device name
 */
const getDeviceIcon = (deviceName: string) => {
  const name = deviceName.toLowerCase();
  if (name.includes('mobile') || name.includes('android') || name.includes('ios')) {
    return <Smartphone className="h-4 w-4" />;
  }
  if (name.includes('tablet') || name.includes('ipad')) {
    return <Tablet className="h-4 w-4" />;
  }
  return <Monitor className="h-4 w-4" />;
};

/**
 * Format relative time
 */
const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

  return date.toLocaleDateString();
};

/**
 * Device conflict resolution dialog
 */
export const DeviceConflictDialog: React.FC<DeviceConflictDialogProps> = ({
  isOpen,
  onClose,
  conflictInfo,
  onSelectFile,
  onKeepBoth,
}) => {
  if (!conflictInfo) return null;

  const { currentDevice, otherDevice } = conflictInfo;

  // Determine which file is more recent
  const currentTime = new Date(currentDevice.lastModified);
  const otherTime = new Date(otherDevice.lastModified);
  const isOtherMoreRecent = otherTime > currentTime;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            File Conflict Detected
          </DialogTitle>
          <DialogDescription>
            You have different files open on multiple devices. Which file would you like to continue
            with?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current Device Option */}
          <div
            className={`p-4 rounded-lg border-2 transition-colors ${
              !isOtherMoreRecent
                ? 'border-green-500 bg-green-50 dark:bg-green-950'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2 mb-2">
                {getDeviceIcon(currentDevice.deviceName)}
                <span className="font-medium">{currentDevice.deviceName}</span>
                <Badge variant="secondary">Current Device</Badge>
                {!isOtherMoreRecent && (
                  <Badge variant="default" className="bg-green-500">
                    Most Recent
                  </Badge>
                )}
              </div>
            </div>
            <div className="space-y-1">
              <p className="font-medium text-sm">{currentDevice.fileName}</p>
              <p className="text-xs text-muted-foreground">
                Last modified: {formatRelativeTime(currentDevice.lastModified)}
              </p>
            </div>
            <Button
              variant={!isOtherMoreRecent ? 'default' : 'outline'}
              size="sm"
              className="mt-3 w-full"
              onClick={() => onSelectFile(currentDevice.fileId, currentDevice.deviceName)}
            >
              Use This File
            </Button>
          </div>

          {/* Other Device Option */}
          <div
            className={`p-4 rounded-lg border-2 transition-colors ${
              isOtherMoreRecent
                ? 'border-green-500 bg-green-50 dark:bg-green-950'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2 mb-2">
                {getDeviceIcon(otherDevice.deviceName)}
                <span className="font-medium">{otherDevice.deviceName}</span>
                {isOtherMoreRecent && (
                  <Badge variant="default" className="bg-green-500">
                    Most Recent
                  </Badge>
                )}
              </div>
            </div>
            <div className="space-y-1">
              <p className="font-medium text-sm">{otherDevice.fileName}</p>
              <p className="text-xs text-muted-foreground">
                Last modified: {formatRelativeTime(otherDevice.lastModified)}
              </p>
            </div>
            <Button
              variant={isOtherMoreRecent ? 'default' : 'outline'}
              size="sm"
              className="mt-3 w-full"
              onClick={() => onSelectFile(otherDevice.fileId, otherDevice.deviceName)}
            >
              Use This File
            </Button>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={onKeepBoth} className="w-full sm:w-auto">
            Keep Both Files
          </Button>
          <Button variant="ghost" onClick={onClose} className="w-full sm:w-auto">
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeviceConflictDialog;
