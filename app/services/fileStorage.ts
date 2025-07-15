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

    try {
      safeConsole.log('Deleting file from cloud:', fileId);

      // Soft delete
      const { error } = await this.supabaseClient
        .from('user_files')
        .update({
          is_deleted: true,
          deleted_at: new Date().toISOString(),
        })
        .eq('id', fileId)
        .eq('user_id', this.userId);

      if (error) {
        handleSupabaseError(error, 'delete file');
        throw error;
      }

      safeConsole.log('File deleted from cloud:', fileId);
    } catch (error) {
      safeConsole.error('Error deleting file from cloud:', error);
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

  // Unified operations
  async save(file: FileData): Promise<FileData> {
    if (this.isAuthenticated) {
      return await this.saveToCloud(file);
    }
    this.saveToLocal(file);
    return file;
  }

  async load(identifier: string): Promise<FileData | null> {
    if (this.isAuthenticated) {
      return await this.loadFromCloud(identifier);
    }
    return this.loadFromLocal(identifier);
  }

  async list(): Promise<FileData[]> {
    if (this.isAuthenticated) {
      return await this.listCloudFiles();
    }
    return this.listLocalFiles();
  }

  async delete(identifier: string): Promise<void> {
    if (this.isAuthenticated) {
      await this.deleteFromCloud(identifier);
    } else {
      this.deleteFromLocal(identifier);
    }
  }

  // Utility operations
  getStorageInfo(): StorageInfo {
    const files = this.isAuthenticated ? [] : this.listLocalFiles(); // For local, we can get immediate info
    const totalSize = files.reduce((sum, file) => sum + (file.content?.length || 0), 0);

    return {
      isAuthenticated: this.isAuthenticated,
      storageType: this.isAuthenticated ? 'cloud' : 'local',
      totalFiles: files.length,
      totalSize,
      lastSync: getStorageItem(STORAGE_KEYS.LAST_SYNC) || undefined,
      quotaUsed: this.isAuthenticated ? undefined : totalSize,
      quotaLimit: this.isAuthenticated ? STORAGE_LIMITS.MAX_TOTAL_SIZE : undefined,
    };
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
