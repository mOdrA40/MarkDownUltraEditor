/**
 * @fileoverview Image Link Button for URL-based image insertion
 * @author Axel Modra
 */

import { ImageIcon } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ImageLinkDialog } from './ImageLinkDialog';

interface ImageLinkButtonProps {
  onImageInsert: (imageUrl: string, altText?: string) => void;
  disabled?: boolean;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

/**
 * Image link button component for URL-based image insertion
 */
export const ImageUploadButton: React.FC<ImageLinkButtonProps> = ({
  onImageInsert,
  disabled = false,
  variant = 'outline',
  size = 'sm',
  showLabel = true,
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  /**
   * Handle button click to open dialog
   */
  const handleClick = () => {
    setIsDialogOpen(true);
  };

  const buttonSize = size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'default';

  return (
    <>
      <Button
        variant={variant}
        size={buttonSize}
        onClick={handleClick}
        disabled={disabled}
        className="flex items-center gap-2 transition-all duration-200"
        title="Insert Image from URL"
      >
        <ImageIcon className="h-4 w-4" />
        {showLabel && <span className="hidden sm:inline">Image</span>}
      </Button>

      <ImageLinkDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onImageInsert={onImageInsert}
      />
    </>
  );
};
