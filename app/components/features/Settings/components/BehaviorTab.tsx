
import type React from 'react';
import { memo } from 'react';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * Behavior settings tab component (placeholder for future features)
 */
export const BehaviorTab: React.FC = memo(() => {
  return (
    <Card>
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="text-lg sm:text-xl">Behavior Settings</CardTitle>
        <CardDescription className="text-sm">Coming soon...</CardDescription>
      </CardHeader>
    </Card>
  );
});

BehaviorTab.displayName = 'BehaviorTab';
