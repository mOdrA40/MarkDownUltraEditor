/**
 * @fileoverview React hook for image upload functionality
 * @author Axel Modra
 */

import { useAuth } from "@clerk/react-router";
import { useCallback, useState } from "react";
import { useToast } from "@/hooks/core/useToast";
import { createAuthenticatedSupabaseClient } from "@/lib/supabase";
import {
  createImageUploadService,
  type ImageUploadOptions,
  type ImageUploadResult,
} from "@/services/imageUploadService";
import { safeConsole } from "@/utils/console";

export interface UseImageUploadReturn {
  uploadImage: (
    file: File,
    options?: ImageUploadOptions
  ) => Promise<ImageUploadResult>;
  uploadFromClipboard: (
    clipboardData: DataTransfer
  ) => Promise<ImageUploadResult | null>;
  uploadFromDrop: (
    dataTransfer: DataTransfer
  ) => Promise<ImageUploadResult | null>;
  isUploading: boolean;
  error: string | null;
}

/**
 * Hook for image upload functionality
 */
export const useImageUpload = (): UseImageUploadReturn => {
  const { isSignedIn, userId, getToken } = useAuth();
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Get image upload service
   */
  const getUploadService = useCallback(async () => {
    let supabaseClient = null;
    let currentUserId = null;

    if (isSignedIn && userId) {
      try {
        // NEW: Use native third-party auth integration (no template needed)
        const token = await getToken();
        if (token) {
          supabaseClient = createAuthenticatedSupabaseClient(token);
          currentUserId = userId;
        }
      } catch (tokenError) {
        safeConsole.log(
          "Error getting token, using base64 fallback:",
          tokenError
        );
      }
    }

    return createImageUploadService(supabaseClient, currentUserId);
  }, [isSignedIn, userId, getToken]);

  /**
   * Upload single image file
   */
  const uploadImage = useCallback(
    async (
      file: File,
      options: ImageUploadOptions = {}
    ): Promise<ImageUploadResult> => {
      setIsUploading(true);
      setError(null);

      try {
        const uploadService = await getUploadService();
        const result = await uploadService.uploadImage(file, {
          compress: true,
          maxWidth: 1920,
          maxHeight: 1080,
          ...options,
        });

        if (result.success) {
          toast({
            title: "Image Uploaded",
            description: `Image uploaded successfully${
              result.isBase64 ? " (stored locally)" : " (stored in cloud)"
            }`,
          });
        } else {
          setError(result.error || "Upload failed");
          toast({
            title: "Upload Failed",
            description: result.error || "Failed to upload image",
            variant: "destructive",
          });
        }

        return result;
      } catch (uploadError) {
        const errorMessage =
          uploadError instanceof Error ? uploadError.message : "Upload failed";
        setError(errorMessage);
        toast({
          title: "Upload Error",
          description: errorMessage,
          variant: "destructive",
        });
        return { success: false, error: errorMessage };
      } finally {
        setIsUploading(false);
      }
    },
    [getUploadService, toast]
  );

  /**
   * Upload image from clipboard paste
   */
  const uploadFromClipboard = useCallback(
    async (clipboardData: DataTransfer): Promise<ImageUploadResult | null> => {
      const items = Array.from(clipboardData.items);
      const imageItem = items.find((item) => item.type.startsWith("image/"));

      if (!imageItem) {
        return null;
      }

      const file = imageItem.getAsFile();
      if (!file) {
        return null;
      }

      safeConsole.log("Uploading image from clipboard:", file.name);
      return await uploadImage(file);
    },
    [uploadImage]
  );

  /**
   * Upload image from drag & drop
   */
  const uploadFromDrop = useCallback(
    async (dataTransfer: DataTransfer): Promise<ImageUploadResult | null> => {
      const files = Array.from(dataTransfer.files);
      const imageFile = files.find((file) => file.type.startsWith("image/"));

      if (!imageFile) {
        return null;
      }

      safeConsole.log("Uploading image from drop:", imageFile.name);
      return await uploadImage(imageFile);
    },
    [uploadImage]
  );

  return {
    uploadImage,
    uploadFromClipboard,
    uploadFromDrop,
    isUploading,
    error,
  };
};
