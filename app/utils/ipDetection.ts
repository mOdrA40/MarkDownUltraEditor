/**
 * @fileoverview IP Detection utilities for client-side and server-side
 * @author Axel Modra
 */

/**
 * IP information interface
 */
export interface IPInfo {
  ip: string;
  country?: string;
  region?: string;
  city?: string;
  isp?: string;
  timezone?: string;
  isVPN?: boolean;
  isProxy?: boolean;
}

/**
 * Cache for IP information to avoid repeated API calls
 */
const ipCache = new Map<string, { data: IPInfo; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Get client IP from various sources (client-side)
 */
export const getClientIP = async (): Promise<string> => {
  if (typeof window === 'undefined') return 'unknown';

  try {
    // Try multiple free IP detection services
    const services = [
      'https://api.ipify.org?format=json',
      'https://ipapi.co/json/',
      'https://ipinfo.io/json',
      'https://api.ip.sb/jsonip',
    ];

    for (const service of services) {
      try {
        const response = await fetch(service, {
          method: 'GET',
          headers: {
            Accept: 'application/json',
          },
          signal: AbortSignal.timeout(3000), // 3 second timeout
        });

        if (response.ok) {
          const data = await response.json();
          // Different services return IP in different fields
          const ip = data.ip || data.query || data.IPv4 || 'unknown';
          if (ip && ip !== 'unknown') {
            return ip;
          }
        }
      } catch {
        // Continue to next service if this one fails
      }
    }

    return 'unknown';
  } catch {
    return 'unknown';
  }
};

/**
 * Get detailed IP information using free APIs
 */
export const getIPInfo = async (ip?: string): Promise<IPInfo> => {
  const targetIP = ip || (await getClientIP());

  if (targetIP === 'unknown') {
    return { ip: 'unknown' };
  }

  // Check cache first
  const cached = ipCache.get(targetIP);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  try {
    // Try free IP geolocation services
    const services = [
      {
        url: `https://ipapi.co/${targetIP}/json/`,
        parser: (data: Record<string, unknown>): IPInfo => ({
          ip: targetIP,
          country: data.country_name as string | undefined,
          region: data.region as string | undefined,
          city: data.city as string | undefined,
          isp: data.org as string | undefined,
          timezone: data.timezone as string | undefined,
        }),
      },
      {
        url: `https://ipinfo.io/${targetIP}/json`,
        parser: (data: Record<string, unknown>): IPInfo => ({
          ip: targetIP,
          country: data.country as string | undefined,
          region: data.region as string | undefined,
          city: data.city as string | undefined,
          isp: data.org as string | undefined,
          timezone: data.timezone as string | undefined,
        }),
      },
      {
        url: `http://ip-api.com/json/${targetIP}`,
        parser: (data: Record<string, unknown>): IPInfo => ({
          ip: targetIP,
          country: data.country as string | undefined,
          region: data.regionName as string | undefined,
          city: data.city as string | undefined,
          isp: data.isp as string | undefined,
          timezone: data.timezone as string | undefined,
        }),
      },
    ];

    for (const service of services) {
      try {
        const response = await fetch(service.url, {
          method: 'GET',
          headers: {
            Accept: 'application/json',
          },
          signal: AbortSignal.timeout(5000), // 5 second timeout
        });

        if (response.ok) {
          const data = await response.json();
          const ipInfo = service.parser(data);

          // Cache the result
          ipCache.set(targetIP, {
            data: ipInfo,
            timestamp: Date.now(),
          });

          return ipInfo;
        }
      } catch {
        // Continue to next service if this one fails
      }
    }

    // If all services fail, return basic info
    const basicInfo: IPInfo = { ip: targetIP };
    ipCache.set(targetIP, {
      data: basicInfo,
      timestamp: Date.now(),
    });

    return basicInfo;
  } catch {
    return { ip: targetIP };
  }
};

/**
 * Extract IP from request headers (server-side)
 */
export const extractIPFromHeaders = (headers: Headers): string => {
  // Check various headers in order of preference
  const ipHeaders = [
    'x-vercel-forwarded-for',
    'x-forwarded-for',
    'x-real-ip',
    'x-client-ip',
    'cf-connecting-ip', // Cloudflare
    'x-cluster-client-ip',
    'x-forwarded',
    'forwarded-for',
    'forwarded',
  ];

  for (const header of ipHeaders) {
    const value = headers.get(header);
    if (value) {
      // Handle comma-separated IPs (take the first one)
      const ip = value.split(',')[0].trim();
      if (ip && isValidIP(ip)) {
        return ip;
      }
    }
  }

  return 'unknown';
};

/**
 * Validate IP address format
 */
export const isValidIP = (ip: string): boolean => {
  if (!ip || ip === 'unknown') return false;

  // IPv4 regex
  const ipv4Regex =
    /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

  // IPv6 regex (simplified)
  const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;

  return ipv4Regex.test(ip) || ipv6Regex.test(ip);
};

/**
 * Check if IP is private/local
 */
export const isPrivateIP = (ip: string): boolean => {
  if (!isValidIP(ip)) return false;

  const parts = ip.split('.').map(Number);

  // Private IP ranges
  return (
    parts[0] === 10 || // 10.0.0.0/8
    (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) || // 172.16.0.0/12
    (parts[0] === 192 && parts[1] === 168) || // 192.168.0.0/16
    parts[0] === 127 // 127.0.0.0/8 (localhost)
  );
};

/**
 * Get comprehensive IP information for security context
 */
export const getSecurityIPInfo = async (request?: Request): Promise<IPInfo> => {
  let ip = 'unknown';

  if (request) {
    // Server-side: extract from headers
    ip = extractIPFromHeaders(request.headers);
  } else {
    // Client-side: detect using APIs
    ip = await getClientIP();
  }

  return await getIPInfo(ip);
};

/**
 * Clear IP cache (useful for testing or privacy)
 */
export const clearIPCache = (): void => {
  ipCache.clear();
};
