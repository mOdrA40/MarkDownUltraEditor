/**
 * @fileoverview Enhanced browser fingerprinting utilities for session management
 * @author Axel Modra
 */

import { UAParser } from 'ua-parser-js';

/**
 * Generate a consistent browser fingerprint based on browser characteristics
 * This helps identify unique browser sessions across different visits
 */
export const getBrowserFingerprint = (): string => {
  if (typeof window === 'undefined') {
    return 'server';
  }

  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    // Canvas fingerprint
    let canvasFingerprint = '';
    if (ctx) {
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillText('Browser fingerprint test', 2, 2);
      canvasFingerprint = canvas.toDataURL().slice(-50);
    }

    // Screen characteristics
    const screen = window.screen;
    const screenFingerprint = `${screen.width}x${screen.height}x${screen.colorDepth}`;

    // Timezone
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    // Language
    const language = navigator.language || 'unknown';

    // Platform
    const platform = navigator.platform || 'unknown';

    // User agent hash (simplified)
    const userAgent = navigator.userAgent || '';
    const userAgentHash = simpleHash(userAgent);

    // Combine all fingerprint components
    const fingerprintData = [
      screenFingerprint,
      timezone,
      language,
      platform,
      userAgentHash.toString(),
      canvasFingerprint,
    ].join('|');

    // Generate a consistent hash
    return simpleHash(fingerprintData).toString(36);
  } catch (error) {
    console.warn('Error generating browser fingerprint:', error);
    // Fallback to a simpler fingerprint
    return simpleHash(
      `${navigator.userAgent || 'unknown'}|${window.screen?.width || 0}x${
        window.screen?.height || 0
      }`
    ).toString(36);
  }
};

/**
 * Enhanced device information detection using UAParser
 */
export const getDeviceInfo = () => {
  if (typeof window === 'undefined') {
    return {
      browser: 'Unknown',
      os: 'Unknown',
      device: 'Unknown',
    };
  }

  try {
    const parser = new UAParser();
    const result = parser.getResult();

    return {
      browser: `${result.browser.name || 'Unknown'} ${result.browser.version || ''}`.trim(),
      os: `${result.os.name || 'Unknown'} ${result.os.version || ''}`.trim(),
      device: result.device.type || 'Desktop',
    };
  } catch (error) {
    console.warn('Error parsing user agent:', error);
    return {
      browser: 'Unknown',
      os: 'Unknown',
      device: 'Unknown',
    };
  }
};

/**
 * Simple hash function for generating consistent fingerprints
 */
const simpleHash = (str: string): number => {
  let hash = 0;
  if (str.length === 0) return hash;

  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash &= hash; // Convert to 32-bit integer
  }

  return Math.abs(hash);
};

/**
 * Check if this is a new device for the user
 */
export const isNewDevice = (
  previousDevices: Array<{ browser?: string; os?: string; device?: string }>
): boolean => {
  const currentDevice = getDeviceInfo();

  return !previousDevices.some(
    (device) =>
      device.browser === currentDevice.browser &&
      device.os === currentDevice.os &&
      device.device === currentDevice.device
  );
};
