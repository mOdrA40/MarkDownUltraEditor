import { useUser } from '@clerk/react-router';
import { Edit, Loader2, User, X } from 'lucide-react';
import type React from 'react';
import { memo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAccountActions } from '../hooks/useAccountActions';

interface AccountInfoProps {
  isEditingName: boolean;
  editFirstName: string;
  editLastName: string;
  onSetIsEditingName: (editing: boolean) => void;
  onSetEditFirstName: (name: string) => void;
  onSetEditLastName: (name: string) => void;
}

/**
 * Account information component
 */
export const AccountInfo: React.FC<AccountInfoProps> = memo(
  ({
    isEditingName,
    editFirstName,
    editLastName,
    onSetIsEditingName,
    onSetEditFirstName,
    onSetEditLastName,
  }) => {
    const { user } = useUser();
    const { actions } = useAccountActions();
    const [isExporting, setIsExporting] = useState(false);

    if (!user) return null;

    return (
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <User className="w-5 h-5" />
            Account Information
          </CardTitle>
          <CardDescription className="text-sm">
            Manage your account details and preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
            {user.imageUrl && (
              <img
                src={user.imageUrl}
                alt={user.fullName || 'User'}
                className="w-12 h-12 sm:w-16 sm:h-16 rounded-full"
              />
            )}
            <div className="min-w-0">
              <h3 className="text-base sm:text-lg font-medium">{user.fullName || 'User'}</h3>
              <p className="text-xs sm:text-sm text-muted-foreground break-all">
                {user.primaryEmailAddress?.emailAddress}
              </p>
              <Badge variant="secondary" className="mt-1 text-xs">
                {typeof user.publicMetadata?.role === 'string' ? user.publicMetadata.role : 'User'}
              </Badge>
            </div>
          </div>

          {/* Name Fields */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">Name Information</h4>
              {!isEditingName ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    onSetIsEditingName(true);
                    onSetEditFirstName(user.firstName || '');
                    onSetEditLastName(user.lastName || '');
                  }}
                  className="text-xs sm:text-sm"
                >
                  <Edit className="w-3 h-3 mr-1" />
                  <span className="hidden xs:inline">Edit</span>
                </Button>
              ) : (
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={async () => {
                      if (editFirstName.trim() || editLastName.trim()) {
                        await actions.updateName(editFirstName.trim(), editLastName.trim());
                      }
                      onSetIsEditingName(false);
                      onSetEditFirstName('');
                      onSetEditLastName('');
                    }}
                    className="text-xs sm:text-sm text-green-600 hover:text-green-700"
                  >
                    ✓
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      onSetIsEditingName(false);
                      onSetEditFirstName('');
                      onSetEditLastName('');
                    }}
                    className="text-xs sm:text-sm"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="firstName" className="text-sm font-medium">
                  First Name
                </label>
                {isEditingName ? (
                  <Input
                    id="firstName"
                    value={editFirstName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      onSetEditFirstName(e.target.value);
                    }}
                    placeholder="Enter first name"
                  />
                ) : (
                  <p className="text-sm text-muted-foreground py-2">
                    {user.firstName || 'Not set'}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="lastName" className="text-sm font-medium">
                  Last Name
                </label>
                {isEditingName ? (
                  <Input
                    id="lastName"
                    value={editLastName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      onSetEditLastName(e.target.value);
                    }}
                    placeholder="Enter last name"
                  />
                ) : (
                  <p className="text-sm text-muted-foreground py-2">{user.lastName || 'Not set'}</p>
                )}
              </div>
            </div>
          </div>

          {/* Other Account Information */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <div className="text-sm font-medium">Member Since</div>
              <p className="text-sm text-muted-foreground mt-1">
                {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
              </p>
            </div>
            <div>
              <div className="text-sm font-medium">Last Sign In</div>
              <p className="text-sm text-muted-foreground mt-1">
                {user.lastSignInAt ? new Date(user.lastSignInAt).toLocaleDateString() : 'Unknown'}
              </p>
            </div>
          </div>

          {/* Data Export */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="font-medium text-sm sm:text-base">Data Export</p>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Download a copy of your data
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full sm:w-auto"
              disabled={isExporting}
              onClick={async () => {
                try {
                  setIsExporting(true);
                  await actions.exportUserData();
                } catch (error) {
                  import('@/utils/console').then(({ safeConsole }) => {
                    safeConsole.error('Export failed:', error);
                  });
                } finally {
                  setIsExporting(false);
                }
              }}
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Exporting...
                </>
              ) : (
                'Export Data'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
);

AccountInfo.displayName = 'AccountInfo';
