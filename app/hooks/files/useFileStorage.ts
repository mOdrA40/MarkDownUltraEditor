import { useAuth } from "@clerk/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
import {
  createFileOperationError,
  FileOperationErrorCode,
  parseFileOperationError,
} from "@/utils/fileOperationErrors";

export interface UseFileStorageReturn {
  storageService: FileStorageService | null;

  // File operations
  files: FileData[];
  isLoadingFiles: boolean;
  saveFile: (file: FileData) => Promise<FileData>;
  loadFile: (identifier: string) => Promise<FileData | null>;
  deleteFile: (identifier: string) => Promise<void>;

  storageInfo: StorageInfo | null;
  isLoadingStorageInfo: boolean;

  exportAllFiles: () => Promise<void>;
  refreshFiles: () => void;

  isAuthenticated: boolean;
  isInitialized: boolean;
  isAuthenticationComplete: boolean;
  isReadyToRender: boolean;
  error: string | null;
}

export const useFileStorage = (): UseFileStorageReturn => {
  const { isSignedIn, userId, getToken } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [storageService, setStorageService] =
    useState<FileStorageService | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticationComplete, setIsAuthenticationComplete] =
    useState(false);
  const [isClerkStable, setIsClerkStable] = useState(false);

  useEffect(() => {
    // Don't initialize anything if Clerk auth state is still undefined
    if (isSignedIn === undefined) {
      safeConsole.log("⏳ Waiting for Clerk auth state to stabilize...");
      return;
    }

    const initializeStorageService = async () => {
      try {
        safeConsole.log("🔄 Initializing file storage service...");
        safeConsole.log("📊 Authentication state:", {
          isSignedIn,
          userId: userId ? `✓ ${userId.substring(0, 8)}...` : "✗",
          getToken: typeof getToken,
        });
        setError(null);
        setIsInitialized(false);
        setIsAuthenticationComplete(false);
        setIsClerkStable(true);

        await new Promise((resolve) => setTimeout(resolve, 500));

        let supabaseClient = null;
        let currentUserId = null;

        if (isSignedIn && userId) {
          safeConsole.log(
            "🔐 User is signed in, attempting cloud storage setup"
          );
          let retryCount = 0;
          const maxRetries = 3;

          while (retryCount < maxRetries) {
            try {
              safeConsole.log(
                `🔄 Authentication attempt ${retryCount + 1}/${maxRetries}`
              );

              const token = await getToken();
              safeConsole.log(
                "🎫 Token status:",
                token
                  ? `✓ Available (${token.substring(0, 20)}...)`
                  : "✗ Not available"
              );

              if (!token) {
                throw new Error("No authentication token available");
              }

              supabaseClient = createClerkSupabaseClient(getToken);
              currentUserId = userId;

              safeConsole.log("🌐 Testing Supabase connection...");
              const testQuery = (await Promise.race([
                supabaseClient.from("user_files").select("id").limit(1),
                new Promise((_, reject) =>
                  setTimeout(
                    () => reject(new Error("Connection timeout")),
                    10000
                  )
                ),
              ])) as any;

              if (testQuery.error && testQuery.error.code !== "PGRST116") {
                safeConsole.error("🚨 Supabase test query error:", {
                  error: testQuery.error,
                  code: testQuery.error.code,
                  message: testQuery.error.message,
                });
                throw testQuery.error;
              }

              safeConsole.log("✅ Cloud storage authentication successful!");
              safeConsole.log("📊 Final service config:", {
                hasSupabaseClient: !!supabaseClient,
                userId: currentUserId?.substring(0, 8) + "...",
              });
              break; // Success
            } catch (tokenError: unknown) {
              retryCount++;
              const errorMessage =
                tokenError instanceof Error
                  ? tokenError.message
                  : String(tokenError);
              safeConsole.error(
                `❌ Authentication attempt ${retryCount} failed:`,
                {
                  error: tokenError,
                  message: errorMessage,
                  code:
                    tokenError instanceof Error
                      ? (tokenError as any).code
                      : undefined,
                }
              );

              if (retryCount >= maxRetries) {
                safeConsole.error(
                  "💥 Max retries exceeded, using local storage as fallback"
                );
                supabaseClient = null;
                currentUserId = null;
                setError(`Authentication failed: ${errorMessage}`);
                break;
              } else {
                safeConsole.log(`⏳ Retrying in ${retryCount} seconds...`);
                await new Promise((resolve) =>
                  setTimeout(resolve, 1000 * retryCount)
                );
              }
            }
          }
        } else {
          safeConsole.log("👤 User not signed in, using local storage");
        }

        const service = createFileStorageService(supabaseClient, currentUserId);
        safeConsole.log("📦 Storage service created:", {
          hasSupabaseClient: !!supabaseClient,
          hasUserId: !!currentUserId,
          serviceType:
            service && supabaseClient && currentUserId ? "cloud" : "local",
        });

        setStorageService(service);

        // Invalidate all related queries when service changes
        queryClient.invalidateQueries({
          queryKey: queryKeys.storage.info(userId || "anonymous"),
        });
        queryClient.invalidateQueries({
          queryKey: queryKeys.files.list(userId || "anonymous"),
        });

        // Run cleanup to remove duplicate files from localStorage
        if (service && "cleanupLocalStorage" in service) {
          (
            service as { cleanupLocalStorage: () => void }
          ).cleanupLocalStorage();
        }

        await new Promise((resolve) => setTimeout(resolve, 300));

        setIsAuthenticationComplete(true);
        setIsInitialized(true);
        safeConsole.log("✅ File storage service fully initialized");
      } catch (initError) {
        safeConsole.error("Error initializing storage service:", initError);
        setError("Failed to initialize storage service");

        if (!isSignedIn) {
          const fallbackService = createFileStorageService(null, null);
          setStorageService(fallbackService);
        }
        setIsInitialized(true);
      }
    };

    initializeStorageService();
  }, [isSignedIn, userId, getToken]);

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
    enabled:
      isInitialized &&
      !!storageService &&
      isSignedIn !== undefined &&
      isAuthenticationComplete,
    staleTime: 2 * 60 * 1000, // 2 minutes - faster refresh for file changes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnMount: false, // Only refetch if stale
    refetchOnWindowFocus: false,
    retry: 2,
    // Add background refetch for better UX
    refetchInterval: 5 * 60 * 1000, // Background refresh every 5 minutes
  });

  const { data: storageInfo = null, isLoading: isLoadingStorageInfo } =
    useQuery({
      queryKey: queryKeys.storage.info(userId || "anonymous"),
      queryFn: async () => {
        if (!storageService) {
          safeConsole.log("⚠️ Storage service not available for storage info");
          return null;
        }

        safeConsole.log("🔍 Getting storage info from service...");
        safeConsole.log("📊 Service auth state:", {
          isAuthenticated: (storageService as any).isAuthenticated,
          hasSupabaseClient: !!(storageService as any).supabaseClient,
          hasUserId: !!(storageService as any).userId,
        });

        try {
          const info = await storageService.getStorageInfoAsync();
          safeConsole.log("✅ Storage info received:", {
            ...info,
            storageType: info?.storageType,
            isAuthenticated: info?.isAuthenticated,
            totalFiles: info?.totalFiles,
          });
          return info;
        } catch (error) {
          safeConsole.error("❌ Error getting async storage info:", error);
          try {
            const fallbackInfo = storageService.getStorageInfo();
            safeConsole.log("🔄 Using fallback storage info:", {
              ...fallbackInfo,
              storageType: fallbackInfo?.storageType,
              isAuthenticated: fallbackInfo?.isAuthenticated,
            });
            return fallbackInfo;
          } catch (fallbackError) {
            safeConsole.error(
              "💥 Fallback storage info also failed:",
              fallbackError
            );
            return null;
          }
        }
      },
      enabled:
        isInitialized &&
        !!storageService &&
        !error &&
        isSignedIn !== undefined &&
        isAuthenticationComplete,
      staleTime: 1 * 60 * 1000, // 1 minute for more frequent updates during debugging
      gcTime: 5 * 60 * 1000,
      refetchOnMount: true,
      refetchOnWindowFocus: false,
      retry: 1,
    });

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

      invalidateQueries.files.list(userId || "anonymous");
      if (savedFile.content.length > 10000) {
        invalidateQueries.storage.info(userId || "anonymous");
      }
    },
    onError: (error: unknown) => {
      safeConsole.error("Error saving file:", error);
      const fileError = parseFileOperationError(error);
      toast({
        title: "Save Failed",
        description: fileError.userMessage,
        variant: "destructive",
      });
    },
  });

  // Delete file mutation
  const deleteFileMutation = useMutation<
    void,
    Error,
    string,
    { previousFiles: FileData[] | undefined }
  >({
    mutationFn: async (identifier: string) => {
      if (!storageService) {
        throw new Error("Storage service not initialized");
      }
      await storageService.delete(identifier);
    },
    onMutate: async (identifier: string) => {
      await queryClient.cancelQueries({ queryKey: [queryKeys.files] });

      const previousFiles = queryClient.getQueryData<FileData[]>([
        queryKeys.files,
      ]);

      queryClient.setQueryData<FileData[]>([queryKeys.files], (old) =>
        old ? old.filter((file) => file.id !== identifier) : []
      );
      return { previousFiles };
    },
    onError: (error, _newFile, context) => {
      if (context?.previousFiles) {
        queryClient.setQueryData([queryKeys.files], context.previousFiles);
      }
      const fileError = parseFileOperationError(error);
      toast({
        title: "Delete Failed",
        description: fileError.userMessage,
        variant: "destructive",
      });
    },
    onSettled: () => {
      batchInvalidateQueries.fileOperations(userId || "anonymous");
    },
  });

  const loadFile = useCallback(
    async (identifier: string): Promise<FileData | null> => {
      if (!storageService) {
        const error = createFileOperationError(
          FileOperationErrorCode.STORAGE_NOT_INITIALIZED,
          "Storage service not initialized"
        );
        toast({
          title: "Service Not Ready",
          description: error.userMessage,
          variant: "destructive",
        });
        return null;
      }

      if (!isInitialized) {
        const error = createFileOperationError(
          FileOperationErrorCode.STORAGE_NOT_INITIALIZED,
          "Storage service not fully initialized"
        );
        toast({
          title: "Service Not Ready",
          description: error.userMessage,
          variant: "destructive",
        });
        return null;
      }

      // Check if file is already cached in query client
      const cachedFile = queryClient.getQueryData<FileData>([
        "file",
        userId || "anonymous",
        identifier,
      ]);

      if (cachedFile) {
        safeConsole.log("File loaded from cache:", cachedFile.title);
        return cachedFile;
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
          if (!file.content || file.content.trim().length === 0) {
            safeConsole.log(
              "Warning: Loaded file has empty content:",
              file.title
            );
          }

          // Cache the loaded file for faster subsequent access
          queryClient.setQueryData(
            ["file", userId || "anonymous", identifier],
            file,
            {
              updatedAt: Date.now(),
            }
          );
        } else {
          safeConsole.log("File not found:", identifier);
          if (isSignedIn) {
            const error = createFileOperationError(
              FileOperationErrorCode.FILE_NOT_FOUND,
              "File not found in cloud storage"
            );
            toast({
              title: "File Not Found",
              description: error.userMessage,
              variant: "destructive",
            });
          }
        }

        return file;
      } catch (error) {
        safeConsole.error("Error loading file:", error);
        const fileError = parseFileOperationError(error);
        toast({
          title: "Load Failed",
          description: fileError.userMessage,
          variant: "destructive",
        });
        return null;
      }
    },
    [storageService, toast, isInitialized, isSignedIn, queryClient, userId]
  );

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

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      link.download = `markdown-export-${timestamp}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Export Successful",
        description: "All files have been exported.",
      });
    } catch (error) {
      safeConsole.error("Error exporting files:", error);
      toast({
        title: "Export Failed",
        description: "An error occurred while exporting your files.",
        variant: "destructive",
      });
    }
  }, [storageService, toast]);

  const isReadyToRender = useMemo(() => {
    return (
      isSignedIn !== undefined &&
      isInitialized &&
      isAuthenticationComplete &&
      !isLoadingStorageInfo &&
      !!storageInfo
    );
  }, [
    isSignedIn,
    isInitialized,
    isAuthenticationComplete,
    isLoadingStorageInfo,
    storageInfo,
  ]);

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
      isAuthenticationComplete,
      isReadyToRender,
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
      isAuthenticationComplete,
      isReadyToRender,
      error,
    ]
  );

  return returnValue;
};
