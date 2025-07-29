/**
 * @fileoverview Service Worker management hook
 * @author Axel Modra
 */

import { useCallback, useEffect, useState } from 'react';

/**
 * Service Worker state interface
 */
export interface ServiceWorkerState {
  isSupported: boolean;
  isRegistered: boolean;
  isInstalling: boolean;
  isWaiting: boolean;
  isActive: boolean;
  needsRefresh: boolean;
  error: string | null;
}

/**
 * Service Worker hook return interface
 */
export interface UseServiceWorkerReturn extends ServiceWorkerState {
  register: () => Promise<void>;
  update: () => Promise<void>;
  skipWaiting: () => void;
  cacheFile: (url: string, content: string) => void;
  clearCache: (cacheName?: string) => void;
}

/**
 * Hook for managing Service Worker
 */
export const useServiceWorker = (): UseServiceWorkerReturn => {
  const [state, setState] = useState<ServiceWorkerState>({
    isSupported: false,
    isRegistered: false,
    isInstalling: false,
    isWaiting: false,
    isActive: false,
    needsRefresh: false,
    error: null,
  });

  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  // Check if Service Worker is supported
  useEffect(() => {
    const isSupported = 'serviceWorker' in navigator;
    setState((prev) => ({ ...prev, isSupported }));

    if (isSupported) {
      import('@/utils/console').then(({ safeConsole }) => {
        safeConsole.dev('Service Worker: Supported');
      });
    } else {
      import('@/utils/console').then(({ safeConsole }) => {
        safeConsole.dev('Service Worker: Not supported');
      });
    }
  }, []);

  // Register Service Worker
  const register = useCallback(async (): Promise<void> => {
    if (!state.isSupported) {
      import('@/utils/console').then(({ safeConsole }) => {
        safeConsole.warn('Service Worker: Not supported');
      });
      return;
    }

    try {
      import('@/utils/console').then(({ safeConsole }) => {
        safeConsole.dev('Service Worker: Registering...');
      });
      setState((prev) => ({ ...prev, isInstalling: true, error: null }));

      const reg = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      });

      setRegistration(reg);

      setState((prev) => ({
        ...prev,
        isRegistered: true,
        isInstalling: false,
        isActive: !!reg.active,
        isWaiting: !!reg.waiting,
      }));

      import('@/utils/console').then(({ safeConsole }) => {
        safeConsole.dev('Service Worker: Registered successfully');
      });

      // Listen for updates
      reg.addEventListener('updatefound', () => {
        import('@/utils/console').then(({ safeConsole }) => {
          safeConsole.dev('Service Worker: Update found');
        });
        setState((prev) => ({ ...prev, isInstalling: true }));

        const newWorker = reg.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed') {
              setState((prev) => ({
                ...prev,
                isInstalling: false,
                isWaiting: true,
                needsRefresh: true,
              }));
              import('@/utils/console').then(({ safeConsole }) => {
                safeConsole.dev('Service Worker: New version available');
              });
            }
          });
        }
      });
    } catch (error) {
      import('@/utils/console').then(({ safeConsole }) => {
        safeConsole.error('Service Worker: Registration failed', error);
      });
      setState((prev) => ({
        ...prev,
        isInstalling: false,
        error: error instanceof Error ? error.message : 'Registration failed',
      }));
    }
  }, [state.isSupported]);

  // Update Service Worker
  const update = useCallback(async (): Promise<void> => {
    if (!registration) {
      import('@/utils/console').then(({ safeConsole }) => {
        safeConsole.warn('Service Worker: No registration found');
      });
      return;
    }

    try {
      import('@/utils/console').then(({ safeConsole }) => {
        safeConsole.dev('Service Worker: Checking for updates...');
      });
      await registration.update();
    } catch (error) {
      import('@/utils/console').then(({ safeConsole }) => {
        safeConsole.error('Service Worker: Update failed', error);
      });
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Update failed',
      }));
    }
  }, [registration]);

  // Skip waiting and activate new Service Worker
  const skipWaiting = useCallback((): void => {
    if (!registration?.waiting) {
      import('@/utils/console').then(({ safeConsole }) => {
        safeConsole.warn('Service Worker: No waiting worker found');
      });
      return;
    }

    import('@/utils/console').then(({ safeConsole }) => {
      safeConsole.dev('Service Worker: Skipping waiting...');
    });
    registration.waiting.postMessage({ type: 'SKIP_WAITING' });

    // Listen for controlling change
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      import('@/utils/console').then(({ safeConsole }) => {
        safeConsole.dev('Service Worker: Controller changed, reloading...');
      });
      window.location.reload();
    });
  }, [registration]);

  // Cache a file for offline access
  const cacheFile = useCallback(
    (url: string, content: string): void => {
      if (!registration?.active) {
        import('@/utils/console').then(({ safeConsole }) => {
          safeConsole.warn('Service Worker: No active worker found');
        });
        return;
      }

      import('@/utils/console').then(({ safeConsole }) => {
        safeConsole.dev('Service Worker: Caching file', url);
      });
      registration.active.postMessage({
        type: 'CACHE_FILE',
        data: { url, content },
      });
    },
    [registration]
  );

  // Clear cache
  const clearCache = useCallback(
    (cacheName?: string): void => {
      if (!registration?.active) {
        import('@/utils/console').then(({ safeConsole }) => {
          safeConsole.warn('Service Worker: No active worker found');
        });
        return;
      }

      import('@/utils/console').then(({ safeConsole }) => {
        safeConsole.dev('Service Worker: Clearing cache', cacheName || 'all');
      });
      registration.active.postMessage({
        type: 'CLEAR_CACHE',
        data: { cacheName },
      });
    },
    [registration]
  );

  // Listen for messages from Service Worker
  useEffect(() => {
    if (!state.isSupported) return;

    const handleMessage = (event: MessageEvent) => {
      const { type, data } = event.data;

      switch (type) {
        case 'SYNC_COMPLETE':
          import('@/utils/console').then(({ safeConsole }) => {
            safeConsole.dev('Service Worker: Sync complete', data);
          });
          // Handle sync completion
          break;

        case 'CACHE_UPDATED':
          import('@/utils/console').then(({ safeConsole }) => {
            safeConsole.dev('Service Worker: Cache updated', data);
          });
          break;

        default:
          import('@/utils/console').then(({ safeConsole }) => {
            safeConsole.dev('Service Worker: Unknown message', type, data);
          });
      }
    };

    navigator.serviceWorker.addEventListener('message', handleMessage);

    return () => {
      navigator.serviceWorker.removeEventListener('message', handleMessage);
    };
  }, [state.isSupported]);

  // Auto-register on mount
  useEffect(() => {
    if (state.isSupported && !state.isRegistered) {
      // Small delay to ensure app is loaded
      const timer = setTimeout(() => {
        register();
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [state.isSupported, state.isRegistered, register]);

  return {
    ...state,
    register,
    update,
    skipWaiting,
    cacheFile,
    clearCache,
  };
};

/**
 * Hook for Service Worker update notifications
 */
export const useServiceWorkerUpdate = () => {
  const { needsRefresh, skipWaiting } = useServiceWorker();
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);

  useEffect(() => {
    if (needsRefresh) {
      setShowUpdatePrompt(true);
    }
  }, [needsRefresh]);

  const acceptUpdate = useCallback(() => {
    setShowUpdatePrompt(false);
    skipWaiting();
  }, [skipWaiting]);

  const dismissUpdate = useCallback(() => {
    setShowUpdatePrompt(false);
  }, []);

  return {
    showUpdatePrompt,
    acceptUpdate,
    dismissUpdate,
  };
};

export default useServiceWorker;
