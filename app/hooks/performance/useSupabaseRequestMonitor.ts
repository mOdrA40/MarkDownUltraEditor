/**
 * @fileoverview Hook for monitoring Supabase request patterns and performance
 * @author Axel Modra
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { safeConsole } from '@/utils/console';

interface RequestMetrics {
  /** Total requests in current session */
  totalRequests: number;
  /** Requests per minute average */
  requestsPerMinute: number;
  /** Request types breakdown */
  requestTypes: Record<string, number>;
  /** Failed requests count */
  failedRequests: number;
  /** Average response time */
  averageResponseTime: number;
  /** Peak requests per minute */
  peakRequestsPerMinute: number;
  /** Session start time */
  sessionStartTime: number;
}

interface RequestLog {
  timestamp: number;
  type: string;
  duration?: number;
  success: boolean;
  endpoint?: string;
}

interface UseSupabaseRequestMonitorReturn {
  /** Current request metrics */
  metrics: RequestMetrics;
  /** Log a new request */
  logRequest: (type: string, endpoint?: string, duration?: number, success?: boolean) => void;
  /** Get request history for analysis */
  getRequestHistory: () => RequestLog[];
  /** Reset metrics */
  resetMetrics: () => void;
  /** Get performance recommendations */
  getRecommendations: () => string[];
  /** Check if request rate is concerning */
  isHighRequestRate: boolean;
}

/**
 * Hook for monitoring Supabase request patterns and performance
 */
export const useSupabaseRequestMonitor = (): UseSupabaseRequestMonitorReturn => {
  const [metrics, setMetrics] = useState<RequestMetrics>(() => ({
    totalRequests: 0,
    requestsPerMinute: 0,
    requestTypes: {},
    failedRequests: 0,
    averageResponseTime: 0,
    peakRequestsPerMinute: 0,
    sessionStartTime: Date.now(),
  }));

  const requestHistoryRef = useRef<RequestLog[]>([]);
  const lastMinuteRequestsRef = useRef<number[]>([]);

  /**
   * Calculate requests per minute
   */
  const calculateRequestsPerMinute = useCallback(() => {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;

    // Filter requests from last minute
    const recentRequests = requestHistoryRef.current.filter((req) => req.timestamp > oneMinuteAgo);

    return recentRequests.length;
  }, []);

  /**
   * Update metrics based on current request history
   */
  const updateMetrics = useCallback(() => {
    const history = requestHistoryRef.current;
    const currentRPM = calculateRequestsPerMinute();

    // Calculate average response time
    const requestsWithDuration = history.filter((req) => req.duration !== undefined);
    const avgResponseTime =
      requestsWithDuration.length > 0
        ? requestsWithDuration.reduce((sum, req) => sum + (req.duration || 0), 0) /
          requestsWithDuration.length
        : 0;

    // Count request types
    const requestTypes: Record<string, number> = {};
    history.forEach((req) => {
      requestTypes[req.type] = (requestTypes[req.type] || 0) + 1;
    });

    // Count failed requests
    const failedRequests = history.filter((req) => !req.success).length;

    setMetrics((prev) => ({
      ...prev,
      totalRequests: history.length,
      requestsPerMinute: currentRPM,
      requestTypes,
      failedRequests,
      averageResponseTime: avgResponseTime,
      peakRequestsPerMinute: Math.max(prev.peakRequestsPerMinute, currentRPM),
    }));
  }, [calculateRequestsPerMinute]);

  /**
   * Log a new request
   */
  const logRequest = useCallback(
    (type: string, endpoint?: string, duration?: number, success = true) => {
      const requestLog: RequestLog = {
        timestamp: Date.now(),
        type,
        endpoint,
        duration,
        success,
      };

      requestHistoryRef.current.push(requestLog);

      // Keep only last 1000 requests to prevent memory issues
      if (requestHistoryRef.current.length > 1000) {
        requestHistoryRef.current = requestHistoryRef.current.slice(-1000);
      }

      // Update metrics
      updateMetrics();

      // Log for debugging
      safeConsole.log(`Supabase Request: ${type}${endpoint ? ` (${endpoint})` : ''}`, {
        duration: duration ? `${duration}ms` : 'unknown',
        success,
        totalRequests: requestHistoryRef.current.length,
      });
    },
    [updateMetrics]
  );

  /**
   * Get request history for analysis
   */
  const getRequestHistory = useCallback(() => {
    return [...requestHistoryRef.current];
  }, []);

  /**
   * Reset metrics
   */
  const resetMetrics = useCallback(() => {
    requestHistoryRef.current = [];
    lastMinuteRequestsRef.current = [];
    setMetrics({
      totalRequests: 0,
      requestsPerMinute: 0,
      requestTypes: {},
      failedRequests: 0,
      averageResponseTime: 0,
      peakRequestsPerMinute: 0,
      sessionStartTime: Date.now(),
    });
    safeConsole.log('Supabase request metrics reset');
  }, []);

  /**
   * Get performance recommendations
   */
  const getRecommendations = useCallback((): string[] => {
    const recommendations: string[] = [];
    const { requestsPerMinute, averageResponseTime, requestTypes, totalRequests } = metrics;

    // High request rate
    if (requestsPerMinute > 10) {
      recommendations.push('Consider implementing request debouncing or batching');
    }

    // Slow response times
    if (averageResponseTime > 1000) {
      recommendations.push(
        'Response times are slow - consider optimizing queries or adding indexes'
      );
    }

    // Too many auto-save requests
    const autoSaveRequests = requestTypes['auto-save'] || 0;
    if (autoSaveRequests > totalRequests * 0.5) {
      recommendations.push('Auto-save requests are frequent - consider increasing debounce time');
    }

    // Too many file list requests
    const fileListRequests = requestTypes['file-list'] || 0;
    if (fileListRequests > 20) {
      recommendations.push(
        'File list is being fetched frequently - check for unnecessary refetches'
      );
    }

    // High failure rate
    const failureRate = metrics.failedRequests / totalRequests;
    if (failureRate > 0.1) {
      recommendations.push(
        'High failure rate detected - check network connectivity and error handling'
      );
    }

    return recommendations;
  }, [metrics]);

  /**
   * Check if request rate is concerning
   */
  const isHighRequestRate = metrics.requestsPerMinute > 15;

  // Update metrics periodically
  useEffect(() => {
    const interval = setInterval(updateMetrics, 10000); // Update every 10 seconds
    return () => clearInterval(interval);
  }, [updateMetrics]);

  // Log session start
  useEffect(() => {
    safeConsole.log('Supabase request monitoring started');
    return () => {
      safeConsole.log('Supabase request monitoring stopped', {
        totalRequests: requestHistoryRef.current.length,
        sessionDuration: Date.now() - metrics.sessionStartTime,
      });
    };
  }, [metrics.sessionStartTime]);

  return {
    metrics,
    logRequest,
    getRequestHistory,
    resetMetrics,
    getRecommendations,
    isHighRequestRate,
  };
};
