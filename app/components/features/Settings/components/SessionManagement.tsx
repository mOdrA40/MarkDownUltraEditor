import { Monitor } from 'lucide-react';
import type React from 'react';
import { memo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SESSION_CONSTANTS } from '../constants';
import { useSessionManagement } from '../hooks/useSessionManagement';

/**
 * Session management component
 */
export const SessionManagement: React.FC = memo(() => {
  const { state, actions } = useSessionManagement();

  return (
    <Card>
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
          <Monitor className="w-5 h-5" />
          Session Management
        </CardTitle>
        <CardDescription className="text-sm">
          View and manage your active sessions across devices
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 p-4 sm:p-6">
        {state.sessionStats && (
          <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-3">
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="text-2xl font-bold">{state.sessionStats.activeSessions}</div>
              <div className="text-sm text-muted-foreground">Active Sessions</div>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="text-2xl font-bold">{state.sessionStats.uniqueIPs}</div>
              <div className="text-sm text-muted-foreground">Unique Locations</div>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="text-2xl font-bold">
                {state.sessionStats.suspiciousActivity?.length || 0}
              </div>
              <div className="text-sm text-muted-foreground">Security Alerts</div>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Recent Sessions</h4>
            <Button
              variant="outline"
              size="sm"
              onClick={actions.terminateAllOtherSessions}
              disabled={state.isLoading}
            >
              Terminate All Others
            </Button>
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto">
            {state.userSessions.length > 0 ? (
              state.userSessions
                .slice(0, SESSION_CONSTANTS.MAX_SESSIONS_DISPLAY)
                .map((session, index) => (
                  <div
                    key={session.id || index}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div className="text-sm font-medium">
                          {session.device_info?.browser} on {session.device_info?.os}
                        </div>
                        {Boolean(
                          (session.security_flags as Record<string, unknown>)?.new_location
                        ) && (
                          <Badge variant="outline" className="text-xs">
                            New Location
                          </Badge>
                        )}
                        {Boolean(
                          (session.security_flags as Record<string, unknown>)?.new_device
                        ) && (
                          <Badge variant="outline" className="text-xs">
                            New Device
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {session.location?.city && session.location?.country
                          ? `${session.location.city}, ${session.location.country}`
                          : 'Unknown location'}{' '}
                        • {session.ip_address || 'Unknown IP'}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Last active:{' '}
                        {session.last_activity
                          ? (() => {
                              const date = new Date(session.last_activity);
                              return Number.isNaN(date.getTime())
                                ? 'Unknown'
                                : date.toLocaleString();
                            })()
                          : 'Unknown'}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => actions.terminateSession(session.session_id)}
                      disabled={state.isLoading}
                    >
                      Terminate
                    </Button>
                  </div>
                ))
            ) : (
              <div className="text-center py-4 text-muted-foreground">No active sessions found</div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

SessionManagement.displayName = 'SessionManagement';
