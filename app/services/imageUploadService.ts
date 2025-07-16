/**
 * @fileoverview Image Upload Service with Supabase Storage and Base64 fallback
 * @author Axel Modra
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import { safeConsole } from '@/utils/console';

// Image configuration
const IMAGE_CONFIG = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'] as const,
  BUCKET_NAME: 'images',
  QUALITY: 0.8,
} as const;

export interface ImageUploadResult {
  success: boolean;
  url?: string;
  error?: string;
  isBase64?: boolean;
}

export interface ImageUploadOptions {
  compress?: boolean;
  maxWidth?: number;
  maxHeight?: number;
}

/**
 * Image Upload Service with hybrid storage
 */
export class ImageUploadService {
  private supabaseClient: SupabaseClient | null;
  private userId: string | null;
  private isAuthenticated: boolean;

  constructor(supabaseClient: SupabaseClient | null, userId: string | null) {
    this.supabaseClient = supabaseClient;
    this.userId = userId;
    this.isAuthenticated = !!(supabaseClient && userId);
  }

  /**
   * Upload image with automatic mode selection
   */
  async uploadImage(file: File, options: ImageUploadOptions = {}): Promise<ImageUploadResult> {
    try {
      // Validate file
      const validation = this.validateImage(file);
      if (!validation.success) {
        return validation;
      }

      // Compress if needed
      const processedFile = options.compress ? await this.compressImage(file, options) : file;

      if (this.isAuthenticated) {
        return await this.uploadToSupabase(processedFile);
      }
      return await this.convertToBase64(processedFile);
    } catch (error) {
      safeConsole.error('Image upload failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed',
      };
    }
  }

  /**
   * Upload to Supabase Storage (authenticated users)
   */
  private async uploadToSupabase(file: File): Promise<ImageUploadResult> {
    if (!this.supabaseClient || !this.userId) {
      return { success: false, error: 'Not authenticated' };
    }

    try {
      const fileName = `${this.userId}/${Date.now()}-${file.name}`;

      const { data, error } = await this.supabaseClient.storage
        .from(IMAGE_CONFIG.BUCKET_NAME)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) {
        safeConsole.error('Supabase upload error:', error);
        return { success: false, error: error.message };
      }

      // Get public URL
      const { data: urlData } = this.supabaseClient.storage
        .from(IMAGE_CONFIG.BUCKET_NAME)
        .getPublicUrl(data.path);

      return {
        success: true,
        url: urlData.publicUrl,
        isBase64: false,
      };
    } catch (error) {
      safeConsole.error('Supabase upload failed:', error);
      return { success: false, error: 'Upload to cloud failed' };
    }
  }

  /**
   * Convert to Base64 (guest users)
   */
  private async convertToBase64(file: File): Promise<ImageUploadResult> {
    return new Promise((resolve) => {
      const reader = new FileReader();

      reader.onload = () => {
        resolve({
          success: true,
          url: reader.result as string,
          isBase64: true,
        });
      };

      reader.onerror = () => {
        resolve({
          success: false,
          error: 'Failed to process image',
        });
      };

      reader.readAsDataURL(file);
    });
  }

  /**
   * Validate image file
   */
  private validateImage(file: File): ImageUploadResult {
    // Check file type
    if (!(IMAGE_CONFIG.ALLOWED_TYPES as readonly string[]).includes(file.type)) {
      return {
        success: false,
        error: `Unsupported file type. Allowed: ${IMAGE_CONFIG.ALLOWED_TYPES.join(', ')}`,
      };
    }

    // Check file size
    if (file.size > IMAGE_CONFIG.MAX_SIZE) {
      return {
        success: false,
        error: `File too large. Maximum size: ${IMAGE_CONFIG.MAX_SIZE / (1024 * 1024)}MB`,
      };
    }

    return { success: true };
  }

  /**
   * Compress image
   */
  private async compressImage(file: File, options: ImageUploadOptions): Promise<File> {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        const { maxWidth = 1920, maxHeight = 1080 } = options;

        // Calculate new dimensions
        let { width, height } = img;
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }

        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              resolve(file);
            }
          },
          file.type,
          IMAGE_CONFIG.QUALITY
        );
      };

      img.onerror = () => resolve(file);
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Delete image from Supabase
   */
  async deleteImage(url: string): Promise<boolean> {
    if (!this.isAuthenticated || !this.supabaseClient) {
      return false;
    }

    try {
      // Extract path from URL
      const urlParts = url.split('/');
      const path = urlParts.slice(-2).join('/'); // user_id/filename

      const { error } = await this.supabaseClient.storage
        .from(IMAGE_CONFIG.BUCKET_NAME)
        .remove([path]);

      if (error) {
        safeConsole.error('Delete image error:', error);
        return false;
      }

      return true;
    } catch (error) {
      safeConsole.error('Delete image failed:', error);
      return false;
    }
  }

  /**
   * List user images
   */
  async listImages(): Promise<string[]> {
    if (!this.isAuthenticated || !this.supabaseClient || !this.userId) {
      return [];
    }

    try {
      const { data, error } = await this.supabaseClient.storage
        .from(IMAGE_CONFIG.BUCKET_NAME)
        .list(this.userId);

      if (error) {
        safeConsole.error('List images error:', error);
        return [];
      }

      return data.map((file) => {
        if (!this.supabaseClient) return '';
        const { data: urlData } = this.supabaseClient.storage
          .from(IMAGE_CONFIG.BUCKET_NAME)
          .getPublicUrl(`${this.userId}/${file.name}`);
        return urlData.publicUrl;
      });
    } catch (error) {
      safeConsole.error('List images failed:', error);
      return [];
    }
  }
}

/**
 * Create image upload service instance
 */
export const createImageUploadService = (
  supabaseClient: SupabaseClient | null,
  userId: string | null
): ImageUploadService => {
  return new ImageUploadService(supabaseClient, userId);
};
