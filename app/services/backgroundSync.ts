/**
 * @fileoverview Background sync service for non-blocking operations
 * @author Augment Agent
 */

import type { FileData } from '@/lib/supabase';
import { safeConsole } from '@/utils/console';
import type { FileStorageService } from './fileStorage';

// Extended interface for storage service with batch operations
interface ExtendedStorageService {
  saveToCloud: (file: FileData) => Promise<FileData>;
  deleteFromCloud: (fileId: string) => Promise<void>;
  batchSaveToCloud?: (files: FileData[]) => Promise<FileData[]>;
  batchDeleteFromCloud?: (fileIds: string[]) => Promise<void>;
}

type SyncQueueData = FileData | string | FileData[] | string[];

interface SyncQueueItem {
  id: string;
  type: 'save' | 'delete' | 'batch_save' | 'batch_delete';
  data: SyncQueueData;
  priority: 'high' | 'medium' | 'low';
  timestamp: number;
  retries: number;
  maxRetries: number;
}

interface BackgroundSyncOptions {
  maxConcurrent?: number;
  retryDelay?: number;
  maxRetries?: number;
  batchSize?: number;
}

/**
 * Background sync service untuk non-blocking operations
 * Mengoptimalkan CPU usage dengan queue-based processing
 */
export class BackgroundSyncService {
  private queue: SyncQueueItem[] = [];
  private processing = false;
  private storageService: FileStorageService | null = null;
  private options: Required<BackgroundSyncOptions>;
  private activeOperations = 0;

  constructor(options: BackgroundSyncOptions = {}) {
    this.options = {
      maxConcurrent: options.maxConcurrent || 3,
      retryDelay: options.retryDelay || 2000,
      maxRetries: options.maxRetries || 3,
      batchSize: options.batchSize || 5,
    };
  }

  setStorageService(service: FileStorageService) {
    this.storageService = service;
  }

  /**
   * Add file save to background queue - non-blocking
   */
  queueFileSave(file: FileData, priority: 'high' | 'medium' | 'low' = 'medium') {
    const item: SyncQueueItem = {
      id: `save_${file.id || Date.now()}`,
      type: 'save',
      data: file,
      priority,
      timestamp: Date.now(),
      retries: 0,
      maxRetries: this.options.maxRetries,
    };

    this.addToQueue(item);
    safeConsole.log(`📤 Queued file save: ${file.title} (priority: ${priority})`);
  }

  /**
   * Add file delete to background queue - non-blocking
   */
  queueFileDelete(fileId: string, priority: 'high' | 'medium' | 'low' = 'medium') {
    const item: SyncQueueItem = {
      id: `delete_${fileId}`,
      type: 'delete',
      data: fileId,
      priority,
      timestamp: Date.now(),
      retries: 0,
      maxRetries: this.options.maxRetries,
    };

    this.addToQueue(item);
    safeConsole.log(`🗑️ Queued file delete: ${fileId} (priority: ${priority})`);
  }

  /**
   * Add batch operations to queue - CPU efficient
   */
  queueBatchSave(files: FileData[], priority: 'high' | 'medium' | 'low' = 'low') {
    // Split large batches into smaller chunks
    const chunks = this.chunkArray(files, this.options.batchSize);

    chunks.forEach((chunk, index) => {
      const item: SyncQueueItem = {
        id: `batch_save_${Date.now()}_${index}`,
        type: 'batch_save',
        data: chunk,
        priority,
        timestamp: Date.now(),
        retries: 0,
        maxRetries: this.options.maxRetries,
      };

      this.addToQueue(item);
    });

    safeConsole.log(`📦 Queued batch save: ${files.length} files in ${chunks.length} chunks`);
  }

  /**
   * Add batch delete to queue
   */
  queueBatchDelete(fileIds: string[], priority: 'high' | 'medium' | 'low' = 'low') {
    const chunks = this.chunkArray(fileIds, this.options.batchSize);

    chunks.forEach((chunk, index) => {
      const item: SyncQueueItem = {
        id: `batch_delete_${Date.now()}_${index}`,
        type: 'batch_delete',
        data: chunk,
        priority,
        timestamp: Date.now(),
        retries: 0,
        maxRetries: this.options.maxRetries,
      };

      this.addToQueue(item);
    });

    safeConsole.log(`🗑️ Queued batch delete: ${fileIds.length} files in ${chunks.length} chunks`);
  }

  /**
   * Process queue in background - non-blocking
   */
  private async processQueue() {
    if (this.processing || this.activeOperations >= this.options.maxConcurrent) {
      return;
    }

    this.processing = true;

    while (this.queue.length > 0 && this.activeOperations < this.options.maxConcurrent) {
      // Sort by priority and timestamp
      this.queue.sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
        if (priorityDiff !== 0) return priorityDiff;
        return a.timestamp - b.timestamp;
      });

      const item = this.queue.shift();
      if (!item) break;

      this.activeOperations++;
      this.processItem(item).finally(() => {
        this.activeOperations--;
      });
    }

    this.processing = false;
  }

  /**
   * Process individual queue item
   */
  private async processItem(item: SyncQueueItem) {
    if (!this.storageService) {
      safeConsole.error('❌ Storage service not available for background sync');
      return;
    }

    try {
      safeConsole.log(`🔄 Processing ${item.type}: ${item.id}`);

      const extendedService = this.storageService as ExtendedStorageService;

      switch (item.type) {
        case 'save':
          await extendedService.saveToCloud(item.data as FileData);
          break;
        case 'delete':
          await extendedService.deleteFromCloud(item.data as string);
          break;
        case 'batch_save':
          if ('batchSaveToCloud' in this.storageService && extendedService.batchSaveToCloud) {
            await extendedService.batchSaveToCloud(item.data as FileData[]);
          } else {
            // Fallback to individual saves
            for (const file of item.data as FileData[]) {
              await extendedService.saveToCloud(file);
            }
          }
          break;
        case 'batch_delete':
          if (
            'batchDeleteFromCloud' in this.storageService &&
            extendedService.batchDeleteFromCloud
          ) {
            await extendedService.batchDeleteFromCloud(item.data as string[]);
          } else {
            // Fallback to individual deletes
            for (const fileId of item.data as string[]) {
              await extendedService.deleteFromCloud(fileId);
            }
          }
          break;
      }

      safeConsole.log(`✅ Completed ${item.type}: ${item.id}`);
    } catch (error) {
      safeConsole.error(`❌ Failed ${item.type}: ${item.id}`, error);

      // Retry logic
      if (item.retries < item.maxRetries) {
        item.retries++;
        item.timestamp = Date.now() + this.options.retryDelay;
        this.addToQueue(item);
        safeConsole.log(
          `🔄 Retrying ${item.type}: ${item.id} (attempt ${item.retries}/${item.maxRetries})`
        );
      } else {
        safeConsole.error(`💀 Max retries exceeded for ${item.type}: ${item.id}`);
      }
    }
  }

  /**
   * Add item to queue and trigger processing
   */
  private addToQueue(item: SyncQueueItem) {
    this.queue.push(item);

    // Use setTimeout to make processing non-blocking
    setTimeout(() => this.processQueue(), 0);
  }

  /**
   * Utility to chunk arrays
   */
  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  /**
   * Get queue status for monitoring
   */
  getQueueStatus() {
    return {
      queueLength: this.queue.length,
      activeOperations: this.activeOperations,
      processing: this.processing,
      priorityBreakdown: {
        high: this.queue.filter((item) => item.priority === 'high').length,
        medium: this.queue.filter((item) => item.priority === 'medium').length,
        low: this.queue.filter((item) => item.priority === 'low').length,
      },
    };
  }

  /**
   * Clear queue (for emergency situations)
   */
  clearQueue() {
    this.queue = [];
    safeConsole.log('🧹 Background sync queue cleared');
  }

  /**
   * Pause processing
   */
  pause() {
    this.processing = true;
    safeConsole.log('⏸️ Background sync paused');
  }

  /**
   * Resume processing
   */
  resume() {
    this.processing = false;
    this.processQueue();
    safeConsole.log('▶️ Background sync resumed');
  }
}

// Global instance
export const backgroundSync = new BackgroundSyncService({
  maxConcurrent: 2, // Conservative for free plan
  retryDelay: 3000,
  maxRetries: 2,
  batchSize: 3, // Small batches for free plan
});
