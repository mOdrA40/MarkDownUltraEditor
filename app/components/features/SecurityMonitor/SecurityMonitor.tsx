/**
 * @fileoverview Security Monitor component for settings page
 * @author Axel Modra
 */

import { AlertTriangle, Eye, Shield, ShieldCheck, Zap } from 'lucide-react';
import type React from 'react';
import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { SecurityUtils } from '@/utils/security';

interface SecurityStatus {
  level: 'low' | 'medium' | 'high' | 'critical';
  score: number;
  issues: string[];
  recommendations: string[];
}

interface SecurityMonitorProps {
  className?: string;
}

/**
 * Security Monitor Component
 */
export const SecurityMonitor: React.FC<SecurityMonitorProps> = ({ className = '' }) => {
  const [securityStatus, setSecurityStatus] = useState<SecurityStatus>({
    level: 'medium',
    score: 75,
    issues: [],
    recommendations: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkSecurityStatus = async () => {
      setIsLoading(true);
      try {
        // Get security statistics
        const stats = SecurityUtils.getSecurityStats();
        const _alerts = SecurityUtils.getRecentAlerts(24);

        // Calculate security score based on recent activity
        let score = 100;
        const issues: string[] = [];
        const recommendations: string[] = [];

        // Check for recent security events
        if (stats.unresolvedAlerts > 0) {
          score -= stats.unresolvedAlerts * 10;
          issues.push(`${stats.unresolvedAlerts} unresolved security alerts`);
          recommendations.push('Review and resolve security alerts');
        }

        if (stats.totalEvents > 50) {
          score -= 15;
          issues.push('High security event activity detected');
          recommendations.push('Monitor security events more closely');
        }

        // Check browser security features
        if (typeof window !== 'undefined') {
          if (!window.location.protocol.startsWith('https')) {
            score -= 20;
            issues.push('Connection is not secure (HTTP)');
            recommendations.push('Use HTTPS for secure connection');
          }

          if (!navigator.cookieEnabled) {
            score -= 10;
            issues.push('Cookies are disabled');
            recommendations.push('Enable cookies for better security');
          }
        }

        // Determine security level
        let level: SecurityStatus['level'] = 'high';
        if (score < 30) level = 'critical';
        else if (score < 60) level = 'medium';
        else if (score < 80) level = 'low';

        setSecurityStatus({
          level,
          score: Math.max(0, score),
          issues,
          recommendations,
        });
      } catch (error) {
        import('@/utils/console').then(({ safeConsole }) => {
          safeConsole.error('Error checking security status:', error);
        });
        setSecurityStatus({
          level: 'medium',
          score: 50,
          issues: ['Unable to check security status'],
          recommendations: ['Refresh page to retry security check'],
        });
      } finally {
        setIsLoading(false);
      }
    };

    checkSecurityStatus();

    // Refresh security status every 5 minutes
    const interval = setInterval(checkSecurityStatus, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const getSecurityIcon = () => {
    switch (securityStatus.level) {
      case 'critical':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'medium':
        return <Shield className="w-5 h-5 text-yellow-500" />;
      case 'low':
        return <ShieldCheck className="w-5 h-5 text-blue-500" />;
      case 'high':
        return <ShieldCheck className="w-5 h-5 text-green-500" />;
      default:
        return <Shield className="w-5 h-5" />;
    }
  };

  const getSecurityColor = () => {
    switch (securityStatus.level) {
      case 'critical':
        return 'text-red-600 dark:text-red-400';
      case 'medium':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'low':
        return 'text-blue-600 dark:text-blue-400';
      case 'high':
        return 'text-green-600 dark:text-green-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getProgressColor = () => {
    switch (securityStatus.level) {
      case 'critical':
        return 'bg-red-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-blue-500';
      case 'high':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Security Monitor
          </CardTitle>
          <CardDescription>Checking security status...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4" />
            <div className="h-2 bg-gray-200 rounded" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getSecurityIcon()}
          Security Monitor
        </CardTitle>
        <CardDescription>Current security status and recommendations</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Security Score */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Security Score</span>
            <span className={`text-sm font-bold ${getSecurityColor()}`}>
              {securityStatus.score}/100
            </span>
          </div>
          <Progress value={securityStatus.score} className="h-2">
            <div
              className={`h-full rounded-full transition-all ${getProgressColor()}`}
              style={{ width: `${securityStatus.score}%` }}
            />
          </Progress>
          <div className="flex items-center gap-2">
            <Badge
              variant={securityStatus.level === 'high' ? 'default' : 'secondary'}
              className={getSecurityColor()}
            >
              {securityStatus.level.toUpperCase()}
            </Badge>
            <span className="text-xs text-muted-foreground">Security Level</span>
          </div>
        </div>

        {/* Issues */}
        {securityStatus.issues.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-500" />
              Security Issues
            </h4>
            <ul className="space-y-1">
              {securityStatus.issues.map((issue) => (
                <li key={issue} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="w-1 h-1 bg-yellow-500 rounded-full mt-2 flex-shrink-0" />
                  {issue}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Recommendations */}
        {securityStatus.recommendations.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Zap className="w-4 h-4 text-blue-500" />
              Recommendations
            </h4>
            <ul className="space-y-1">
              {securityStatus.recommendations.map((rec) => (
                <li key={rec} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="w-1 h-1 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-4 border-t">
          <Button variant="outline" size="sm">
            <Eye className="w-4 h-4 mr-2" />
            View Details
          </Button>
          <Button variant="outline" size="sm">
            <Shield className="w-4 h-4 mr-2" />
            Security Settings
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SecurityMonitor;
