/**
 * @fileoverview Settings types and interfaces
 * @author Axel Modra
 */

export type {
  AccountActions,
  AccountInfo,
  AccountState,
  UseAccountReturn,
} from './account';

// Re-export all settings types
export type {
  AppPreferences,
  SettingsActions,
  SettingsState,
  UseSettingsReturn,
} from './settings';
export type {
  StorageActions,
  StorageInfo,
  StorageState,
  UseStorageReturn,
} from './storage';
export type { SettingsTab, TabConfig } from './tabs';
