/**
 * @fileoverview Settings tabs navigation component
 * @author Axel Modra
 */

import type React from 'react';
import { memo } from 'react';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TABS_CONFIG } from '../constants';

interface SettingsTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

/**
 * Settings tabs navigation component
 */
export const SettingsTabs: React.FC<SettingsTabsProps> = memo(
  ({ activeTab: _activeTab, onTabChange }) => {
    return (
      <div className="w-full overflow-x-auto">
        <TabsList className="flex w-full min-w-max sm:grid sm:grid-cols-5 gap-1 p-1">
          {TABS_CONFIG.map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              disabled={tab.disabled}
              className="flex items-center gap-2 whitespace-nowrap px-3 sm:px-4"
              onClick={() => !tab.disabled && onTabChange(tab.id)}
            >
              <tab.icon className="w-4 h-4" />
              <span className="text-xs sm:text-sm">{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>
      </div>
    );
  }
);

SettingsTabs.displayName = 'SettingsTabs';
