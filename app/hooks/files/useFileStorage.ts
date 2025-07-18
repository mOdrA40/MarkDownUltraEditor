/**
 * @fileoverview React hook for file storage operations with Supabase and localStorage
 * @author Axel Modra
 */

import { useAuth } from "@clerk/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useToast } from "@/hooks/core/useToast";
import {
  batchInvalidateQueries,
  invalidateQueries,
  queryKeys,
} from "@/lib/queryClient";
import { createClerkSupabaseClient, type FileData } from "@/lib/supabase";
import {
  createFileStorageService,
  type FileStorageService,
  type StorageInfo,
} from "@/services/fileStorage";
import { safeConsole } from "@/utils/console";

/**
 * Hook return interface
 */
export interface UseFileStorageReturn {
  // Storage service
  storageService: FileStorageService | null;

  // File operations
  files: FileData[];
  isLoadingFiles: boolean;
  saveFile: (file: FileData) => Promise<FileData>;
  loadFile: (identifier: string) => Promise<FileData | null>;
  deleteFile: (identifier: string) => Promise<void>;

  // Storage info
  storageInfo: StorageInfo | null;
  isLoadingStorageInfo: boolean;

  // Utility operations
  exportAllFiles: () => Promise<void>;
  refreshFiles: () => void;

  // State
  isAuthenticated: boolean;
  isInitialized: boolean;
  error: string | null;
}

/**
 * File storage hook with React Query integration
 */
export const useFileStorage = (): UseFileStorageReturn => {
  const { isSignedIn, userId, getToken } = useAuth();
  const { toast } = useToast();
  // Using global queryClient from invalidateQueries helper functions

  const [storageService, setStorageService] =
    useState<FileStorageService | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize storage service with proper race condition handling
  useEffect(() => {
    const initializeStorageService = async () => {
      try {
        safeConsole.log("Initializing file storage service...");
        setError(null);
        setIsInitialized(false); // Ensure we start with false

        let supabaseClient = null;
        let currentUserId = null;

        if (isSignedIn && userId) {
          try {
            // NEW: Use native third-party auth integration with accessToken() function
            safeConsole.log(
              "✓ Initializing authenticated storage with native Third Party Auth"
            );

            // Wait for token to be available
            const token = await getToken();
            if (!token) {
              throw new Error("No authentication token available");
            }

            supabaseClient = createClerkSupabaseClient(getToken);
            currentUserId = userId;

            // Test the connection to ensure it's working
            const testQuery = await supabaseClient
              .from("user_files")
              .select("id")
              .limit(1);

            if (testQuery.error && testQuery.error.code !== "PGRST116") {
              throw testQuery.error;
            }

            safeConsole.log(
              "✓ Authenticated storage service initialized with native integration"
            );
          } catch (tokenError) {
            safeConsole.log(
              "Error setting up authenticated client, falling back to local storage:",
              tokenError
            );
            // Reset to use local storage
            supabaseClient = null;
            currentUserId = null;
          }
        } else {
          safeConsole.log("User not signed in, using local storage");
        }

        const service = createFileStorageService(supabaseClient, currentUserId);

        // Set service first, then mark as initialized
        setStorageService(service);

        // Small delay to ensure service is fully ready
        await new Promise((resolve) => setTimeout(resolve, 100));

        setIsInitialized(true);
        safeConsole.log("File storage service initialized successfully");
      } catch (initError) {
        safeConsole.error("Error initializing storage service:", initError);
        setError("Failed to initialize storage service");

        // Fallback to local storage
        const fallbackService = createFileStorageService(null, null);
        setStorageService(fallbackService);
        setIsInitialized(true);
      }
    };

    initializeStorageService();
  }, [isSignedIn, userId, getToken]);

  // Files list query with optimized keys
  const {
    data: files = [],
    isLoading: isLoadingFiles,
    refetch: refreshFiles,
  } = useQuery<FileData[]>({
    queryKey: queryKeys.files.list(userId || "anonymous"),
    queryFn: async () => {
      if (!storageService) {
        safeConsole.log(
          "Storage service not initialized, returning empty files list"
        );
        return [];
      }

      try {
        safeConsole.log("Fetching files list...");
        const filesList = await storageService.list();
        safeConsole.log(`Fetched ${filesList.length} files`);
        return filesList;
      } catch (error) {
        safeConsole.error("Error fetching files:", error);
        toast({
          title: "Error Loading Files",
          description: "Failed to load your files. Please try again.",
          variant: "destructive",
        });
        return [];
      }
    },
    enabled: isInitialized && !!storageService,
    staleTime: 15 * 60 * 1000, // 15 minutes - better performance
    gcTime: 30 * 60 * 1000, // 30 minutes - better memory management
    refetchOnMount: false, // Only refetch if data is stale
    refetchOnWindowFocus: false, // Prevent unnecessary refetches
  });

  // Storage info query with optimized keys
  const { data: storageInfo = null, isLoading: isLoadingStorageInfo } =
    useQuery({
      queryKey: queryKeys.storage.info(userId || "anonymous"),
      queryFn: async () => {
        if (!storageService) return null;

        try {
          safeConsole.log("Fetching storage info...");
          // Use async method for more accurate data
          const info = await storageService.getStorageInfoAsync();
          safeConsole.log("Storage info:", info);
          return info;
        } catch (error) {
          safeConsole.error("Error getting storage info:", error);
          // Fallback to sync method
          try {
            return storageService.getStorageInfo();
          } catch (fallbackError) {
            safeConsole.error(
              "Error getting fallback storage info:",
              fallbackError
            );
            return null;
          }
        }
      },
      enabled: isInitialized && !!storageService,
      staleTime: 30 * 60 * 1000, // 30 minutes - storage info changes rarely
      gcTime: 60 * 60 * 1000, // 1 hour - keep in cache longer
      refetchOnMount: false, // Only refetch if data is stale
      refetchOnWindowFocus: false, // Prevent unnecessary refetches
    });

  // Save file mutation
  const saveFileMutation = useMutation({
    mutationFn: async (file: FileData) => {
      if (!storageService) {
        throw new Error("Storage service not initialized");
      }

      safeConsole.log("Saving file:", file.title);
      return await storageService.save(file);
    },
    onSuccess: (savedFile) => {
      safeConsole.log("File saved successfully:", savedFile.title);

      // Selective invalidation - only invalidate specific queries instead of all
      invalidateQueries.files.list(userId || "anonymous");
      // Only invalidate storage info if it's likely to have changed significantly
      if (savedFile.content.length > 10000) {
        // Only for large files
        invalidateQueries.storage.info(userId || "anonymous");
      }

      toast({
        title: "File Saved",
        description: `${savedFile.title} has been saved successfully.`,
      });
    },
    onError: (error: unknown) => {
      safeConsole.error("Error saving file:", error);
      const errorObj = error as { message?: string };
      toast({
        title: "Save Failed",
        description:
          errorObj.message || "Failed to save file. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Delete file mutation
  const deleteFileMutation = useMutation({
    mutationFn: async (identifier: string) => {
      if (!storageService) {
        throw new Error("Storage service not initialized");
      }

      safeConsole.log("Deleting file:", identifier);
      await storageService.delete(identifier);
    },
    onSuccess: (_, identifier) => {
      safeConsole.log("File deleted successfully:", identifier);

      // Use batch invalidation for better performance
      batchInvalidateQueries.fileOperations(userId || "anonymous");

      toast({
        title: "File Deleted",
        description: "File has been deleted successfully.",
      });
    },
    onError: (error: unknown) => {
      safeConsole.error("Error deleting file:", error);
      const errorObj = error as { message?: string };
      toast({
        title: "Delete Failed",
        description:
          errorObj.message || "Failed to delete file. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Load file function with improved error handling
  const loadFile = useCallback(
    async (identifier: string): Promise<FileData | null> => {
      if (!storageService) {
        safeConsole.error("Storage service not initialized");
        toast({
          title: "Service Not Ready",
          description:
            "Storage service is still initializing. Please wait a moment.",
          variant: "destructive",
        });
        return null;
      }

      if (!isInitialized) {
        safeConsole.error("Storage service not fully initialized");
        toast({
          title: "Service Not Ready",
          description:
            "Storage service is still initializing. Please wait a moment.",
          variant: "destructive",
        });
        return null;
      }

      try {
        safeConsole.log("Loading file:", identifier);
        safeConsole.log("Storage service authenticated:", isSignedIn);
        safeConsole.log(
          "Storage service type:",
          isSignedIn ? "cloud" : "local"
        );

        const file = await storageService.load(identifier);

        if (file) {
          safeConsole.log(
            "File loaded successfully:",
            file.title,
            "content length:",
            file.content.length
          );
          // Verify content is not empty
          if (!file.content || file.content.trim().length === 0) {
            safeConsole.log(
              "Warning: Loaded file has empty content:",
              file.title
            );
          }
        } else {
          safeConsole.log("File not found:", identifier);
          if (isSignedIn) {
            toast({
              title: "File Not Found",
              description:
                "The requested file could not be found in your cloud storage.",
              variant: "destructive",
            });
          }
        }

        return file;
      } catch (error) {
        safeConsole.error("Error loading file:", error);
        toast({
          title: "Load Failed",
          description: isSignedIn
            ? "Failed to load file from cloud storage. Please check your connection and try again."
            : "Failed to load file from local storage. Please try again.",
          variant: "destructive",
        });
        return null;
      }
    },
    [storageService, toast, isInitialized, isSignedIn]
  );

  // Export all files function
  const exportAllFiles = useCallback(async (): Promise<void> => {
    if (!storageService) {
      toast({
        title: "Export Failed",
        description: "Storage service not initialized.",
        variant: "destructive",
      });
      return;
    }

    try {
      safeConsole.log("Exporting all files...");
      const blob = await storageService.exportAllFiles();

      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `markdown-files-export-${
        new Date().toISOString().split("T")[0]
      }.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      safeConsole.log("Files exported successfully");
      toast({
        title: "Export Complete",
        description: "All files have been exported successfully.",
      });
    } catch (error) {
      safeConsole.error("Error exporting files:", error);
      toast({
        title: "Export Failed",
        description: "Failed to export files. Please try again.",
        variant: "destructive",
      });
    }
  }, [storageService, toast]);

  // Memoized return value
  const returnValue = useMemo(
    (): UseFileStorageReturn => ({
      storageService,
      files,
      isLoadingFiles,
      saveFile: saveFileMutation.mutateAsync,
      loadFile,
      deleteFile: deleteFileMutation.mutateAsync,
      storageInfo,
      isLoadingStorageInfo,
      exportAllFiles,
      refreshFiles,
      isAuthenticated: isSignedIn || false,
      isInitialized,
      error,
    }),
    [
      storageService,
      files,
      isLoadingFiles,
      saveFileMutation.mutateAsync,
      loadFile,
      deleteFileMutation.mutateAsync,
      storageInfo,
      isLoadingStorageInfo,
      exportAllFiles,
      refreshFiles,
      isSignedIn,
      isInitialized,
      error,
    ]
  );

  return returnValue;
};
