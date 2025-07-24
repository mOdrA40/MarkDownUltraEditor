/**
 * @fileoverview Hybrid file storage service with Supabase cloud and localStorage fallback
 * @author Axel Modra
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import {
  getStorageItem,
  getStorageJSON,
  removeStorageItem,
  setStorageJSON,
} from '@/components/editor/MarkdownEditor/utils/storageUtils';
import {
  type Database,
  dbRowToFileData,
  type FileData,
  fileDataToDbInsert,
  handleSupabaseError,
} from '@/lib/supabase';
import { safeConsole } from '@/utils/console';

// Storage keys for localStorage
const STORAGE_KEYS = {
  FILES_LIST: 'markdownEditor_filesList',
  FILE_PREFIX: 'markdownEditor_file_',
  LAST_SYNC: 'markdownEditor_lastSync',
  USER_PREFERENCES: 'markdownEditor_userPrefs',
} as const;

// Storage limits
const STORAGE_LIMITS = {
  MAX_FILES_PER_USER: 100,
  MAX_FILE_SIZE: 1024 * 1024, // 1MB
  MAX_TOTAL_SIZE: 50 * 1024 * 1024, // 50MB
} as const;

/**
 * File storage service interface
 */
export interface FileStorageService {
  // Cloud operations (authenticated users)
  saveToCloud(file: FileData): Promise<FileData>;
  loadFromCloud(fileId: string): Promise<FileData | null>;
  listCloudFiles(): Promise<FileData[]>;
  deleteFromCloud(fileId: string): Promise<void>;

  // Local operations (non-authenticated users)
  saveToLocal(file: FileData): void;
  loadFromLocal(fileName: string): FileData | null;
  listLocalFiles(): FileData[];
  deleteFromLocal(fileName: string): void;

  // Unified operations
  save(file: FileData): Promise<FileData>;
  load(identifier: string): Promise<FileData | null>;
  list(): Promise<FileData[]>;
  delete(identifier: string): Promise<void>;

  // Utility operations
  getStorageInfo(): StorageInfo;
  getStorageInfoAsync(): Promise<StorageInfo>;
  syncLocalToCloud?(): Promise<void>;
  exportAllFiles(): Promise<Blob>;
}

/**
 * Storage information interface
 */
export interface StorageInfo {
  isAuthenticated: boolean;
  storageType: 'cloud' | 'local';
  totalFiles: number;
  totalSize: number;
  lastSync?: string;
  quotaUsed?: number;
  quotaLimit?: number;
}

/**
 * Hybrid file storage implementation
 */
export class HybridFileStorage implements FileStorageService {
  private supabaseClient: SupabaseClient<Database> | null;
  private userId: string | null;
  private isAuthenticated: boolean;

  constructor(supabaseClient: SupabaseClient<Database> | null, userId: string | null) {
    this.supabaseClient = supabaseClient;
    this.userId = userId;
    this.isAuthenticated = !!(supabaseClient && userId);

    safeConsole.log('HybridFileStorage initialized:', {
      isAuthenticated: this.isAuthenticated,
      userId: userId ? 'present' : 'null',
      supabaseClient: supabaseClient ? 'present' : 'null',
    });
  }

  // Cloud operations
  async saveToCloud(file: FileData): Promise<FileData> {
    if (!this.supabaseClient || !this.userId) {
      throw new Error('Not authenticated for cloud storage');
    }

    try {
      safeConsole.log('Saving file to cloud:', file.title);

      // Validate file size
      if (file.content.length > STORAGE_LIMITS.MAX_FILE_SIZE) {
        throw new Error(`File size exceeds limit of ${STORAGE_LIMITS.MAX_FILE_SIZE / 1024}KB`);
      }

      const dbInsert = fileDataToDbInsert(file, this.userId);

      // Check if file exists (update) or create new
      if (file.id) {
        // Update existing file by ID
        const { data, error } = await this.supabaseClient
          .from('user_files')
          .update({
            ...dbInsert,
            updated_at: new Date().toISOString(),
          })
          .eq('id', file.id)
          .eq('user_id', this.userId)
          .select()
          .single();

        if (error) {
          handleSupabaseError(error, 'update file');
          throw error;
        }

        safeConsole.log('File updated in cloud:', data.title);
        return dbRowToFileData(data);
      }

      const { data: existingFile } = await this.supabaseClient
        .from('user_files')
        .select('id, title, updated_at')
        .eq('user_id', this.userId)
        .eq('title', file.title)
        .eq('is_deleted', false)
        .single();

      if (existingFile) {
        // File exists - update it
        const { data, error } = await this.supabaseClient
          .from('user_files')
          .update({
            ...dbInsert,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingFile.id)
          .eq('user_id', this.userId)
          .select()
          .single();

        if (error) {
          handleSupabaseError(error, 'update existing file');
          throw error;
        }

        safeConsole.log('Existing file updated in cloud:', data.title);
        return dbRowToFileData(data);
      }

      // File doesn't exist - create new
      const { data, error } = await this.supabaseClient
        .from('user_files')
        .insert(dbInsert)
        .select()
        .single();

      if (error) {
        handleSupabaseError(error, 'create file');
        throw error;
      }

      safeConsole.log('File created in cloud:', data.title);
      return dbRowToFileData(data);
    } catch (error) {
      safeConsole.error('Error saving file to cloud:', error);
      throw error;
    }
  }

  async loadFromCloud(fileId: string): Promise<FileData | null> {
    if (!this.supabaseClient || !this.userId) {
      throw new Error('Not authenticated for cloud storage');
    }

    try {
      safeConsole.log('Loading file from cloud:', fileId);

      const { data, error } = await this.supabaseClient
        .from('user_files')
        .select('*')
        .eq('id', fileId)
        .eq('user_id', this.userId)
        .eq('is_deleted', false)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          safeConsole.log('File not found in cloud:', fileId);
          return null;
        }
        handleSupabaseError(error, 'load file');
        throw error;
      }

      safeConsole.log('File loaded from cloud:', data.title);
      return dbRowToFileData(data);
    } catch (error) {
      safeConsole.error('Error loading file from cloud:', error);
      throw error;
    }
  }

  async listCloudFiles(): Promise<FileData[]> {
    if (!this.supabaseClient || !this.userId) {
      throw new Error('Not authenticated for cloud storage');
    }

    try {
      safeConsole.log('Listing files from cloud');

      const { data, error } = await this.supabaseClient
        .from('user_files')
        .select('*')
        .eq('user_id', this.userId)
        .eq('is_deleted', false)
        .order('updated_at', { ascending: false });

      if (error) {
        handleSupabaseError(error, 'list files');
        throw error;
      }

      safeConsole.log(`Loaded ${data.length} files from cloud`);
      return data.map(dbRowToFileData);
    } catch (error) {
      safeConsole.error('Error listing files from cloud:', error);
      throw error;
    }
  }

  async deleteFromCloud(fileId: string): Promise<void> {
    if (!this.supabaseClient || !this.userId) {
      throw new Error('Not authenticated for cloud storage');
    }

    safeConsole.log('Attempting to permanently delete file from cloud:', fileId);

    try {
      const { error } = await this.supabaseClient
        .from('user_files')
        .delete()
        .eq('id', fileId)
        .eq('user_id', this.userId);

      if (error) {
        handleSupabaseError(error, 'delete file');
        throw error;
      }

      safeConsole.log('File permanently deleted from cloud successfully:', fileId);
    } catch (error) {
      safeConsole.error('Error permanently deleting file from cloud:', {
        fileId,
        userId: this.userId,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  // Local operations
  saveToLocal(file: FileData): void {
    try {
      safeConsole.log('Saving file to local storage:', file.title);

      // Get current files list
      const filesList = this.listLocalFiles();

      // Check storage limits
      if (filesList.length >= STORAGE_LIMITS.MAX_FILES_PER_USER) {
        throw new Error(`Maximum number of files (${STORAGE_LIMITS.MAX_FILES_PER_USER}) reached`);
      }

      // Generate ID if not present
      const fileId =
        file.id || `local_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
      const fileWithId = { ...file, id: fileId };

      // Save file data
      const fileKey = `${STORAGE_KEYS.FILE_PREFIX}${fileId}`;
      setStorageJSON(fileKey, fileWithId);

      // Update files list
      const updatedList = filesList.filter((f) => f.id !== fileId);
      updatedList.unshift(fileWithId);
      setStorageJSON(STORAGE_KEYS.FILES_LIST, updatedList);

      safeConsole.log('File saved to local storage:', file.title);
    } catch (error) {
      safeConsole.error('Error saving file to local storage:', error);
      throw error;
    }
  }

  loadFromLocal(fileName: string): FileData | null {
    try {
      safeConsole.log('Loading file from local storage:', fileName);

      // Try to load by ID first
      const fileKey = `${STORAGE_KEYS.FILE_PREFIX}${fileName}`;
      let fileData = getStorageJSON<FileData>(fileKey);

      if (!fileData) {
        // Try to find by title in files list
        const filesList = this.listLocalFiles();
        fileData = filesList.find((f) => f.title === fileName || f.id === fileName) || null;
      }

      if (fileData) {
        safeConsole.log('File loaded from local storage:', fileData.title);
      } else {
        safeConsole.log('File not found in local storage:', fileName);
      }

      return fileData;
    } catch (error) {
      safeConsole.error('Error loading file from local storage:', error);
      return null;
    }
  }

  listLocalFiles(): FileData[] {
    try {
      const filesList = getStorageJSON<FileData[]>(STORAGE_KEYS.FILES_LIST, []);
      if (!filesList) {
        safeConsole.log('No files found in local storage');
        return [];
      }
      safeConsole.log(`Loaded ${filesList.length} files from local storage`);
      return filesList;
    } catch (error) {
      safeConsole.error('Error listing files from local storage:', error);
      return [];
    }
  }

  deleteFromLocal(fileName: string): void {
    try {
      safeConsole.log('Deleting file from local storage:', fileName);

      // Remove from files list
      const filesList = this.listLocalFiles();
      const updatedList = filesList.filter((f) => f.title !== fileName && f.id !== fileName);
      setStorageJSON(STORAGE_KEYS.FILES_LIST, updatedList);

      // Remove individual file data
      const fileToDelete = filesList.find((f) => f.title === fileName || f.id === fileName);
      if (fileToDelete?.id) {
        const fileKey = `${STORAGE_KEYS.FILE_PREFIX}${fileToDelete.id}`;
        removeStorageItem(fileKey);
      }

      safeConsole.log('File deleted from local storage:', fileName);
    } catch (error) {
      safeConsole.error('Error deleting file from local storage:', error);
      throw error;
    }
  }

  // Unified operations with improved error handling
  async save(file: FileData): Promise<FileData> {
    if (this.isAuthenticated) {
      try {
        return await this.saveToCloud(file);
      } catch (error) {
        safeConsole.error(
          'Failed to save to cloud, not falling back to local for authenticated users:',
          error
        );
        throw error; // Don't fallback to local for authenticated users
      }
    }
    this.saveToLocal(file);
    return file;
  }

  async load(identifier: string): Promise<FileData | null> {
    if (this.isAuthenticated) {
      try {
        const result = await this.loadFromCloud(identifier);
        if (result) {
          safeConsole.log('Successfully loaded file from cloud:', result.title);
        } else {
          safeConsole.log('File not found in cloud storage:', identifier);
        }
        return result;
      } catch (error) {
        safeConsole.error(
          'Failed to load from cloud, not falling back to local for authenticated users:',
          error
        );
        throw error; // Don't fallback to local for authenticated users
      }
    }
    return this.loadFromLocal(identifier);
  }

  async list(): Promise<FileData[]> {
    if (this.isAuthenticated) {
      try {
        const files = await this.listCloudFiles();
        safeConsole.log(`Loaded ${files.length} files from cloud`);
        return files;
      } catch (error) {
        safeConsole.error(
          'Failed to list cloud files, not falling back to local for authenticated users:',
          error
        );
        throw error; // Don't fallback to local for authenticated users
      }
    }
    return this.listLocalFiles();
  }

  async delete(identifier: string): Promise<void> {
    if (this.isAuthenticated) {
      try {
        await this.deleteFromCloud(identifier);
        safeConsole.log('Successfully deleted file from cloud:', identifier);
      } catch (error) {
        safeConsole.error(
          'Failed to delete from cloud, not falling back to local for authenticated users:',
          error
        );
        throw error; // Don't fallback to local for authenticated users
      }
    } else {
      this.deleteFromLocal(identifier);
    }
  }

  // Utility operations
  getStorageInfo(): StorageInfo {
    // For local storage, we can get immediate info
    if (!this.isAuthenticated) {
      const files = this.listLocalFiles();
      const totalSize = files.reduce((sum, file) => sum + (file.content?.length || 0), 0);

      return {
        isAuthenticated: false,
        storageType: 'local',
        totalFiles: files.length,
        totalSize,
        lastSync: getStorageItem(STORAGE_KEYS.LAST_SYNC) || undefined,
        quotaUsed: totalSize,
        quotaLimit: STORAGE_LIMITS.MAX_TOTAL_SIZE,
      };
    }

    // For cloud storage, return basic info (detailed info will be fetched async)
    return {
      isAuthenticated: true,
      storageType: 'cloud',
      totalFiles: 0, // Will be updated by the hook with actual data
      totalSize: 0, // Will be updated by the hook with actual data
      lastSync: getStorageItem(STORAGE_KEYS.LAST_SYNC) || undefined,
      quotaUsed: undefined,
      quotaLimit: undefined,
    };
  }

  // New async method to get complete storage info for cloud
  async getStorageInfoAsync(): Promise<StorageInfo> {
    if (!this.isAuthenticated) {
      return this.getStorageInfo();
    }

    try {
      const files = await this.listCloudFiles();
      const totalSize = files.reduce((sum, file) => sum + (file.content?.length || 0), 0);

      return {
        isAuthenticated: true,
        storageType: 'cloud',
        totalFiles: files.length,
        totalSize,
        lastSync: new Date().toISOString(),
        quotaUsed: totalSize,
        quotaLimit: undefined, // Cloud storage doesn't have a hard limit for now
      };
    } catch (error) {
      safeConsole.error('Error getting cloud storage info:', error);
      return this.getStorageInfo(); // Fallback to basic info
    }
  }

  async exportAllFiles(): Promise<Blob> {
    try {
      safeConsole.log('Exporting all files');

      const files = await this.list();
      const exportData = {
        exportDate: new Date().toISOString(),
        totalFiles: files.length,
        files: files.map((file) => ({
          title: file.title,
          content: file.content,
          tags: file.tags,
          createdAt: file.createdAt,
          updatedAt: file.updatedAt,
        })),
      };

      const jsonString = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });

      safeConsole.log(`Exported ${files.length} files`);
      return blob;
    } catch (error) {
      safeConsole.error('Error exporting files:', error);
      throw error;
    }
  }
}

/**
 * Create file storage service instance
 */
export const createFileStorageService = (
  supabaseClient: SupabaseClient<Database> | null,
  userId: string | null
): FileStorageService => {
  return new HybridFileStorage(supabaseClient, userId);
};
