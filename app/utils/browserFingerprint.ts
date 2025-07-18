/**
 * @fileoverview Browser fingerprinting utilities for session management
 * @author Axel Modra
 */

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
 * Get device information for session tracking
 */
export const getDeviceInfo = () => {
  if (typeof window === 'undefined') {
    return {
      browser: 'server',
      os: 'server',
      device: 'server',
    };
  }

  const userAgent = navigator.userAgent;

  // Detect browser
  let browser = 'Unknown';
  if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
    browser = 'Chrome';
  } else if (userAgent.includes('Firefox')) {
    browser = 'Firefox';
  } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
    browser = 'Safari';
  } else if (userAgent.includes('Edg')) {
    browser = 'Edge';
  } else if (userAgent.includes('Opera') || userAgent.includes('OPR')) {
    browser = 'Opera';
  }

  // Detect OS
  let os = 'Unknown';
  if (userAgent.includes('Windows')) {
    os = 'Windows';
  } else if (userAgent.includes('Mac')) {
    os = 'macOS';
  } else if (userAgent.includes('Linux')) {
    os = 'Linux';
  } else if (userAgent.includes('Android')) {
    os = 'Android';
  } else if (userAgent.includes('iOS')) {
    os = 'iOS';
  }

  // Detect device type
  let device = 'Desktop';
  if (userAgent.includes('Mobile')) {
    device = 'Mobile';
  } else if (userAgent.includes('Tablet')) {
    device = 'Tablet';
  }

  return {
    browser,
    os,
    device,
  };
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
