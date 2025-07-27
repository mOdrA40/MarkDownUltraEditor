/**
 * @fileoverview Storage management types
 * @author Axel Modra
 */

/**
 * Storage information interface
 */
export interface StorageInfo {
  type: 'local' | 'cloud';
  used: string;
  total?: string;
  percentage: number;
  available: boolean;
}

/**
 * Storage state interface
 */
export interface StorageState {
  localStorage: StorageInfo;
  cloudStorage: StorageInfo | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Storage actions interface
 */
export interface StorageActions {
  clearCache: () => Promise<void>;
  exportData: () => Promise<void>;
  syncData: () => Promise<void>;
  refreshStorageInfo: () => Promise<void>;
}

/**
 * Combined storage hook return type
 */
export interface UseStorageReturn {
  state: StorageState;
  actions: StorageActions;
}
