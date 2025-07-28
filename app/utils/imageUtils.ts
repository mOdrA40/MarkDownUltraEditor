/**
 * @fileoverview Image utilities for handling CSP restrictions and fallbacks
 * @author Axel Modra
 */

import { safeConsole } from './console';

// Common image hosting domains that are usually safe
export const COMMON_IMAGE_DOMAINS = [
  'picsum.photos',
  'via.placeholder.com',
  'placehold.it',
  'placehold.co',
  'placekitten.com',
  'images.unsplash.com',
  'unsplash.com',
  'cdn.pixabay.com',
  'images.pexels.com',
  'imgur.com',
  'i.imgur.com',
  'raw.githubusercontent.com',
  'github.com',
  'avatars.githubusercontent.com',
  'cloudinary.com',
  'res.cloudinary.com',
  'amazonaws.com',
  's3.amazonaws.com',
  'googleusercontent.com',
  'gravatar.com',
  'www.gravatar.com',
];

// Fallback placeholder images
export const FALLBACK_IMAGES = {
  placeholder:
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIE5vdCBBdmFpbGFibGU8L3RleHQ+PC9zdmc+',
  error:
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZmZlYmVlIiBzdHJva2U9IiNmNTY1NjUiIHN0cm9rZS13aWR0aD0iMiIvPjx0ZXh0IHg9IjUwJSIgeT0iNDAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiNkYzI2MjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj7inKA8L3RleHQ+PHRleHQgeD0iNTAlIiB5PSI2MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMiIgZmlsbD0iIzk5MTgyOCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIEZhaWxlZCB0byBMb2FkPC90ZXh0Pjwvc3ZnPg==',
  loading:
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PGNpcmNsZSBjeD0iMTUwIiBjeT0iMTAwIiByPSIyMCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMzMzOGJlIiBzdHJva2Utd2lkdGg9IjMiPjxhbmltYXRlIGF0dHJpYnV0ZU5hbWU9InN0cm9rZS1kYXNoYXJyYXkiIGR1cj0iMnMiIHZhbHVlcz0iMCAxNTc7NzguNSA3OC41OzAgMTU3IiByZXBlYXRDb3VudD0iaW5kZWZpbml0ZSIvPjwvY2lyY2xlPjx0ZXh0IHg9IjUwJSIgeT0iNzAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTIiIGZpbGw9IiM2NjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5Mb2FkaW5nLi4uPC90ZXh0Pjwvc3ZnPg==',
};

/**
 * Check if a URL is from a trusted domain
 */
export const isTrustedDomain = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();

    return COMMON_IMAGE_DOMAINS.some(
      (domain) => hostname === domain || hostname.endsWith(`.${domain}`)
    );
  } catch {
    return false;
  }
};

/**
 * Get a safe image URL with fallback
 */
export const getSafeImageUrl = (url: string): string => {
  // If it's already a data URL, return as-is
  if (url.startsWith('data:')) {
    return url;
  }

  // If it's a trusted domain, return as-is
  if (isTrustedDomain(url)) {
    return url;
  }

  // For development, allow all HTTPS URLs
  if (process.env.NODE_ENV === 'development' && url.startsWith('https://')) {
    return url;
  }

  // Otherwise, return placeholder
  safeConsole.warn('Image URL not from trusted domain, using placeholder:', url);
  return FALLBACK_IMAGES.placeholder;
};

/**
 * Create an image proxy URL (for future implementation)
 */
export const createImageProxyUrl = (originalUrl: string): string => {
  // For now, just return the safe URL
  // In the future, this could proxy through your own server
  return getSafeImageUrl(originalUrl);
};

/**
 * Handle image load error with fallback
 */
export const handleImageError = (
  imgElement: HTMLImageElement,
  originalSrc: string,
  fallbackType: keyof typeof FALLBACK_IMAGES = 'error'
): void => {
  if (imgElement.src !== FALLBACK_IMAGES[fallbackType]) {
    safeConsole.warn('Image failed to load, using fallback:', originalSrc);
    imgElement.src = FALLBACK_IMAGES[fallbackType];
    imgElement.alt = `Failed to load image: ${originalSrc}`;
  }
};

/**
 * Preload an image and return a promise
 */
export const preloadImage = (src: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      resolve(src);
    };

    img.onerror = () => {
      reject(new Error(`Failed to load image: ${src}`));
    };

    img.src = getSafeImageUrl(src);
  });
};

/**
 * Batch preload multiple images
 */
export const preloadImages = async (urls: string[]): Promise<string[]> => {
  const results = await Promise.allSettled(urls.map((url) => preloadImage(url)));

  return results
    .filter((result): result is PromiseFulfilledResult<string> => result.status === 'fulfilled')
    .map((result) => result.value);
};

/**
 * Get image dimensions without loading the full image
 */
export const getImageDimensions = (src: string): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight,
      });
    };

    img.onerror = () => {
      reject(new Error(`Failed to get dimensions for: ${src}`));
    };

    img.src = getSafeImageUrl(src);
  });
};

/**
 * Create a responsive image srcset for different screen sizes
 */
export const createResponsiveSrcSet = (
  baseUrl: string,
  sizes: number[] = [300, 600, 900, 1200]
): string => {
  if (!isTrustedDomain(baseUrl)) {
    return getSafeImageUrl(baseUrl);
  }

  // For services that support dynamic resizing (like Unsplash, Cloudinary)
  const urlObj = new URL(baseUrl);

  if (urlObj.hostname.includes('unsplash.com')) {
    return sizes.map((size) => `${baseUrl}?w=${size} ${size}w`).join(', ');
  }

  if (urlObj.hostname.includes('cloudinary.com')) {
    return sizes
      .map((size) => `${baseUrl.replace('/upload/', `/upload/w_${size}/`)} ${size}w`)
      .join(', ');
  }

  // For other services, just return the original
  return baseUrl;
};

/**
 * Extract image URLs from markdown content
 */
export const extractImageUrls = (markdown: string): string[] => {
  const imageRegex = /!\[.*?\]\((.*?)\)/g;
  const urls: string[] = [];
  let match: RegExpExecArray | null;

  match = imageRegex.exec(markdown);
  while (match !== null) {
    if (match[1]) {
      urls.push(match[1]);
    }
    match = imageRegex.exec(markdown);
  }

  return urls;
};

/**
 * Replace image URLs in markdown with safe versions
 */
export const sanitizeMarkdownImages = (markdown: string): string => {
  return markdown.replace(/!\[(.*?)\]\((.*?)\)/g, (_match, alt, url) => {
    const safeUrl = getSafeImageUrl(url);
    return `![${alt}](${safeUrl})`;
  });
};

/**
 * Check if CSP is blocking images and provide user-friendly message
 */
export const checkCSPImageSupport = (): Promise<boolean> => {
  return new Promise((resolve) => {
    const testImg = new Image();
    const testUrl = 'https://httpbin.org/image/png';

    const timeout = setTimeout(() => {
      resolve(false);
    }, 5000);

    testImg.onload = () => {
      clearTimeout(timeout);
      resolve(true);
    };

    testImg.onerror = () => {
      clearTimeout(timeout);
      resolve(false);
    };

    testImg.src = testUrl;
  });
};
