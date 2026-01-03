/* eslint-disable no-param-reassign */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import {
  Owner,
  Person,
  TenantAccount,
  PayFacId,
  TransactionStatement,
  AccountBalances,
  LoginContext,
  Maybe,
  ConvenienceFees,
  AccountPaymentOptions,
  PaymentRequestFeatures,
  TenantSupportedCapabilities,
} from '../../gql-types.generated';
import { RootState } from '../../store';
import { RoutePath } from '../../util/Routes';

export interface Crumb {
  path: string;
  text: string;
}
interface SliceState {
  error?: Error;
  hasConnectivityIssue: boolean;
  hasMerchantAccountResponse: boolean;
  isTenantMenuOpen: boolean;
  loginContext?: LoginContext;
  pendingBannerVisible: boolean;
  queryLoginContextErrors?: string[];
  queryPersonErrors?: string[];
  queryTenantErrors?: string[];
  requestsInFlight: number;
  selectedTenantId?: string;
  tabPath: string;
  tenantAccount?: TenantAccount;
  tenantId?: string;
  userNoEmail?: boolean;
  viewerUser?: Person;
  paymentRequestSuccessMessage?: string;
  keycloakToken?: string;
}

const initialState: SliceState = {
  error: undefined,
  hasConnectivityIssue: false,
  hasMerchantAccountResponse: false,
  isTenantMenuOpen: false,
  pendingBannerVisible: true,
  requestsInFlight: 0,
  tabPath: RoutePath.Payments,
  tenantAccount: undefined,
  tenantId: undefined,
  viewerUser: undefined,
};

export const slice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    fetchError: (state, action: PayloadAction<Error>) => {
      state.error = action.payload;
    },
    fetchTabPath: (state, action: PayloadAction<string>) => {
      state.tabPath = action.payload;
    },
    fetchTenantAccountSuccess: (state, action: PayloadAction<TenantAccount>) => {
      state.tenantAccount = action.payload;
    },
    fetchLoginContextSuccess: (state, action: PayloadAction<LoginContext>) => {
      state.loginContext = action.payload;
    },
    fetchViewerUserByEmailSuccess: (state, action: PayloadAction<Person>) => {
      state.viewerUser = action.payload;
    },
    fetchHasMerchantAccountResponse: (state, action: PayloadAction<boolean>) => {
      state.hasMerchantAccountResponse = action.payload;
    },
    incrementRequestsInFlight: state => {
      state.requestsInFlight += 1;
    },
    decrementRequestsInFlight: state => {
      if (state.requestsInFlight > 0) state.requestsInFlight -= 1;
    },
    fetchUserNoEmail: (state, action: PayloadAction<boolean>) => {
      state.userNoEmail = action.payload;
    },
    fetchSelectedTenantId: (state, action: PayloadAction<string>) => {
      state.selectedTenantId = action.payload;
    },
    fetchPaymentRequestSuccessMessage: (state, action: PayloadAction<string>) => {
      state.paymentRequestSuccessMessage = action.payload;
    },
    fetchQueryLoginContextErrors: (state, action: PayloadAction<string[] | undefined>) => {
      state.queryLoginContextErrors = action.payload;
    },
    fetchQueryTenantErrors: (state, action: PayloadAction<string[] | undefined>) => {
      state.queryTenantErrors = action.payload;
    },
    fetchQueryPersonErrors: (state, action: PayloadAction<string[] | undefined>) => {
      state.queryPersonErrors = action.payload;
    },
    fetchIsTenantMenuOpen: (state, action: PayloadAction<boolean>) => {
      state.isTenantMenuOpen = action.payload;
    },
    fetchPendingBannerVisible: (state, action: PayloadAction<boolean>) => {
      state.pendingBannerVisible = action.payload;
    },
    fetchHasConnectivityIssue: (state, action: PayloadAction<boolean>) => {
      state.hasConnectivityIssue = action.payload;
    },
    clearAppError: state => {
      state.error = undefined;
    },
    fetchKeycloakToken: (state, action: PayloadAction<string | undefined>) => {
      state.keycloakToken = action.payload;
    },
  },
});

export const selectTabPath = (state: RootState): string => state.app.tabPath;
export const selectHasMerchantAccountResponse = (state: RootState): boolean => state.app.hasMerchantAccountResponse;
export const selectPaymentRequestSuccessMessage = (state: RootState): string | undefined => state.app.paymentRequestSuccessMessage;
export const selectTenantAccount = (state: RootState): TenantAccount | undefined => state.app.tenantAccount;
export const selectLoginContext = (state: RootState): LoginContext | undefined => state.app.loginContext;
export const selectSelectedTenantId = (state: RootState): string | undefined => state.app.selectedTenantId;
export const selectStatements = (state: RootState): TransactionStatement[] | null | undefined => state.app.tenantAccount?.statements;
export const selectTenantAccountId = (state: RootState): string | undefined => state.app.tenantAccount?.id;
export const selectDefaultCurrency = (state: RootState): string | null | undefined => state.app.tenantAccount?.defaultCurrency;
export const selectCurrentBalances = (state: RootState): AccountBalances | null | undefined => state.app.tenantAccount?.balances;
export const selectTenantId = (state: RootState): string | undefined => state.app.viewerUser?.owner.tenantId;
export const selectViewerUser = (state: RootState): Person | undefined => state.app.viewerUser;
export const selectRequestsInFlight = (state: RootState): number => state.app.requestsInFlight;
export const selectNetworkBusy = (state: RootState): boolean => state.app.requestsInFlight > 0;
export const selectAppError = (state: RootState): Error | undefined => state.app.error;
export const selectViewerUserOwner = (state: RootState): Owner | undefined => state.app.viewerUser?.owner;
export const selectPayFacIds = (state: RootState): PayFacId[] | null | undefined => state.app.tenantAccount?.payfac?.ids;
export const selectFeeSchedule = (state: RootState): string | null | undefined => state.app.tenantAccount?.feeSchedule;
export const selectUserNoEmail = (state: RootState): boolean | undefined => state.app.userNoEmail;
export const selectQueryTenantErrors = (state: RootState): string[] | undefined => state.app.queryTenantErrors;
export const selectQueryPersonErrors = (state: RootState): string[] | undefined => state.app.queryPersonErrors;
export const selectIsTenantMenuOpen = (state: RootState): boolean => state.app.isTenantMenuOpen;
export const selectPendingBannerVisible = (state: RootState): boolean => state.app.pendingBannerVisible;
export const selectHasConnectivityIssue = (state: RootState): boolean => state.app.hasConnectivityIssue;
export const selectPaymentRequestsFeatures = (state: RootState): Maybe<PaymentRequestFeatures> | undefined =>
  state.app.tenantAccount?.settings?.features?.paymentRequests;
export const selectPaymentsFeatures = (state: RootState): Maybe<AccountPaymentOptions> | undefined =>
  state.app.tenantAccount?.settings?.options?.payments;
export const selectConvenienceFeesFeatureFlag = (state: RootState): Maybe<boolean> | undefined =>
  state.app.tenantAccount?.country?.toUpperCase() === 'US' && state.app.tenantAccount?.settings?.features?.payments.convenienceFees;
export const selectTenantConvenienceFees = (state: RootState): Maybe<ConvenienceFees> | undefined =>
  state.app.tenantAccount?.settings?.convenienceFees;
export const selectTenantSupportedCapabilities = (state: RootState): TenantSupportedCapabilities | undefined =>
  state.app.tenantAccount?.settings?.supportedCapabilities;
export const selectKeycloakToken = (state: RootState): string | undefined => state.app.keycloakToken;

export const {
  fetchPaymentRequestSuccessMessage,
  fetchTabPath,
  fetchLoginContextSuccess,
  fetchTenantAccountSuccess,
  fetchViewerUserByEmailSuccess,
  fetchSelectedTenantId,
  fetchError,
  fetchUserNoEmail,
  incrementRequestsInFlight,
  decrementRequestsInFlight,
  fetchQueryTenantErrors,
  fetchQueryLoginContextErrors,
  fetchQueryPersonErrors,
  fetchIsTenantMenuOpen,
  fetchPendingBannerVisible,
  fetchHasConnectivityIssue,
  clearAppError,
  fetchKeycloakToken,
} = slice.actions;

export default slice.reducer;
