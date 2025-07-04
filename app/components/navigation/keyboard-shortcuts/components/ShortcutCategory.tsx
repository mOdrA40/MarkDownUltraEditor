/**
 * Component for displaying shortcut categories
 * Handles grouping shortcuts by category with header and separator
 */

import { Edit3, Eye, FileText, Keyboard, Search, Settings, Type } from 'lucide-react';
import type React from 'react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import type { ShortcutCategoryProps } from '../types/shortcutTypes';
import { ShortcutItem } from './ShortcutItem';

// Icon mapping for categories
const CATEGORY_ICONS = {
  'Text Formatting': Type,
  'View & Navigation': Eye,
  'Search & Navigation': Search,
  'File Operations': FileText,
  Editing: Edit3,
  'Advanced Features': Settings,
  default: Keyboard,
};

export const ShortcutCategory: React.FC<ShortcutCategoryProps> = ({
  category,
  showMacKeys = false,
  index,
  totalCategories,
}) => {
  // Get icon for category
  const IconComponent =
    CATEGORY_ICONS[category.category as keyof typeof CATEGORY_ICONS] || CATEGORY_ICONS.default;

  // Filter enabled items
  const enabledItems = category.items.filter((item) => item.enabled !== false);
  const disabledItems = category.items.filter((item) => item.enabled === false);

  return (
    <div className="space-y-3">
      {/* Category Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <IconComponent className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold text-muted-foreground">{category.category}</h3>

          {/* Item Count Badge */}
          <Badge variant="outline" className="text-xs h-5">
            {category.items.length}
          </Badge>
        </div>

        {/* Platform Indicator */}
        {showMacKeys && (
          <Badge variant="secondary" className="text-xs">
            macOS
          </Badge>
        )}
      </div>

      {/* Shortcuts List */}
      <div className="space-y-1">
        {/* Enabled Items */}
        {enabledItems.map((item, itemIndex) => (
          <ShortcutItem
            key={`enabled-${itemIndex}`}
            item={item}
            showMacKeys={showMacKeys}
            index={itemIndex}
          />
        ))}

        {/* Disabled Items (if any) */}
        {disabledItems.length > 0 && (
          <>
            {enabledItems.length > 0 && (
              <div className="py-1">
                <Separator className="opacity-50" />
              </div>
            )}

            {disabledItems.map((item, itemIndex) => (
              <ShortcutItem
                key={`disabled-${itemIndex}`}
                item={item}
                showMacKeys={showMacKeys}
                index={enabledItems.length + itemIndex}
              />
            ))}
          </>
        )}
      </div>

      {/* Category Separator */}
      {index < totalCategories - 1 && (
        <div className="pt-2">
          <Separator />
        </div>
      )}
    </div>
  );
};
