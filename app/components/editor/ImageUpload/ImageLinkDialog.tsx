/**
 * @fileoverview Image Link Dialog for URL-based image insertion
 * @author Axel Modra
 */

import { ImageIcon, Link } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/core/useToast';

interface ImageLinkDialogProps {
  /** Whether the dialog is open */
  open: boolean;
  /** Callback when dialog should close */
  onOpenChange: (open: boolean) => void;
  /** Callback when image should be inserted */
  onImageInsert: (imageUrl: string, altText?: string) => void;
}

/**
 * Dialog component for inserting images via URL
 */
export const ImageLinkDialog: React.FC<ImageLinkDialogProps> = ({
  open,
  onOpenChange,
  onImageInsert,
}) => {
  const [imageUrl, setImageUrl] = useState('');
  const [altText, setAltText] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const { toast } = useToast();

  /**
   * Validate if URL is a valid image URL
   */
  const isValidImageUrl = (url: string): boolean => {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname.toLowerCase();
      const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];

      // Check for file extensions
      if (validExtensions.some((ext) => pathname.endsWith(ext))) {
        return true;
      }

      // Check for known image hosting services
      const validHosts = [
        'unsplash.com',
        'imgur.com',
        'cloudinary.com',
        'amazonaws.com',
        'picsum.photos',
        'via.placeholder.com',
        'placehold.it',
        'placekitten.com',
        'images.unsplash.com',
        'cdn.pixabay.com',
        'images.pexels.com',
      ];

      return validHosts.some((host) => urlObj.hostname.includes(host));
    } catch {
      return false;
    }
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!imageUrl.trim()) {
      toast({
        title: 'URL Required',
        description: 'Please enter an image URL',
        variant: 'destructive',
      });
      return;
    }

    if (!isValidImageUrl(imageUrl)) {
      toast({
        title: 'Invalid URL',
        description: 'Please enter a valid image URL (jpg, png, gif, webp, svg)',
        variant: 'destructive',
      });
      return;
    }

    setIsValidating(true);

    try {
      // Insert image directly without validation to avoid CSP issues
      const finalAltText = altText.trim() || 'Image';
      const finalImageUrl = imageUrl.trim();

      // Debug log to check what we're sending
      import('@/utils/console').then(({ safeConsole }) => {
        safeConsole.dev('Sending to onImageInsert:', { finalImageUrl, finalAltText });
      });

      onImageInsert(finalImageUrl, finalAltText);
      handleClose();
      // Remove toast notification to prevent spam during auto-save
      setIsValidating(false);
    } catch (_error) {
      setIsValidating(false);
      toast({
        title: 'Error',
        description: 'An error occurred while inserting the image',
        variant: 'destructive',
      });
    }
  };

  /**
   * Handle dialog close
   */
  const handleClose = () => {
    setImageUrl('');
    setAltText('');
    setIsValidating(false);
    onOpenChange(false);
  };

  /**
   * Handle URL input change with basic validation
   */
  const handleUrlChange = (value: string) => {
    setImageUrl(value);
    // Auto-generate alt text from URL if alt text is empty
    if (!altText && value) {
      try {
        const url = new URL(value);
        const filename = url.pathname.split('/').pop()?.split('.')[0];
        if (filename) {
          setAltText(filename.replace(/[-_]/g, ' '));
        }
      } catch {
        // Ignore invalid URLs during typing
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Insert Image
          </DialogTitle>
          <DialogDescription>
            Enter the URL of the image you want to insert. The image will be embedded using standard
            markdown format.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="imageUrl" className="flex items-center gap-2">
              <Link className="h-4 w-4" />
              Image URL
            </Label>
            <Input
              id="imageUrl"
              type="url"
              placeholder="https://example.com/image.jpg"
              value={imageUrl}
              onChange={(e) => handleUrlChange(e.target.value)}
              className="w-full"
              disabled={isValidating}
              autoFocus
            />
            <p className="text-xs text-muted-foreground">
              Supported formats: JPG, PNG, GIF, WebP, SVG
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="altText">Alt Text (Optional)</Label>
            <Input
              id="altText"
              type="text"
              placeholder="Describe the image"
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              className="w-full"
              disabled={isValidating}
            />
            <p className="text-xs text-muted-foreground">
              Alternative text for accessibility and SEO
            </p>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isValidating}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!imageUrl.trim() || isValidating}
              className="w-full sm:w-auto"
            >
              {isValidating ? 'Validating...' : 'Insert Image'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
