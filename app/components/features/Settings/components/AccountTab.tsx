import { useAuth } from '@clerk/react-router';
import { User } from 'lucide-react';
import type React from 'react';
import { memo } from 'react';
import { DeleteAccount } from '@/components/settings/DeleteAccount';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AccountInfo } from './AccountInfo';
import { SessionManagement } from './SessionManagement';

interface AccountTabProps {
  isEditingName: boolean;
  editFirstName: string;
  editLastName: string;
  onSetIsEditingName: (editing: boolean) => void;
  onSetEditFirstName: (name: string) => void;
  onSetEditLastName: (name: string) => void;
}

/**
 * Account settings tab component
 */
export const AccountTab: React.FC<AccountTabProps> = memo(
  ({
    isEditingName,
    editFirstName,
    editLastName,
    onSetIsEditingName,
    onSetEditFirstName,
    onSetEditLastName,
  }) => {
    const { isSignedIn } = useAuth();

    if (!isSignedIn) {
      return (
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <User className="w-5 h-5" />
              Account Information
            </CardTitle>
            <CardDescription className="text-sm">
              Please sign in to manage your account
            </CardDescription>
          </CardHeader>
        </Card>
      );
    }

    return (
      <div className="space-y-4 sm:space-y-6">
        {/* Account Information */}
        <AccountInfo
          isEditingName={isEditingName}
          editFirstName={editFirstName}
          editLastName={editLastName}
          onSetIsEditingName={onSetIsEditingName}
          onSetEditFirstName={onSetEditFirstName}
          onSetEditLastName={onSetEditLastName}
        />

        {/* Session Management */}
        <SessionManagement />

        {/* Delete Account */}
        <DeleteAccount />
      </div>
    );
  }
);

AccountTab.displayName = 'AccountTab';
