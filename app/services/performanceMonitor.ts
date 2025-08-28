/**
 * @fileoverview Performance monitoring service untuk query optimization
 * @author Augment Agent
 */

import { safeConsole } from '@/utils/console';

interface QueryMetrics {
  queryType: string;
  duration: number;
  timestamp: number;
  success: boolean;
  error?: string;
  dataSize?: number;
  cacheHit?: boolean;
}

interface PerformanceStats {
  totalQueries: number;
  averageResponseTime: number;
  errorRate: number;
  cacheHitRate: number;
  slowQueries: QueryMetrics[];
  recentQueries: QueryMetrics[];
}

/**
 * Performance monitoring service untuk track query performance
 * Membantu identify bottlenecks dan optimize CPU usage
 */
export class PerformanceMonitor {
  private metrics: QueryMetrics[] = [];
  private maxMetrics = 1000; // Keep last 1000 queries
  private slowQueryThreshold = 1000; // 1 second
  private enabled = process.env.NODE_ENV === 'development';

  /**
   * Track query performance
   */
  trackQuery<T>(
    queryType: string,
    queryFn: () => Promise<T>,
    options: {
      cacheHit?: boolean;
      expectedDataSize?: number;
    } = {}
  ): Promise<T> {
    if (!this.enabled) {
      return queryFn();
    }

    const startTime = performance.now();
    const timestamp = Date.now();

    return queryFn()
      .then((result) => {
        const duration = performance.now() - startTime;
        const dataSize = this.estimateDataSize(result);

        const metric: QueryMetrics = {
          queryType,
          duration,
          timestamp,
          success: true,
          dataSize,
          cacheHit: options.cacheHit,
        };

        this.addMetric(metric);

        // Log slow queries
        if (duration > this.slowQueryThreshold) {
          safeConsole.warn(`🐌 Slow query detected: ${queryType} took ${duration.toFixed(2)}ms`);
        }

        // Log cache performance
        if (options.cacheHit !== undefined) {
          safeConsole.log(
            `💾 Cache ${options.cacheHit ? 'HIT' : 'MISS'}: ${queryType} (${duration.toFixed(2)}ms)`
          );
        }

        return result;
      })
      .catch((error) => {
        const duration = performance.now() - startTime;

        const metric: QueryMetrics = {
          queryType,
          duration,
          timestamp,
          success: false,
          error: error.message,
          cacheHit: options.cacheHit,
        };

        this.addMetric(metric);

        safeConsole.error(`❌ Query failed: ${queryType} (${duration.toFixed(2)}ms)`, error);
        throw error;
      });
  }

  /**
   * Get performance statistics
   */
  getStats(): PerformanceStats {
    if (this.metrics.length === 0) {
      return {
        totalQueries: 0,
        averageResponseTime: 0,
        errorRate: 0,
        cacheHitRate: 0,
        slowQueries: [],
        recentQueries: [],
      };
    }

    const totalQueries = this.metrics.length;
    const successfulQueries = this.metrics.filter((m) => m.success);
    const failedQueries = this.metrics.filter((m) => !m.success);
    const queriesWithCache = this.metrics.filter((m) => m.cacheHit !== undefined);
    const cacheHits = this.metrics.filter((m) => m.cacheHit === true);

    const averageResponseTime =
      successfulQueries.length > 0
        ? successfulQueries.reduce((sum, m) => sum + m.duration, 0) / successfulQueries.length
        : 0;

    const errorRate = totalQueries > 0 ? (failedQueries.length / totalQueries) * 100 : 0;
    const cacheHitRate =
      queriesWithCache.length > 0 ? (cacheHits.length / queriesWithCache.length) * 100 : 0;

    const slowQueries = this.metrics
      .filter((m) => m.duration > this.slowQueryThreshold)
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 10);

    const recentQueries = this.metrics.slice(-20).reverse();

    return {
      totalQueries,
      averageResponseTime,
      errorRate,
      cacheHitRate,
      slowQueries,
      recentQueries,
    };
  }

  /**
   * Get query type breakdown
   */
  getQueryTypeBreakdown(): Record<
    string,
    {
      count: number;
      averageTime: number;
      errorRate: number;
      cacheHitRate: number;
    }
  > {
    const breakdown: Record<
      string,
      {
        queries: QueryMetrics[];
        count: number;
        averageTime: number;
        errorRate: number;
        cacheHitRate: number;
      }
    > = {};

    this.metrics.forEach((metric) => {
      if (!breakdown[metric.queryType]) {
        breakdown[metric.queryType] = {
          queries: [],
          count: 0,
          averageTime: 0,
          errorRate: 0,
          cacheHitRate: 0,
        };
      }
      breakdown[metric.queryType].queries.push(metric);
    });

    Object.keys(breakdown).forEach((queryType) => {
      const queries = breakdown[queryType].queries;
      const successfulQueries = queries.filter((q) => q.success);
      const failedQueries = queries.filter((q) => !q.success);
      const queriesWithCache = queries.filter((q) => q.cacheHit !== undefined);
      const cacheHits = queries.filter((q) => q.cacheHit === true);

      breakdown[queryType].count = queries.length;
      breakdown[queryType].averageTime =
        successfulQueries.length > 0
          ? successfulQueries.reduce((sum, q) => sum + q.duration, 0) / successfulQueries.length
          : 0;
      breakdown[queryType].errorRate =
        queries.length > 0 ? (failedQueries.length / queries.length) * 100 : 0;
      breakdown[queryType].cacheHitRate =
        queriesWithCache.length > 0 ? (cacheHits.length / queriesWithCache.length) * 100 : 0;

      // Remove queries array from final result
      delete (breakdown[queryType] as { queries?: QueryMetrics[] }).queries;
    });

    return breakdown;
  }

  /**
   * Get performance recommendations
   */
  getRecommendations(): string[] {
    const stats = this.getStats();
    const breakdown = this.getQueryTypeBreakdown();
    const recommendations: string[] = [];

    // Check average response time
    if (stats.averageResponseTime > 500) {
      recommendations.push(
        '⚠️ Average response time is high (>500ms). Consider query optimization.'
      );
    }

    // Check error rate
    if (stats.errorRate > 5) {
      recommendations.push(
        '❌ High error rate detected (>5%). Check error handling and retry logic.'
      );
    }

    // Check cache hit rate
    if (stats.cacheHitRate < 70) {
      recommendations.push(
        '💾 Low cache hit rate (<70%). Consider increasing cache duration or improving cache strategy.'
      );
    }

    // Check slow queries
    if (stats.slowQueries.length > 0) {
      const slowestQuery = stats.slowQueries[0];
      recommendations.push(
        `🐌 Slow query detected: ${slowestQuery.queryType} (${slowestQuery.duration.toFixed(2)}ms). Consider optimization.`
      );
    }

    // Check query type performance
    Object.entries(breakdown).forEach(([queryType, data]) => {
      if (data.averageTime > 1000) {
        recommendations.push(
          `⏱️ ${queryType} queries are slow (${data.averageTime.toFixed(2)}ms average). Consider optimization.`
        );
      }
      if (data.errorRate > 10) {
        recommendations.push(
          `💥 ${queryType} has high error rate (${data.errorRate.toFixed(1)}%). Check implementation.`
        );
      }
    });

    if (recommendations.length === 0) {
      recommendations.push('✅ Performance looks good! No immediate optimizations needed.');
    }

    return recommendations;
  }

  /**
   * Clear metrics
   */
  clearMetrics() {
    this.metrics = [];
    safeConsole.log('🧹 Performance metrics cleared');
  }

  /**
   * Enable/disable monitoring
   */
  setEnabled(enabled: boolean) {
    this.enabled = enabled;
    safeConsole.log(`📊 Performance monitoring ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Export metrics for analysis
   */
  exportMetrics(): string {
    return JSON.stringify(
      {
        timestamp: new Date().toISOString(),
        stats: this.getStats(),
        breakdown: this.getQueryTypeBreakdown(),
        recommendations: this.getRecommendations(),
        rawMetrics: this.metrics,
      },
      null,
      2
    );
  }

  /**
   * Add metric to collection
   */
  private addMetric(metric: QueryMetrics) {
    this.metrics.push(metric);

    // Keep only recent metrics to prevent memory issues
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }
  }

  /**
   * Estimate data size from result
   */
  private estimateDataSize(data: unknown): number {
    try {
      return JSON.stringify(data).length;
    } catch {
      return 0;
    }
  }
}

// Global instance
export const performanceMonitor = new PerformanceMonitor();

/**
 * Decorator untuk automatic query tracking
 */
export function trackPerformance(_queryType: string) {
  return (target: object, propertyName: string, descriptor: PropertyDescriptor) => {
    const method = descriptor.value;

    descriptor.value = function (...args: unknown[]) {
      return performanceMonitor.trackQuery(`${target.constructor.name}.${propertyName}`, () =>
        method.apply(this, args)
      );
    };
  };
}

/**
 * Hook untuk performance monitoring dalam React components
 */
export const usePerformanceMonitor = () => {
  return {
    trackQuery: performanceMonitor.trackQuery.bind(performanceMonitor),
    getStats: performanceMonitor.getStats.bind(performanceMonitor),
    getRecommendations: performanceMonitor.getRecommendations.bind(performanceMonitor),
    clearMetrics: performanceMonitor.clearMetrics.bind(performanceMonitor),
    exportMetrics: performanceMonitor.exportMetrics.bind(performanceMonitor),
  };
};
