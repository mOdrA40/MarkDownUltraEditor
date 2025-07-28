/**
 * @fileoverview CSP notification component for user guidance
 * @author Axel Modra
 */

import React from 'react';
import { useCSPDetection, useImageRecommendations } from '@/hooks/useCSPDetection';

interface CSPNotificationProps {
  className?: string;
  showDetails?: boolean;
  onDismiss?: () => void;
}

/**
 * Notification component that appears when CSP is blocking images
 */
export const CSPNotification: React.FC<CSPNotificationProps> = ({
  className = '',
  showDetails = true,
  onDismiss,
}) => {
  const { isCSPBlocking, isChecking, retryCheck, getRecommendations } = useCSPDetection();
  const [isDismissed, setIsDismissed] = React.useState(false);

  const handleDismiss = () => {
    setIsDismissed(true);
    onDismiss?.();
  };

  if (!isCSPBlocking || isDismissed || isChecking) {
    return null;
  }

  const recommendations = getRecommendations();

  return (
    <div className={`bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4 ${className}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg
            className="h-5 w-5 text-yellow-400"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-label="Warning"
          >
            <title>Warning</title>
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        </div>

        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-yellow-800">Some images may not load properly</h3>

          <div className="mt-2 text-sm text-yellow-700">
            <p>
              Content Security Policy (CSP) is blocking some external images for security reasons.
              This is normal and helps protect your data.
            </p>

            {showDetails && (
              <div className="mt-3">
                <p className="font-medium mb-2">Recommended solutions:</p>
                <ul className="list-disc list-inside space-y-1">
                  {recommendations.map((rec, index) => (
                    <li key={`rec-${index}-${rec.slice(0, 20)}`} className="text-xs">
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="mt-4 flex space-x-2">
            <button
              type="button"
              onClick={retryCheck}
              className="text-xs bg-yellow-100 hover:bg-yellow-200 text-yellow-800 px-3 py-1 rounded-md transition-colors"
            >
              Recheck
            </button>

            <button
              type="button"
              onClick={handleDismiss}
              className="text-xs text-yellow-600 hover:text-yellow-800 px-3 py-1 transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>

        <div className="ml-auto pl-3">
          <button
            type="button"
            onClick={handleDismiss}
            className="inline-flex text-yellow-400 hover:text-yellow-600 focus:outline-none"
          >
            <span className="sr-only">Dismiss</span>
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-label="Close">
              <title>Close</title>
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Inline help component for image insertion
 */
export const ImageInsertHelp: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { isCSPBlocking } = useImageRecommendations();
  const [showHelp, setShowHelp] = React.useState(false);

  if (!isCSPBlocking) {
    return null;
  }

  return (
    <div className={`bg-blue-50 border border-blue-200 rounded-lg p-3 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <svg
            className="h-4 w-4 text-blue-400 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-label="Info"
          >
            <title>Info</title>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span className="text-sm font-medium text-blue-800">Image Loading Tips</span>
        </div>

        <button
          type="button"
          onClick={() => setShowHelp(!showHelp)}
          className="text-blue-600 hover:text-blue-800 text-sm"
        >
          {showHelp ? 'Hide' : 'Show'} Tips
        </button>
      </div>

      {showHelp && (
        <div className="mt-3 text-sm text-blue-700">
          <p className="mb-2">For best results, use images from these trusted sources:</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <p className="font-medium">Free Stock Photos:</p>
              <ul className="list-disc list-inside ml-2 space-y-1">
                <li>unsplash.com</li>
                <li>pixabay.com</li>
                <li>pexels.com</li>
              </ul>
            </div>
            <div>
              <p className="font-medium">Placeholders:</p>
              <ul className="list-disc list-inside ml-2 space-y-1">
                <li>picsum.photos</li>
                <li>via.placeholder.com</li>
                <li>placehold.co</li>
              </ul>
            </div>
          </div>

          <div className="mt-3 p-2 bg-blue-100 rounded text-xs">
            <p className="font-medium">Quick Examples:</p>
            <code className="block mt-1">![Photo](https://picsum.photos/300/200)</code>
            <code className="block">![Placeholder](https://via.placeholder.com/300x200)</code>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Image status indicator for the editor
 */
interface ImageStatusProps {
  totalImages: number;
  loadedImages: number;
  failedImages: number;
  className?: string;
}

export const ImageStatus: React.FC<ImageStatusProps> = ({
  totalImages,
  loadedImages,
  failedImages,
  className = '',
}) => {
  if (totalImages === 0) return null;

  const successRate = totalImages > 0 ? (loadedImages / totalImages) * 100 : 0;
  const statusColor = successRate >= 80 ? 'green' : successRate >= 50 ? 'yellow' : 'red';

  return (
    <div className={`flex items-center space-x-2 text-sm ${className}`}>
      <div className="flex items-center space-x-1">
        <div className={`w-2 h-2 rounded-full bg-${statusColor}-400`} />
        <span className={`text-${statusColor}-700`}>
          Images: {loadedImages}/{totalImages}
        </span>
      </div>

      {failedImages > 0 && <span className="text-red-600 text-xs">({failedImages} failed)</span>}

      <span className="text-gray-500 text-xs">{successRate.toFixed(0)}% success</span>
    </div>
  );
};

export default CSPNotification;
