/**
 * @fileoverview Safe Image component with CSP fallback and error handling
 * @author Axel Modra
 */

import React from 'react';
import { safeConsole } from '@/utils/console';
import {
  FALLBACK_IMAGES,
  getSafeImageUrl,
  handleImageError,
  isTrustedDomain,
} from '@/utils/imageUtils';

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fallbackType?: 'placeholder' | 'error' | 'loading';
  showTrustIndicator?: boolean;
  onLoadError?: (originalSrc: string) => void;
  onLoadSuccess?: (src: string) => void;
}

/**
 * Safe Image component that handles CSP restrictions and provides fallbacks
 */
export const SafeImage: React.FC<SafeImageProps> = ({
  src,
  alt,
  fallbackType = 'error',
  showTrustIndicator = false,
  onLoadError,
  onLoadSuccess,
  className = '',
  style,
  ...props
}) => {
  const [currentSrc, setCurrentSrc] = React.useState<string>(getSafeImageUrl(src));
  const [isLoading, setIsLoading] = React.useState(true);
  const [hasError, setHasError] = React.useState(false);
  const [isTrusted, setIsTrusted] = React.useState(false);
  const imgRef = React.useRef<HTMLImageElement>(null);

  // Update src when prop changes
  React.useEffect(() => {
    const safeSrc = getSafeImageUrl(src);
    setCurrentSrc(safeSrc);
    setIsLoading(true);
    setHasError(false);
    setIsTrusted(isTrustedDomain(src));
  }, [src]);

  const handleLoad = React.useCallback(() => {
    setIsLoading(false);
    setHasError(false);
    onLoadSuccess?.(currentSrc);
  }, [currentSrc, onLoadSuccess]);

  const handleError = React.useCallback(() => {
    setIsLoading(false);

    if (imgRef.current && currentSrc !== FALLBACK_IMAGES[fallbackType]) {
      setHasError(true);
      const fallbackSrc = FALLBACK_IMAGES[fallbackType];
      setCurrentSrc(fallbackSrc);
      handleImageError(imgRef.current, src, fallbackType);
      onLoadError?.(src);
    }
  }, [src, fallbackType, currentSrc, onLoadError]);

  const trustIndicatorClass = isTrusted
    ? 'border-green-200 bg-green-50'
    : 'border-yellow-200 bg-yellow-50';

  const containerClass = `relative inline-block ${showTrustIndicator ? trustIndicatorClass : ''}`;

  return (
    <div className={containerClass}>
      <img
        ref={imgRef}
        src={currentSrc}
        alt={alt}
        className={`${className} ${
          isLoading ? 'opacity-75' : 'opacity-100'
        } transition-opacity duration-200`}
        style={style}
        onLoad={handleLoad}
        onError={handleError}
        {...props}
      />

      {/* Trust indicator */}
      {showTrustIndicator && (
        <div className="absolute top-1 right-1 px-2 py-1 text-xs rounded-md shadow-sm">
          {isTrusted ? (
            <span className="text-green-700 bg-green-100 px-1 py-0.5 rounded">✓ Trusted</span>
          ) : (
            <span className="text-yellow-700 bg-yellow-100 px-1 py-0.5 rounded">⚠ Fallback</span>
          )}
        </div>
      )}

      {/* Loading indicator */}
      {isLoading && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500" />
        </div>
      )}

      {/* Error indicator */}
      {hasError && (
        <div className="absolute bottom-1 left-1 px-2 py-1 text-xs bg-red-100 text-red-700 rounded-md shadow-sm">
          Failed to load
        </div>
      )}
    </div>
  );
};

/**
 * Hook for managing multiple images with fallbacks
 */
export const useImageLoader = (_urls: string[]) => {
  const [loadedImages, setLoadedImages] = React.useState<Record<string, boolean>>({});
  const [failedImages, setFailedImages] = React.useState<Record<string, boolean>>({});

  const handleImageLoad = React.useCallback((url: string) => {
    setLoadedImages((prev) => ({ ...prev, [url]: true }));
    setFailedImages((prev) => ({ ...prev, [url]: false }));
  }, []);

  const handleImageError = React.useCallback((url: string) => {
    setLoadedImages((prev) => ({ ...prev, [url]: false }));
    setFailedImages((prev) => ({ ...prev, [url]: true }));
    safeConsole.warn('Image failed to load:', url);
  }, []);

  const isLoaded = React.useCallback((url: string) => loadedImages[url] === true, [loadedImages]);
  const hasFailed = React.useCallback((url: string) => failedImages[url] === true, [failedImages]);

  return {
    handleImageLoad,
    handleImageError,
    isLoaded,
    hasFailed,
    loadedCount: Object.values(loadedImages).filter(Boolean).length,
    failedCount: Object.values(failedImages).filter(Boolean).length,
  };
};

/**
 * Image Gallery component with safe loading
 */
interface SafeImageGalleryProps {
  images: Array<{ src: string; alt: string; caption?: string }>;
  className?: string;
  showTrustIndicators?: boolean;
}

export const SafeImageGallery: React.FC<SafeImageGalleryProps> = ({
  images,
  className = '',
  showTrustIndicators = false,
}) => {
  const { handleImageLoad, handleImageError, isLoaded, hasFailed, loadedCount, failedCount } =
    useImageLoader(images.map((img) => img.src));

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Stats */}
      <div className="text-sm text-gray-600 mb-4">
        Images: {loadedCount} loaded, {failedCount} failed,{' '}
        {images.length - loadedCount - failedCount} pending
      </div>

      {/* Gallery */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {images.map((image, index) => (
          <div key={`${image.src}-${index}`} className="space-y-2">
            <SafeImage
              src={image.src}
              alt={image.alt}
              className="w-full h-48 object-cover rounded-lg"
              showTrustIndicator={showTrustIndicators}
              onLoadSuccess={() => handleImageLoad(image.src)}
              onLoadError={() => handleImageError(image.src)}
            />
            {image.caption && <p className="text-sm text-gray-600 text-center">{image.caption}</p>}
            <div className="flex justify-center space-x-2 text-xs">
              {isLoaded(image.src) && <span className="text-green-600">✓ Loaded</span>}
              {hasFailed(image.src) && <span className="text-red-600">✗ Failed</span>}
              {!isLoaded(image.src) && !hasFailed(image.src) && (
                <span className="text-gray-500">⏳ Loading</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SafeImage;
