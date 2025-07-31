/**
 * @fileoverview Theme-aware loading components with smooth animations
 * @author Axel Modra
 */

import { FileText, Loader2, RefreshCw } from 'lucide-react';
import type React from 'react';
import { useTheme } from '@/components/features/ThemeSelector';
import { cn } from '@/lib/utils';

/**
 * Loading spinner sizes
 */
export type LoaderSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/**
 * Loading spinner variants
 */
export type LoaderVariant = 'spinner' | 'pulse' | 'dots' | 'file';

/**
 * Props for ThemeAwareLoader
 */
export interface ThemeAwareLoaderProps {
  /** Size of the loader */
  size?: LoaderSize;
  /** Variant of the loader */
  variant?: LoaderVariant;
  /** Loading text */
  text?: string;
  /** Additional className */
  className?: string;
  /** Whether to show text */
  showText?: boolean;
  /** Custom color override */
  color?: string;
  /** Whether to center the loader */
  centered?: boolean;
  /** Whether to use full screen overlay */
  overlay?: boolean;
  /** Custom icon */
  icon?: React.ReactNode;
}

/**
 * Size mappings for different loader elements
 */
const sizeClasses = {
  xs: {
    icon: 'w-3 h-3',
    text: 'text-xs',
    container: 'gap-1 p-2',
  },
  sm: {
    icon: 'w-4 h-4',
    text: 'text-sm',
    container: 'gap-2 p-3',
  },
  md: {
    icon: 'w-6 h-6',
    text: 'text-base',
    container: 'gap-3 p-4',
  },
  lg: {
    icon: 'w-8 h-8',
    text: 'text-lg',
    container: 'gap-4 p-6',
  },
  xl: {
    icon: 'w-12 h-12',
    text: 'text-xl',
    container: 'gap-5 p-8',
  },
};

/**
 * Dots loading animation component
 */
const DotsLoader: React.FC<{ size: LoaderSize; color: string }> = ({ size, color }) => {
  const dotSize = size === 'xs' ? 'w-1 h-1' : size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2';

  return (
    <div className="flex space-x-1">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={cn(dotSize, 'rounded-full animate-pulse')}
          style={{
            backgroundColor: color,
            animationDelay: `${i * 0.2}s`,
            animationDuration: '1.4s',
          }}
        />
      ))}
    </div>
  );
};

/**
 * Pulse loading animation component
 */
const PulseLoader: React.FC<{ size: LoaderSize; color: string }> = ({ size, color }) => {
  return (
    <div
      className={cn(sizeClasses[size].icon, 'rounded-full animate-pulse')}
      style={{ backgroundColor: color }}
    />
  );
};

/**
 * Main theme-aware loader component
 */
export const ThemeAwareLoader: React.FC<ThemeAwareLoaderProps> = ({
  size = 'md',
  variant = 'spinner',
  text = 'Loading...',
  className = '',
  showText = true,
  color,
  centered = true,
  overlay = false,
  icon,
}) => {
  const { currentTheme } = useTheme();

  // Use custom color or theme primary color
  const loaderColor = color || currentTheme.primary;

  // Get appropriate icon based on variant
  const getIcon = () => {
    if (icon) return icon;

    switch (variant) {
      case 'spinner':
        return (
          <RefreshCw
            className={cn(sizeClasses[size].icon, 'animate-spin')}
            style={{ color: loaderColor }}
          />
        );
      case 'file':
        return (
          <FileText
            className={cn(sizeClasses[size].icon, 'animate-pulse')}
            style={{ color: loaderColor }}
          />
        );
      case 'dots':
        return <DotsLoader size={size} color={loaderColor} />;
      case 'pulse':
        return <PulseLoader size={size} color={loaderColor} />;
      default:
        return (
          <Loader2
            className={cn(sizeClasses[size].icon, 'animate-spin')}
            style={{ color: loaderColor }}
          />
        );
    }
  };

  const content = (
    <div
      className={cn(
        'flex flex-col items-center justify-center',
        sizeClasses[size].container,
        centered && 'text-center',
        className
      )}
    >
      {getIcon()}
      {showText && (
        <p
          className={cn(sizeClasses[size].text, 'font-medium animate-pulse')}
          style={{ color: currentTheme.text }}
        >
          {text}
        </p>
      )}
    </div>
  );

  if (overlay) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm"
        style={{ backgroundColor: `${currentTheme.background}CC` }}
      >
        {content}
      </div>
    );
  }

  return content;
};

/**
 * File loading specific loader
 */
export const FileLoader: React.FC<{
  fileName?: string;
  size?: LoaderSize;
  className?: string;
}> = ({ fileName, size = 'md', className }) => {
  return (
    <ThemeAwareLoader
      size={size}
      variant="file"
      text={fileName ? `Loading ${fileName}...` : 'Loading file...'}
      className={className}
      centered
    />
  );
};

/**
 * Inline loader for buttons and small spaces
 */
export const InlineLoader: React.FC<{
  text?: string;
  className?: string;
}> = ({ text, className }) => {
  return (
    <ThemeAwareLoader
      size="xs"
      variant="spinner"
      text={text}
      showText={!!text}
      centered={false}
      className={cn('inline-flex items-center', className)}
    />
  );
};

/**
 * Full page loader with overlay
 */
export const FullPageLoader: React.FC<{
  text?: string;
  variant?: LoaderVariant;
}> = ({ text = 'Loading...', variant = 'spinner' }) => {
  return <ThemeAwareLoader size="lg" variant={variant} text={text} overlay />;
};

/**
 * Content restoration loader
 */
export const ContentRestorationLoader: React.FC<{
  fileName?: string;
}> = ({ fileName }) => {
  const { currentTheme } = useTheme();

  return (
    <div
      className="flex flex-col items-center justify-center min-h-[400px] p-8"
      style={{ backgroundColor: currentTheme.background }}
    >
      <div className="relative">
        <FileText
          className="w-16 h-16 mb-4 animate-pulse"
          style={{ color: currentTheme.primary }}
        />
        <div
          className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center"
          style={{ backgroundColor: currentTheme.primary }}
        >
          <Loader2 className="w-4 h-4 animate-spin text-white" />
        </div>
      </div>
      <h3 className="text-lg font-semibold mb-2" style={{ color: currentTheme.text }}>
        Restoring Your Work
      </h3>
      <p className="text-sm opacity-75 text-center max-w-md" style={{ color: currentTheme.text }}>
        {fileName ? `Loading "${fileName}"...` : 'Restoring your previous file...'}
      </p>
    </div>
  );
};

export default ThemeAwareLoader;
