import { Copy, Download, Edit, MoreVertical, Trash2 } from 'lucide-react';
import type React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  type DropdownPositioning,
  useDropdownPositioning,
} from '@/hooks/ui/useDropdownPositioning';
import { useGridDropdownPositioning } from '@/hooks/ui/useGridDropdownPositioning';
import type { FileData } from '@/lib/supabase';

export type FileDropdownViewType = 'grid' | 'list' | 'table' | 'virtualized';
export interface FileDropdownMenuProps {
  file: FileData;
  viewType: FileDropdownViewType;
  onOpen: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onExport: () => void;
  positioning?: DropdownPositioning;
  className?: string;
  stopPropagationOnTrigger?: boolean;
}

export const FileDropdownMenu: React.FC<FileDropdownMenuProps> = ({
  file: _file,
  viewType,
  onOpen,
  onDelete,
  onDuplicate,
  onExport,
  positioning,
  className = '',
  stopPropagationOnTrigger = false,
}) => {
  const defaultPositioning = useDropdownPositioning();
  const gridPositioning = useGridDropdownPositioning();

  const dropdownPositioning =
    positioning || (viewType === 'grid' ? gridPositioning.positioning : defaultPositioning);

  const getViewSpecificClasses = () => {
    const baseClasses = 'z-50 min-w-[140px] max-w-[200px]';
    const viewClasses = `dropdown-${viewType}-view`;
    return `${baseClasses} ${viewClasses} ${className}`;
  };

  const handleTriggerClick = (e: React.MouseEvent) => {
    if (stopPropagationOnTrigger) {
      e.stopPropagation();
    }
  };

  const handleMenuItemClick = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          ref={viewType === 'grid' ? gridPositioning.elementRef : undefined}
          variant="ghost"
          size="sm"
          className={`h-8 w-8 p-0 flex-shrink-0 ${
            viewType === 'list' || viewType === 'virtualized' ? 'dropdown-trigger-mobile' : ''
          }`}
          onClick={handleTriggerClick}
        >
          <MoreVertical className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align={dropdownPositioning.align}
        side={dropdownPositioning.side}
        sideOffset={dropdownPositioning.sideOffset}
        alignOffset={dropdownPositioning.alignOffset}
        className={getViewSpecificClasses()}
        onCloseAutoFocus={(e) => e.preventDefault()}
        avoidCollisions={true}
        collisionPadding={16}
        data-view-type={viewType}
        data-align={dropdownPositioning.align}
        data-side={dropdownPositioning.side}
      >
        <DropdownMenuItem onClick={(e) => handleMenuItemClick(e, onOpen)}>
          <Edit className="mr-2 h-4 w-4" />
          Open
        </DropdownMenuItem>

        <DropdownMenuItem onClick={(e) => handleMenuItemClick(e, onDuplicate)}>
          <Copy className="mr-2 h-4 w-4" />
          Duplicate
        </DropdownMenuItem>

        <DropdownMenuItem onClick={(e) => handleMenuItemClick(e, onExport)}>
          <Download className="mr-2 h-4 w-4" />
          Export
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={(e) => handleMenuItemClick(e, onDelete)}
          className="text-destructive"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
