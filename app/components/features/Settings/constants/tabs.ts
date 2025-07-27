/**
 * @fileoverview Settings tabs configuration
 * @author Axel Modra
 */

import { Database, Palette, Type, User, Zap } from 'lucide-react';
import type { SettingsTab, TabConfig } from '../types/tabs';

/**
 * Default active tab
 */
export const DEFAULT_TAB: SettingsTab = 'appearance';

/**
 * Settings tabs configuration
 */
export const TABS_CONFIG: TabConfig[] = [
  {
    id: 'appearance',
    label: 'Appearance',
    icon: Palette,
    description: 'Customize the visual appearance of your editor',
  },
  {
    id: 'editor',
    label: 'Editor',
    icon: Type,
    description: 'Configure your writing experience and editor behavior',
  },
  {
    id: 'behavior',
    label: 'Behavior',
    icon: Zap,
    description: 'Customize application behavior and interactions',
    disabled: true, // Coming soon
  },
  {
    id: 'storage',
    label: 'Storage',
    icon: Database,
    description: 'Manage your local and cloud storage settings',
  },
  {
    id: 'account',
    label: 'Account',
    icon: User,
    description: 'Manage your account details and preferences',
  },
];
