import { b2cAuthProvider } from './AuthProvider';
import { AUTH_MODE, SLO_POSTLOGOUT_URL, SSO_SESSIONSTORAGE_ID } from './Constants';

interface TokenResult {
  // Choose a descriptive name
  accessToken?: string;
  error?: string;
}

export interface UserLogoutData {
  sid: string;
  iss: string | null;
}

export interface UserGranularPermissions {
  canManageUsers: boolean;
  canAddUsers: boolean;
}

export enum AuthMode {
  B2C = 'b2c',
  AIM = 'aim',
}

export class ApteanSSOProvider {
  static async getAccessToken(): Promise<TokenResult> {
    if (AUTH_MODE === AuthMode.B2C) {
      const tokenResponse = await b2cAuthProvider?.getAccessToken();
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      return tokenResponse!;
    }

    const session = sessionStorage.getItem(SSO_SESSIONSTORAGE_ID);
    const sessionData = session ? JSON.parse(session) : null;
    if (sessionData?.access_token) {
      return { accessToken: sessionData.access_token };
    }
    return { error: 'No access token found' };
  }

  static userPermissions(): UserGranularPermissions {
    //TODO: Abbey... Make this dynamic based on Subscription event isACS flag.
    // during the code unification steps.
    return {
      canManageUsers: true,
      canAddUsers: AUTH_MODE === AuthMode.B2C,
    };
  }

  static exitPortalApp(): void {
    window.location.href = window.location.origin + SLO_POSTLOGOUT_URL;
  }
}
