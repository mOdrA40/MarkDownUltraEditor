/**
 * @fileoverview Optimized auto-save hook with advanced debouncing and batching
 * @author Axel Modra
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { useToast } from '@/hooks/core/useToast';
import type { FileData } from '@/lib/supabase';
import { safeConsole } from '@/utils/console';

interface UseOptimizedAutoSaveOptions {
  /** Debounce delay in milliseconds (default: 8000) */
  debounceMs?: number;
  /** Maximum time to wait before forcing save (default: 30000) */
  maxWaitMs?: number;
  /** Enable batching of multiple changes (default: true) */
  enableBatching?: boolean;
  /** Callback when save starts */
  onSaveStart?: () => void;
  /** Callback when save completes */
  onSaveComplete?: (success: boolean) => void;
}

interface UseOptimizedAutoSaveReturn {
  /** Trigger auto-save for a file */
  triggerAutoSave: (file: Partial<FileData>) => void;
  /** Check if auto-save is currently in progress */
  isSaving: boolean;
  /** Get the last save timestamp */
  lastSaveTime: number | null;
  /** Force immediate save (bypasses debouncing) */
  forceSave: () => void;
  /** Cancel pending auto-save */
  cancelAutoSave: () => void;
}

/**
 * Optimized auto-save hook with advanced debouncing and batching
 */
export const useOptimizedAutoSave = (
  saveFunction: (file: FileData) => Promise<FileData>,
  options: UseOptimizedAutoSaveOptions = {}
): UseOptimizedAutoSaveReturn => {
  const {
    debounceMs = 8000, // 8 seconds default
    maxWaitMs = 30000, // 30 seconds max wait
    enableBatching = true,
    onSaveStart,
    onSaveComplete,
  } = options;

  const { toast } = useToast();

  const [isSaving, setIsSaving] = useState(false);
  const [lastSaveTime, setLastSaveTime] = useState<number | null>(null);

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const maxWaitTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pendingFileRef = useRef<Partial<FileData> | null>(null);
  const firstChangeTimeRef = useRef<number | null>(null);

  /**
   * Clear all timers
   */
  const clearTimers = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    if (maxWaitTimerRef.current) {
      clearTimeout(maxWaitTimerRef.current);
      maxWaitTimerRef.current = null;
    }
  }, []);

  /**
   * Perform the actual save operation
   */
  const performSave = useCallback(async () => {
    const fileToSave = pendingFileRef.current;
    if (!fileToSave || !fileToSave.title || !fileToSave.content) {
      safeConsole.error('No valid file to save');
      return;
    }

    try {
      setIsSaving(true);
      onSaveStart?.();

      safeConsole.log('Performing optimized auto-save:', fileToSave.title);

      const completeFile: FileData = {
        id: fileToSave.id || '',
        title: fileToSave.title,
        content: fileToSave.content,
        fileType: fileToSave.fileType || 'markdown',
        tags: fileToSave.tags || [],
        createdAt: fileToSave.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isTemplate: fileToSave.isTemplate || false,
        fileSize: fileToSave.content.length,
        version: (fileToSave.version || 0) + 1,
      };

      await saveFunction(completeFile);

      setLastSaveTime(Date.now());
      safeConsole.log('Optimized auto-save completed successfully');
      onSaveComplete?.(true);
    } catch (error) {
      safeConsole.error('Optimized auto-save failed:', error);
      onSaveComplete?.(false);

      toast({
        title: 'Auto-save Failed',
        description: 'Failed to auto-save your changes. Please save manually.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
      pendingFileRef.current = null;
      firstChangeTimeRef.current = null;
      clearTimers();
    }
  }, [saveFunction, onSaveStart, onSaveComplete, toast, clearTimers]);

  /**
   * Trigger auto-save with optimized debouncing
   */
  const triggerAutoSave = useCallback(
    (file: Partial<FileData>) => {
      if (!file.title || !file.content) {
        safeConsole.error('Invalid file data for auto-save');
        return;
      }

      // Update pending file (batching multiple changes)
      if (enableBatching) {
        pendingFileRef.current = {
          ...pendingFileRef.current,
          ...file,
          updatedAt: new Date().toISOString(),
        };
      } else {
        pendingFileRef.current = file;
      }

      // Track first change time for max wait timer
      if (!firstChangeTimeRef.current) {
        firstChangeTimeRef.current = Date.now();
      }

      // Clear existing debounce timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Set up debounce timer
      debounceTimerRef.current = setTimeout(() => {
        performSave();
      }, debounceMs);

      // Set up max wait timer (only if not already set)
      if (!maxWaitTimerRef.current && firstChangeTimeRef.current) {
        maxWaitTimerRef.current = setTimeout(() => {
          safeConsole.log('Max wait time reached, forcing auto-save');
          if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
          }
          performSave();
        }, maxWaitMs);
      }

      safeConsole.log(`Auto-save scheduled for ${file.title} (debounce: ${debounceMs}ms)`);
    },
    [debounceMs, maxWaitMs, enableBatching, performSave]
  );

  /**
   * Force immediate save
   */
  const forceSave = useCallback(() => {
    if (pendingFileRef.current) {
      clearTimers();
      performSave();
    }
  }, [clearTimers, performSave]);

  /**
   * Cancel pending auto-save
   */
  const cancelAutoSave = useCallback(() => {
    clearTimers();
    pendingFileRef.current = null;
    firstChangeTimeRef.current = null;
    safeConsole.log('Auto-save cancelled');
  }, [clearTimers]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimers();
    };
  }, [clearTimers]);

  return {
    triggerAutoSave,
    isSaving,
    lastSaveTime,
    forceSave,
    cancelAutoSave,
  };
};
