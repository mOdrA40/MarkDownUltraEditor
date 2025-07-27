/**
 * @fileoverview Settings tabs types
 * @author Axel Modra
 */

import type { LucideIcon } from 'lucide-react';

/**
 * Settings tab identifier
 */
export type SettingsTab = 'appearance' | 'editor' | 'behavior' | 'storage' | 'account';

/**
 * Tab configuration interface
 */
export interface TabConfig {
  id: SettingsTab;
  label: string;
  icon: LucideIcon;
  description: string;
  disabled?: boolean;
}

/**
 * Tab content props interface
 */
export interface TabContentProps {
  isActive: boolean;
  onTabChange?: (tab: SettingsTab) => void;
}
