/**
 * @fileoverview Hook for detecting CSP restrictions and providing user guidance
 * @author Axel Modra
 */

import React from "react";
import { safeConsole } from "@/utils/console";

const checkCSPImageSupport = async (): Promise<boolean> => {
  try {
    const testImg = new Image();
    testImg.src = "https://picsum.photos/1/1";
    return new Promise((resolve) => {
      testImg.onload = () => resolve(true);
      testImg.onerror = () => resolve(false);
      setTimeout(() => resolve(false), 3000);
    });
  } catch {
    return false;
  }
};

interface CSPDetectionResult {
  isCSPBlocking: boolean;
  isChecking: boolean;
  hasChecked: boolean;
  retryCheck: () => void;
  getRecommendations: () => string[];
}

/**
 * Hook to detect if CSP is blocking external images
 */
export const useCSPDetection = (): CSPDetectionResult => {
  const [isCSPBlocking, setIsCSPBlocking] = React.useState(false);
  const [isChecking, setIsChecking] = React.useState(false);
  const [hasChecked, setHasChecked] = React.useState(false);

  const checkCSP = React.useCallback(async () => {
    setIsChecking(true);

    try {
      const isSupported = await checkCSPImageSupport();
      setIsCSPBlocking(!isSupported);
      setHasChecked(true);

      if (!isSupported) {
        safeConsole.warn("CSP is blocking external images");
      } else {
        safeConsole.log("External images are loading correctly");
      }
    } catch (error) {
      safeConsole.error("Error checking CSP support:", error);
      setIsCSPBlocking(true);
      setHasChecked(true);
    } finally {
      setIsChecking(false);
    }
  }, []);

  const retryCheck = React.useCallback(() => {
    setHasChecked(false);
    checkCSP();
  }, [checkCSP]);

  const getRecommendations = React.useCallback((): string[] => {
    if (!isCSPBlocking) return [];

    return [
      "Use images from trusted domains (Unsplash, Pixabay, GitHub, etc.)",
      "Convert images to base64 data URLs for small images",
      "Upload images to your own domain or CDN",
      "Use placeholder images for development",
      "Consider implementing an image proxy service",
    ];
  }, [isCSPBlocking]);

  // Check CSP on mount
  React.useEffect(() => {
    if (!hasChecked) {
      checkCSP();
    }
  }, [checkCSP, hasChecked]);

  return {
    isCSPBlocking,
    isChecking,
    hasChecked,
    retryCheck,
    getRecommendations,
  };
};

/**
 * Hook for tracking image load failures
 */
export const useImageFailureTracking = () => {
  const [failedImages, setFailedImages] = React.useState<string[]>([]);
  const [failureReasons, setFailureReasons] = React.useState<
    Record<string, string>
  >({});

  const trackFailure = React.useCallback(
    (url: string, reason = "Unknown error") => {
      setFailedImages((prev) => {
        if (!prev.includes(url)) {
          return [...prev, url];
        }
        return prev;
      });

      setFailureReasons((prev) => ({
        ...prev,
        [url]: reason,
      }));

      safeConsole.warn(`Image failed to load: ${url} - ${reason}`);
    },
    []
  );

  const clearFailures = React.useCallback(() => {
    setFailedImages([]);
    setFailureReasons({});
  }, []);

  const getFailureReason = React.useCallback(
    (url: string) => {
      return failureReasons[url] || "Unknown error";
    },
    [failureReasons]
  );

  return {
    failedImages,
    failureReasons,
    trackFailure,
    clearFailures,
    getFailureReason,
    failureCount: failedImages.length,
  };
};

/**
 * Hook for providing CSP-aware image recommendations
 */
export const useImageRecommendations = () => {
  const { isCSPBlocking } = useCSPDetection();

  const getRecommendedImageUrl = React.useCallback(
    (originalUrl: string): string => {
      if (!isCSPBlocking) {
        return originalUrl;
      }

      // Suggest alternatives based on the original URL
      try {
        const url = new URL(originalUrl);
        const domain = url.hostname.toLowerCase();

        // If it's already from a trusted domain, keep it
        const trustedDomains = [
          "picsum.photos",
          "via.placeholder.com",
          "images.unsplash.com",
          "cdn.pixabay.com",
          "raw.githubusercontent.com",
        ];

        if (trustedDomains.some((trusted) => domain.includes(trusted))) {
          return originalUrl;
        }

        // Suggest Picsum as a placeholder
        return `https://picsum.photos/300/200?random=${Math.floor(Math.random() * 1000)}`;
      } catch {
        // If URL is invalid, return a placeholder
        return "https://via.placeholder.com/300x200/cccccc/666666?text=Image+Not+Available";
      }
    },
    [isCSPBlocking]
  );

  const getSuggestedAlternatives = React.useCallback(
    (originalUrl: string): string[] => {
      const alternatives: string[] = [];

      try {
        const url = new URL(originalUrl);
        const filename = url.pathname.split("/").pop() || "image";

        // Suggest various placeholder services
        alternatives.push(
          `https://via.placeholder.com/300x200/cccccc/666666?text=${encodeURIComponent(filename)}`,
          `https://picsum.photos/300/200?random=${Math.floor(Math.random() * 1000)}`,
          `https://placehold.co/300x200/png?text=${encodeURIComponent(filename)}`
        );

        // If it looks like a GitHub image, suggest raw.githubusercontent.com
        if (url.hostname.includes("github.com")) {
          const rawUrl = originalUrl
            .replace("github.com", "raw.githubusercontent.com")
            .replace("/blob/", "/");
          alternatives.unshift(rawUrl);
        }
      } catch {
        // Fallback alternatives
        alternatives.push(
          "https://via.placeholder.com/300x200/cccccc/666666?text=Image+Not+Available",
          "https://picsum.photos/300/200?grayscale"
        );
      }

      return alternatives;
    },
    []
  );

  return {
    isCSPBlocking,
    getRecommendedImageUrl,
    getSuggestedAlternatives,
  };
};

/**
 * Hook for managing image loading states across the app
 */
export const useGlobalImageState = () => {
  const [globalImageStats, setGlobalImageStats] = React.useState({
    totalImages: 0,
    loadedImages: 0,
    failedImages: 0,
    blockedByCSP: 0,
  });

  const updateImageStats = React.useCallback(
    (update: Partial<typeof globalImageStats>) => {
      setGlobalImageStats((prev) => ({
        ...prev,
        ...update,
      }));
    },
    []
  );

  const incrementStat = React.useCallback(
    (stat: keyof typeof globalImageStats) => {
      setGlobalImageStats((prev) => ({
        ...prev,
        [stat]: prev[stat] + 1,
      }));
    },
    []
  );

  const resetStats = React.useCallback(() => {
    setGlobalImageStats({
      totalImages: 0,
      loadedImages: 0,
      failedImages: 0,
      blockedByCSP: 0,
    });
  }, []);

  const getSuccessRate = React.useCallback(() => {
    if (globalImageStats.totalImages === 0) return 0;
    return (globalImageStats.loadedImages / globalImageStats.totalImages) * 100;
  }, [globalImageStats]);

  return {
    globalImageStats,
    updateImageStats,
    incrementStat,
    resetStats,
    getSuccessRate,
  };
};
