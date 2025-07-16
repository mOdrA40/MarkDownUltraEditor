/**
 * @fileoverview Enhanced Image Upload Button with drag & drop support
 * @author Axel Modra
 */

import { useAuth } from '@clerk/react-router';
import { ImageIcon, Lock, Upload } from 'lucide-react';
import type React from 'react';
import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/core/useToast';
import { useImageUpload } from '@/hooks/editor/useImageUpload';

interface ImageUploadButtonProps {
  onImageInsert: (imageUrl: string, altText?: string) => void;
  disabled?: boolean;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

/**
 * Enhanced image upload button component
 */
export const ImageUploadButton: React.FC<ImageUploadButtonProps> = ({
  onImageInsert,
  disabled = false,
  variant = 'outline',
  size = 'sm',
  showLabel = true,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isSignedIn } = useAuth();
  const { toast } = useToast();
  const { uploadImage, isUploading } = useImageUpload();
  const [isShaking, setIsShaking] = useState(false);

  /**
   * Handle file input change
   */
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const result = await uploadImage(file);
    if (result.success && result.url) {
      const altText = file.name.replace(/\.[^/.]+$/, ''); // Remove extension
      onImageInsert(result.url, altText);
    }

    // Reset input
    event.target.value = '';
  };

  /**
   * Handle click - check authentication first with visual feedback
   */
  const handleClick = () => {
    if (!isSignedIn) {
      // Add shake effect
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);

      toast({
        title: '🔒 Login Required',
        description:
          'Please sign in to upload images. Image upload is available for registered users only.',
        variant: 'destructive',
      });
      return;
    }
    fileInputRef.current?.click();
  };

  const buttonSize = size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'default';

  return (
    <>
      <Button
        variant={variant}
        size={buttonSize}
        onClick={handleClick}
        disabled={disabled || isUploading}
        className={`flex items-center gap-2 transition-all duration-200 ${
          isShaking ? 'animate-bounce scale-105 bg-gray-100 border-gray-300' : ''
        }`}
        title={!isSignedIn ? 'Login required to upload images' : 'Upload Image'}
      >
        <div className="relative">
          {isUploading ? (
            <Upload className="h-4 w-4 animate-spin" />
          ) : (
            <ImageIcon className="h-4 w-4" />
          )}
          {!isSignedIn && !isUploading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-black/60 backdrop-blur-sm rounded-full p-0.5">
                <Lock className="h-2 w-2 text-white" />
              </div>
            </div>
          )}
        </div>
        {showLabel && (
          <span className="hidden sm:inline">{isUploading ? 'Uploading...' : 'Image'}</span>
        )}
      </Button>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        onChange={handleFileChange}
        style={{ display: 'none' }}
        aria-label="Upload image file"
      />
    </>
  );
};
