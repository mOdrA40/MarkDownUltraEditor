/**
 * @fileoverview Security monitoring and alerting system
 * @author Security Team
 * @version 1.0.0
 */

import { generateSecureToken } from './core';
import {
  SECURITY_CONSTANTS,
  type SecurityAlert,
  type SecurityAuditLog,
  type SecurityContext,
  type SecurityEvent,
  SecurityEventType,
  SecurityRiskLevel,
} from './types';

/**
 * Security monitoring configuration
 */
interface SecurityMonitoringConfig {
  readonly enabled: boolean;
  readonly alertThresholds: Record<SecurityEventType, number>;
  readonly timeWindows: Record<SecurityEventType, number>;
  readonly logRetentionDays: number;
  readonly enableRealTimeAlerts: boolean;
  readonly enableAuditLogging: boolean;
}

/**
 * Default monitoring configuration
 */
const DEFAULT_MONITORING_CONFIG: SecurityMonitoringConfig = {
  enabled: true,
  alertThresholds: {
    [SecurityEventType.AUTHENTICATION_FAILURE]: 5,
    [SecurityEventType.RATE_LIMIT_EXCEEDED]: 10,
    [SecurityEventType.SUSPICIOUS_ACTIVITY]: 3,
    [SecurityEventType.INPUT_VALIDATION_FAILURE]: 20,
    [SecurityEventType.FILE_UPLOAD_BLOCKED]: 5,
    [SecurityEventType.XSS_ATTEMPT]: 1,
    [SecurityEventType.SQL_INJECTION_ATTEMPT]: 1,
    [SecurityEventType.CSRF_TOKEN_MISMATCH]: 3,
    [SecurityEventType.SESSION_HIJACK_ATTEMPT]: 1,
    [SecurityEventType.BRUTE_FORCE_ATTEMPT]: 3,
    [SecurityEventType.DATA_BREACH_ATTEMPT]: 1,
    [SecurityEventType.PRIVILEGE_ESCALATION]: 1,
    [SecurityEventType.SECURITY_SCAN_DETECTED]: 5,
    [SecurityEventType.AUTHENTICATION_ATTEMPT]: 50,
    [SecurityEventType.AUTHENTICATION_SUCCESS]: 100,
    [SecurityEventType.AUTHORIZATION_FAILURE]: 10,
    [SecurityEventType.FILE_UPLOAD_ATTEMPT]: 20,
    [SecurityEventType.UNAUTHORIZED_ACCESS]: 10,
    [SecurityEventType.MALICIOUS_INPUT]: 5,
    [SecurityEventType.ROUTE_ACCESS]: 1000,
    [SecurityEventType.SECURITY_ERROR]: 5,
  },
  timeWindows: {
    [SecurityEventType.AUTHENTICATION_FAILURE]: 15 * 60 * 1000, // 15 minutes
    [SecurityEventType.RATE_LIMIT_EXCEEDED]: 5 * 60 * 1000, // 5 minutes
    [SecurityEventType.SUSPICIOUS_ACTIVITY]: 10 * 60 * 1000, // 10 minutes
    [SecurityEventType.INPUT_VALIDATION_FAILURE]: 60 * 60 * 1000, // 1 hour
    [SecurityEventType.FILE_UPLOAD_BLOCKED]: 30 * 60 * 1000, // 30 minutes
    [SecurityEventType.XSS_ATTEMPT]: 5 * 60 * 1000, // 5 minutes
    [SecurityEventType.SQL_INJECTION_ATTEMPT]: 5 * 60 * 1000, // 5 minutes
    [SecurityEventType.CSRF_TOKEN_MISMATCH]: 15 * 60 * 1000, // 15 minutes
    [SecurityEventType.SESSION_HIJACK_ATTEMPT]: 5 * 60 * 1000, // 5 minutes
    [SecurityEventType.BRUTE_FORCE_ATTEMPT]: 30 * 60 * 1000, // 30 minutes
    [SecurityEventType.DATA_BREACH_ATTEMPT]: 1 * 60 * 1000, // 1 minute
    [SecurityEventType.PRIVILEGE_ESCALATION]: 5 * 60 * 1000, // 5 minutes
    [SecurityEventType.SECURITY_SCAN_DETECTED]: 60 * 60 * 1000, // 1 hour
    [SecurityEventType.AUTHENTICATION_ATTEMPT]: 60 * 60 * 1000, // 1 hour
    [SecurityEventType.AUTHENTICATION_SUCCESS]: 60 * 60 * 1000, // 1 hour
    [SecurityEventType.AUTHORIZATION_FAILURE]: 30 * 60 * 1000, // 30 minutes
    [SecurityEventType.FILE_UPLOAD_ATTEMPT]: 60 * 60 * 1000, // 1 hour
    [SecurityEventType.UNAUTHORIZED_ACCESS]: 15 * 60 * 1000, // 15 minutes
    [SecurityEventType.MALICIOUS_INPUT]: 30 * 60 * 1000, // 30 minutes
    [SecurityEventType.ROUTE_ACCESS]: 60 * 60 * 1000, // 1 hour
    [SecurityEventType.SECURITY_ERROR]: 30 * 60 * 1000, // 30 minutes
  },
  logRetentionDays: SECURITY_CONSTANTS.SECURITY_LOG_RETENTION_DAYS,
  enableRealTimeAlerts: true,
  enableAuditLogging: true,
};

/**
 * Security monitoring service
 */
export class SecurityMonitor {
  private readonly events: SecurityEvent[] = [];
  private readonly alerts: SecurityAlert[] = [];
  private readonly auditLogs: SecurityAuditLog[] = [];
  private readonly config: SecurityMonitoringConfig;
  private readonly eventCounts = new Map<string, { count: number; firstSeen: number }>();

  constructor(config: Partial<SecurityMonitoringConfig> = {}) {
    this.config = { ...DEFAULT_MONITORING_CONFIG, ...config };

    // Start cleanup interval
    if (typeof window === 'undefined') {
      setInterval(() => this.cleanup(), 60 * 60 * 1000); // Cleanup every hour
    }
  }

  /**
   * Log security event
   */
  public logEvent(event: SecurityEvent): void {
    if (!this.config.enabled) return;

    // Store event
    this.events.push(event);

    // Update event counts
    const key = this.getEventKey(event);
    const existing = this.eventCounts.get(key);
    const now = Date.now();

    if (existing) {
      // Check if within time window
      const timeWindow = this.config.timeWindows[event.type];
      if (now - existing.firstSeen <= timeWindow) {
        this.eventCounts.set(key, {
          count: existing.count + 1,
          firstSeen: existing.firstSeen,
        });
      } else {
        // Reset counter for new time window
        this.eventCounts.set(key, {
          count: 1,
          firstSeen: now,
        });
      }
    } else {
      this.eventCounts.set(key, {
        count: 1,
        firstSeen: now,
      });
    }

    // Check for alert conditions
    this.checkAlertConditions(event);

    // Security logging disabled for production-ready deployment
    // Log to console in development - DISABLED
    // if (process.env.NODE_ENV === 'development') {
    //   import('@/utils/console').then(({ safeConsole }) => {
    //     safeConsole.security('Security Event:', {
    //       type: event.type,
    //       riskLevel: event.riskLevel,
    //       details: event.details,
    //       timestamp: event.timestamp,
    //     });
    //   });
    // }
  }

  /**
   * Log audit event
   */
  public logAudit(
    action: string,
    resource: string,
    outcome: 'success' | 'failure' | 'blocked',
    details: Record<string, unknown> = {},
    context?: SecurityContext
  ): void {
    if (!this.config.enableAuditLogging) return;

    const auditLog: SecurityAuditLog = {
      id: generateSecureToken(16),
      timestamp: new Date(),
      userId: context?.userId,
      action,
      resource,
      outcome,
      details,
      ipAddress: context?.ipAddress,
      userAgent: context?.userAgent,
    };

    this.auditLogs.push(auditLog);

    // Log to console in development - DISABLED for production
    // if (process.env.NODE_ENV === "development") {
    //   import("@/utils/console").then(({ safeConsole }) => {
    //     safeConsole.log("Audit Log:", auditLog);
    //   });
    // }
  }

  /**
   * Check alert conditions and create alerts
   */
  private checkAlertConditions(event: SecurityEvent): void {
    if (!this.config.enableRealTimeAlerts) return;

    const key = this.getEventKey(event);
    const eventCount = this.eventCounts.get(key);
    const threshold = this.config.alertThresholds[event.type];

    if (eventCount && eventCount.count >= threshold) {
      this.createAlert(event, eventCount.count);
    }

    // Create immediate alerts for critical events
    if (event.riskLevel === SecurityRiskLevel.CRITICAL) {
      this.createAlert(event, 1);
    }
  }

  /**
   * Create security alert
   */
  private createAlert(event: SecurityEvent, eventCount: number): void {
    const alert: SecurityAlert = {
      id: generateSecureToken(16),
      type: event.type,
      severity: event.riskLevel,
      message: this.generateAlertMessage(event, eventCount),
      timestamp: new Date(),
      affectedResources: [event.resource || 'unknown'],
      recommendedActions: this.getRecommendedActions(event.type),
      isResolved: false,
    };

    this.alerts.push(alert);

    // Log alert - DISABLED for production
    // import("@/utils/console").then(({ safeConsole }) => {
    //   safeConsole.error("Security Alert:", alert);
    // });

    // In production, you would send this to your monitoring service
    if (process.env.NODE_ENV === 'production') {
      this.sendToMonitoringService(alert);
    }
  }

  /**
   * Generate alert message
   */
  private generateAlertMessage(event: SecurityEvent, eventCount: number): string {
    const messages: Record<SecurityEventType, string> = {
      [SecurityEventType.AUTHENTICATION_FAILURE]: `${eventCount} failed authentication attempts detected`,
      [SecurityEventType.RATE_LIMIT_EXCEEDED]: `Rate limit exceeded ${eventCount} times`,
      [SecurityEventType.SUSPICIOUS_ACTIVITY]: `${eventCount} suspicious activities detected`,
      [SecurityEventType.INPUT_VALIDATION_FAILURE]: `${eventCount} input validation failures`,
      [SecurityEventType.FILE_UPLOAD_BLOCKED]: `${eventCount} file uploads blocked`,
      [SecurityEventType.XSS_ATTEMPT]: 'XSS attempt detected',
      [SecurityEventType.SQL_INJECTION_ATTEMPT]: 'SQL injection attempt detected',
      [SecurityEventType.CSRF_TOKEN_MISMATCH]: `${eventCount} CSRF token mismatches`,
      [SecurityEventType.SESSION_HIJACK_ATTEMPT]: 'Session hijacking attempt detected',
      [SecurityEventType.BRUTE_FORCE_ATTEMPT]: `${eventCount} brute force attempts`,
      [SecurityEventType.DATA_BREACH_ATTEMPT]: 'Data breach attempt detected',
      [SecurityEventType.PRIVILEGE_ESCALATION]: 'Privilege escalation attempt detected',
      [SecurityEventType.SECURITY_SCAN_DETECTED]: `${eventCount} security scans detected`,
      [SecurityEventType.AUTHENTICATION_ATTEMPT]: `${eventCount} authentication attempts`,
      [SecurityEventType.AUTHENTICATION_SUCCESS]: `${eventCount} successful authentications`,
      [SecurityEventType.AUTHORIZATION_FAILURE]: `${eventCount} authorization failures`,
      [SecurityEventType.FILE_UPLOAD_ATTEMPT]: `${eventCount} file upload attempts`,
      [SecurityEventType.UNAUTHORIZED_ACCESS]: `${eventCount} unauthorized access attempts`,
      [SecurityEventType.MALICIOUS_INPUT]: `${eventCount} malicious input attempts`,
      [SecurityEventType.ROUTE_ACCESS]: `${eventCount} route access events`,
      [SecurityEventType.SECURITY_ERROR]: `${eventCount} security errors`,
    };

    return messages[event.type] || `Security event: ${event.type}`;
  }

  /**
   * Get recommended actions for event type
   */
  private getRecommendedActions(eventType: SecurityEventType): string[] {
    const actions: Record<SecurityEventType, string[]> = {
      [SecurityEventType.AUTHENTICATION_FAILURE]: [
        'Review authentication logs',
        'Consider implementing account lockout',
        'Check for credential stuffing attacks',
      ],
      [SecurityEventType.RATE_LIMIT_EXCEEDED]: [
        'Review rate limiting configuration',
        'Consider blocking suspicious IPs',
        'Implement progressive delays',
      ],
      [SecurityEventType.SUSPICIOUS_ACTIVITY]: [
        'Investigate user activity',
        'Review access patterns',
        'Consider temporary account suspension',
      ],
      [SecurityEventType.XSS_ATTEMPT]: [
        'Review input validation',
        'Update Content Security Policy',
        'Scan for vulnerabilities',
      ],
      [SecurityEventType.SQL_INJECTION_ATTEMPT]: [
        'Review database queries',
        'Implement parameterized queries',
        'Update input validation',
      ],
      [SecurityEventType.BRUTE_FORCE_ATTEMPT]: [
        'Implement account lockout',
        'Add CAPTCHA verification',
        'Block suspicious IP addresses',
      ],
      [SecurityEventType.DATA_BREACH_ATTEMPT]: [
        'Immediate security review',
        'Check data access logs',
        'Consider incident response plan',
      ],
      [SecurityEventType.PRIVILEGE_ESCALATION]: [
        'Review user permissions',
        'Audit role assignments',
        'Implement principle of least privilege',
      ],
      [SecurityEventType.SESSION_HIJACK_ATTEMPT]: [
        'Force session regeneration',
        'Review session security',
        'Implement additional authentication',
      ],
      [SecurityEventType.CSRF_TOKEN_MISMATCH]: [
        'Review CSRF protection',
        'Check token generation',
        'Validate referrer headers',
      ],
      [SecurityEventType.FILE_UPLOAD_BLOCKED]: [
        'Review file upload policies',
        'Scan uploaded files',
        'Update file type restrictions',
      ],
      [SecurityEventType.INPUT_VALIDATION_FAILURE]: [
        'Review input validation rules',
        'Update sanitization logic',
        'Check for bypass attempts',
      ],
      [SecurityEventType.SECURITY_SCAN_DETECTED]: [
        'Review security configuration',
        'Check for vulnerabilities',
        'Consider blocking scanner IPs',
      ],
      [SecurityEventType.AUTHENTICATION_ATTEMPT]: [
        'Monitor for patterns',
        'Review authentication logs',
      ],
      [SecurityEventType.AUTHENTICATION_SUCCESS]: [
        'Monitor for unusual patterns',
        'Review successful logins',
      ],
      [SecurityEventType.AUTHORIZATION_FAILURE]: [
        'Review access controls',
        'Check user permissions',
      ],
      [SecurityEventType.FILE_UPLOAD_ATTEMPT]: ['Monitor upload patterns', 'Review file types'],
      [SecurityEventType.UNAUTHORIZED_ACCESS]: [
        'Review access controls',
        'Check authentication status',
        'Investigate access patterns',
      ],
      [SecurityEventType.MALICIOUS_INPUT]: [
        'Review input validation',
        'Update sanitization rules',
        'Block suspicious patterns',
      ],
      [SecurityEventType.ROUTE_ACCESS]: ['Monitor access patterns', 'Review route permissions'],
      [SecurityEventType.SECURITY_ERROR]: [
        'Review error logs',
        'Check system configuration',
        'Investigate root cause',
      ],
    };

    return actions[eventType] || ['Review security logs', 'Investigate further'];
  }

  /**
   * Generate event key for counting
   */
  private getEventKey(event: SecurityEvent): string {
    return `${event.type}:${event.userId || event.ipAddress || 'unknown'}`;
  }

  /**
   * Send alert to monitoring service
   */
  private sendToMonitoringService(_alert: SecurityAlert): void {
    // In a real implementation, this would send to your monitoring service
    // e.g., Sentry, DataDog, New Relic, etc.
    // Console logging disabled for production
    // import("@/utils/console").then(({ safeConsole }) => {
    //   safeConsole.log("Sending alert to monitoring service:", alert);
    // });
  }

  /**
   * Get security events
   */
  public getEvents(filter?: {
    type?: SecurityEventType;
    riskLevel?: SecurityRiskLevel;
    userId?: string;
    since?: Date;
  }): SecurityEvent[] {
    let events = [...this.events];

    if (filter) {
      if (filter.type) {
        events = events.filter((e) => e.type === filter.type);
      }
      if (filter.riskLevel) {
        events = events.filter((e) => e.riskLevel === filter.riskLevel);
      }
      if (filter.userId) {
        events = events.filter((e) => e.userId === filter.userId);
      }
      if (filter.since) {
        const sinceDate = filter.since;
        events = events.filter((e) => e.timestamp >= sinceDate);
      }
    }

    return events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  /**
   * Get security alerts
   */
  public getAlerts(unresolved = false): SecurityAlert[] {
    const alerts = unresolved ? this.alerts.filter((a) => !a.isResolved) : [...this.alerts];

    return alerts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  /**
   * Get audit logs
   */
  public getAuditLogs(filter?: {
    userId?: string;
    action?: string;
    resource?: string;
    outcome?: 'success' | 'failure' | 'blocked';
    since?: Date;
  }): SecurityAuditLog[] {
    let logs = [...this.auditLogs];

    if (filter) {
      if (filter.userId) {
        logs = logs.filter((l) => l.userId === filter.userId);
      }
      if (filter.action) {
        logs = logs.filter((l) => l.action === filter.action);
      }
      if (filter.resource) {
        logs = logs.filter((l) => l.resource === filter.resource);
      }
      if (filter.outcome) {
        logs = logs.filter((l) => l.outcome === filter.outcome);
      }
      if (filter.since) {
        const sinceDate = filter.since;
        logs = logs.filter((l) => l.timestamp >= sinceDate);
      }
    }

    return logs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  /**
   * Resolve alert
   */
  public resolveAlert(alertId: string): boolean {
    const alert = this.alerts.find((a) => a.id === alertId);
    if (alert) {
      (alert as { isResolved: boolean }).isResolved = true;
      return true;
    }
    return false;
  }

  /**
   * Cleanup old events and logs
   */
  private cleanup(): void {
    const cutoffDate = new Date(Date.now() - this.config.logRetentionDays * 24 * 60 * 60 * 1000);

    // Remove old events
    const eventsBefore = this.events.length;
    this.events.splice(
      0,
      this.events.findIndex((e) => e.timestamp >= cutoffDate)
    );

    // Remove old audit logs
    const auditBefore = this.auditLogs.length;
    this.auditLogs.splice(
      0,
      this.auditLogs.findIndex((l) => l.timestamp >= cutoffDate)
    );

    // Clean up event counts
    const now = Date.now();
    for (const [key, data] of this.eventCounts.entries()) {
      if (now - data.firstSeen > Math.max(...Object.values(this.config.timeWindows))) {
        this.eventCounts.delete(key);
      }
    }

    if (process.env.NODE_ENV === 'development') {
      import('@/utils/console').then(({ safeConsole }) => {
        safeConsole.log(
          `Cleaned up ${eventsBefore - this.events.length} events and ${
            auditBefore - this.auditLogs.length
          } audit logs`
        );
      });
    }
  }

  /**
   * Get monitoring statistics
   */
  public getStats(): {
    totalEvents: number;
    totalAlerts: number;
    unresolvedAlerts: number;
    totalAuditLogs: number;
    eventsByType: Record<SecurityEventType, number>;
    alertsBySeverity: Record<SecurityRiskLevel, number>;
  } {
    const eventsByType = {} as Record<SecurityEventType, number>;
    const alertsBySeverity = {} as Record<SecurityRiskLevel, number>;

    // Count events by type
    for (const event of this.events) {
      eventsByType[event.type] = (eventsByType[event.type] || 0) + 1;
    }

    // Count alerts by severity
    for (const alert of this.alerts) {
      alertsBySeverity[alert.severity] = (alertsBySeverity[alert.severity] || 0) + 1;
    }

    return {
      totalEvents: this.events.length,
      totalAlerts: this.alerts.length,
      unresolvedAlerts: this.alerts.filter((a) => !a.isResolved).length,
      totalAuditLogs: this.auditLogs.length,
      eventsByType,
      alertsBySeverity,
    };
  }
}

/**
 * Global security monitor instance
 */
export const securityMonitor = new SecurityMonitor();
