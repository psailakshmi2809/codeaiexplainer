/* eslint-disable no-param-reassign */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  SendTestEmailStatus,
  UpdateConvenienceFeesStatus,
  UpdateIntegrationSettingsStatus,
  UpdatePaymentReminderSettingsStatus,
  UpdateTenantAccountEmailSettingsStatus,
} from '../../gql-types.generated';
import { RootState } from '../../store';
interface SliceState {
  integrationSettingsRequestInFlight: boolean;
  emailSettingsRequestInFlight: boolean;
  updateTenantAccountEmailSettingsStatus?: UpdateTenantAccountEmailSettingsStatus;
  updateIntegrationSettingsStatus?: UpdateIntegrationSettingsStatus;
  updateConvenienceFeesStatus?: UpdateConvenienceFeesStatus;
  updatePaymentReminderSettingsStatus?: UpdatePaymentReminderSettingsStatus;
  paymentReminderSettingsRequestInFlight: boolean;
  updateConvenienceFeesError?: string;
  convenienceFeesRequestInFlight: boolean;
  tenantCustomEmailSettingsError?: Error;
  sendTestEmailInFlight: boolean;
  sendTestEmailError?: Error;
  sendTestEmailStatus?: SendTestEmailStatus;
}

const initialState: SliceState = {
  emailSettingsRequestInFlight: false,
  integrationSettingsRequestInFlight: false,
  convenienceFeesRequestInFlight: false,
  paymentReminderSettingsRequestInFlight: false,
  sendTestEmailInFlight: false,
};

export const slice = createSlice({
  name: 'accountPreferences',
  initialState,
  reducers: {
    captureTenantAccountEmailSettingsRequestInFlight: (state, action: PayloadAction<boolean>) => {
      state.emailSettingsRequestInFlight = action.payload;
    },
    captureUpdateTenantAccountEmailSettingsStatus: (
      state,
      action: PayloadAction<UpdateTenantAccountEmailSettingsStatus | undefined>,
    ) => {
      state.updateTenantAccountEmailSettingsStatus = action.payload;
    },
    captureIntegrationSettingsRequestInFlight: (state, action: PayloadAction<boolean>) => {
      state.integrationSettingsRequestInFlight = action.payload;
    },
    captureUpdateIntegrationSettingsStatus: (state, action: PayloadAction<UpdateIntegrationSettingsStatus | undefined>) => {
      state.updateIntegrationSettingsStatus = action.payload;
    },
    captureConvenienceFeesRequestInFlight: (state, action: PayloadAction<boolean>) => {
      state.convenienceFeesRequestInFlight = action.payload;
    },
    captureUpdateConvenienceFeesStatus: (state, action: PayloadAction<UpdateConvenienceFeesStatus | undefined>) => {
      state.updateConvenienceFeesStatus = action.payload;
    },
    captureUpdatePaymentReminderSettingsStatus: (state, action: PayloadAction<UpdatePaymentReminderSettingsStatus | undefined>) => {
      state.updatePaymentReminderSettingsStatus = action.payload;
    },
    capturePaymentReminderSettingsRequestInFlight: (state, action: PayloadAction<boolean>) => {
      state.paymentReminderSettingsRequestInFlight = action.payload;
    },
    captureUpdateConvenienceFeesError: (state, action: PayloadAction<string | undefined>) => {
      // eslint-disable-next-line no-param-reassign
      state.updateConvenienceFeesError = action.payload;
    },
    clearUpdateConvenienceFeesError: state => {
      // eslint-disable-next-line no-param-reassign
      state.updateConvenienceFeesError = undefined;
    },
    captureTenantCustomEmailSettingsError: (state, action: PayloadAction<Error | undefined>) => {
      // eslint-disable-next-line no-param-reassign
      state.tenantCustomEmailSettingsError = action.payload;
    },
    captureSendTestEmailInFlight: (state, action: PayloadAction<boolean>) => {
      // eslint-disable-next-line no-param-reassign
      state.sendTestEmailInFlight = action.payload;
    },
    captureSendTestEmailError: (state, action: PayloadAction<Error | undefined>) => {
      // eslint-disable-next-line no-param-reassign
      state.sendTestEmailError = action.payload;
    },
    captureSendTestEmailStatus: (state, action: PayloadAction<SendTestEmailStatus | undefined>) => {
      // eslint-disable-next-line no-param-reassign
      state.sendTestEmailStatus = action.payload;
    },
  },
});

export const selectUpdateTenantAccountEmailSettingsRequestInFlight = (state: RootState): boolean =>
  state.accountPreferences.integrationSettingsRequestInFlight;
export const selectTenantAccountEmailSettingsStatus = (state: RootState): UpdateTenantAccountEmailSettingsStatus | undefined =>
  state.accountPreferences.updateTenantAccountEmailSettingsStatus;
export const selectIntegrationSettingsRequestInFlight = (state: RootState): boolean =>
  state.accountPreferences.integrationSettingsRequestInFlight;
export const selectUpdateIntegrationSettingsStatus = (state: RootState): UpdateIntegrationSettingsStatus | undefined =>
  state.accountPreferences.updateIntegrationSettingsStatus;
export const selectConvenienceFeesRequestInFlight = (state: RootState): boolean =>
  state.accountPreferences.integrationSettingsRequestInFlight;
export const selectUpdateConvenienceFeesStatus = (state: RootState): UpdateConvenienceFeesStatus | undefined =>
  state.accountPreferences.updateConvenienceFeesStatus;
export const selectUpdatePaymentReminderRequestInFlight = (state: RootState): boolean =>
  state.accountPreferences.paymentReminderSettingsRequestInFlight;
export const selectUpdatePaymentReminderStatus = (state: RootState): UpdatePaymentReminderSettingsStatus | undefined =>
  state.accountPreferences.updatePaymentReminderSettingsStatus;
export const selectUpdateConvenienceFeesError = (state: RootState): string | undefined =>
  state.accountPreferences.updateConvenienceFeesError;
export const selectTenantCustomEmailSettingsError = (state: RootState): Error | undefined =>
  state.accountPreferences.tenantCustomEmailSettingsError;
export const selectSendTestEmailInFlight = (state: RootState): boolean => state.accountPreferences.sendTestEmailInFlight;
export const selectSendTestEmailError = (state: RootState): Error | undefined => state.accountPreferences.sendTestEmailError;
export const selectSendTestEmailStatus = (state: RootState): SendTestEmailStatus | undefined =>
  state.accountPreferences.sendTestEmailStatus;

export const {
  captureTenantAccountEmailSettingsRequestInFlight,
  captureUpdateTenantAccountEmailSettingsStatus,
  captureIntegrationSettingsRequestInFlight,
  captureUpdateIntegrationSettingsStatus,
  captureConvenienceFeesRequestInFlight,
  captureUpdateConvenienceFeesStatus,
  captureUpdatePaymentReminderSettingsStatus,
  capturePaymentReminderSettingsRequestInFlight,
  captureUpdateConvenienceFeesError,
  clearUpdateConvenienceFeesError,
  captureTenantCustomEmailSettingsError,
  captureSendTestEmailError,
  captureSendTestEmailInFlight,
  captureSendTestEmailStatus,
} = slice.actions;

export default slice.reducer;
