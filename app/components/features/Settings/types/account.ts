/**
 * @fileoverview Account management types
 * @author Axel Modra
 */

/**
 * Account information interface
 */
export interface AccountInfo {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  imageUrl?: string;
  createdAt?: Date;
  lastSignInAt?: Date;
  role?: string;
}

/**
 * Account state interface
 */
export interface AccountState {
  accountInfo: AccountInfo | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Account actions interface
 */
export interface AccountActions {
  updateName: (firstName: string, lastName: string) => Promise<void>;
  exportUserData: () => Promise<void>;
  deleteAccount: () => Promise<void>;
  refreshAccountInfo: () => Promise<void>;
}

/**
 * Combined account hook return type
 */
export interface UseAccountReturn {
  state: AccountState;
  actions: AccountActions;
}
