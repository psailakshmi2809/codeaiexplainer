import store from '../store';
import { ApteanSSOProvider } from './ApteanSSOProvider';

interface StandardRequestHeaders {
  authorization: string;
  'x-aptean-tenant'?: string;
}

export const getStandardHeaders = async (excludeTenantId?: boolean): Promise<StandardRequestHeaders> => {
  const state = store.getState();
  const tokenResponse = await ApteanSSOProvider.getAccessToken();
  const tenantId = state.app.selectedTenantId;
  const headers: StandardRequestHeaders = {
    authorization: `Bearer ${tokenResponse.accessToken}`,
  };

  if (tenantId && !excludeTenantId) {
    headers['x-aptean-tenant'] = tenantId;
  }

  return headers;
};

interface CreateRefundOrPaymentHeaders {
  authorization: string;
  'x-aptean-tenant'?: string;
  'idempotency-key': string;
}

export const getCreateRefundOrPaymentHeaders = async (uid: string): Promise<CreateRefundOrPaymentHeaders> => {
  const state = store.getState();
  const tokenResponse = await ApteanSSOProvider.getAccessToken();
  const tenantId = state.app.selectedTenantId;
  const headers: CreateRefundOrPaymentHeaders = {
    authorization: `Bearer ${tokenResponse.accessToken}`,
    'idempotency-key': `${uid}~0`,
  };
  if (tenantId) {
    headers['x-aptean-tenant'] = tenantId;
  }
  return headers;
};
