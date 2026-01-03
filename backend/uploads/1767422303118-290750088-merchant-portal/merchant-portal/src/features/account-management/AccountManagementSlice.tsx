/* eslint-disable no-param-reassign */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../store';
import { MutationStatusCode, PayoutSettings, UpsertPayoutSettingsStatus } from '../../gql-types.generated';
export interface PayoutMethod {
  id: string;
  lastfour: string;
  type: string;
}
interface SliceState {
  error?: Error;
  payoutSettingsSatus?: UpsertPayoutSettingsStatus;
  invalidRoutingTransitNumber?: boolean;
  invalidAccountNumber?: boolean;
  invalidInstitutionNumber?: boolean;
  payoutSettingsErrorMessage?: string;
  payoutSettings?: PayoutSettings;
  activeAccountNumber?: string;
  activeInstitutionNumber?: string;
  activeRoutingTransitNumber?: string;
  activeAccountType?: string;
  logoStatus?: string;
  modifyPayoutVisible?: boolean;
  modifyFrequencyVisible?: boolean;
  addingPayoutMethod: boolean;
  reloadAfterNameChange: boolean;
}

const initialState: SliceState = {
  error: undefined,
  payoutSettingsSatus: undefined,
  payoutSettings: undefined,
  invalidRoutingTransitNumber: false,
  invalidAccountNumber: false,
  payoutSettingsErrorMessage: '',
  activeAccountNumber: '',
  activeInstitutionNumber: '',
  activeRoutingTransitNumber: '',
  activeAccountType: 'checking',
  logoStatus: '',
  modifyPayoutVisible: false,
  modifyFrequencyVisible: false,
  addingPayoutMethod: false,
  reloadAfterNameChange: false,
};

export const slice = createSlice({
  name: 'accountManagement',
  initialState,
  reducers: {
    fetchError: (state, action: PayloadAction<Error | undefined>) => {
      state.error = action.payload;
    },

    capturePayoutSettingsTokenErrorMessage: (state, action: PayloadAction<string | undefined>) => {
      state.payoutSettingsErrorMessage = action.payload;
    },

    captureModifyPayoutVisible: (state, action: PayloadAction<boolean | undefined>) => {
      state.modifyPayoutVisible = action.payload;
    },

    uploadLogoSuccess: (state, action: PayloadAction<string>) => {
      state.logoStatus = action.payload;
    },
    clearLogo: state => {
      state.logoStatus = undefined;
    },
    uploadLogoFailure: state => {
      state.logoStatus = 'uploadError';
    },
    captureModifyFrequencyVisible: (state, action: PayloadAction<boolean | undefined>) => {
      state.modifyFrequencyVisible = action.payload;
    },

    captureActiveAccountNumber: (state, action: PayloadAction<string>) => {
      state.activeAccountNumber = action.payload;
    },

    captureActiveInstitutionNumber: (state, action: PayloadAction<string>) => {
      state.activeInstitutionNumber = action.payload;
    },

    captureActiveRoutingTransitNumber: (state, action: PayloadAction<string>) => {
      state.activeRoutingTransitNumber = action.payload;
    },

    captureActiveAccountType: (state, action: PayloadAction<string>) => {
      state.activeAccountType = action.payload;
    },

    captureInvalidInstitutionNumber: (state, action: PayloadAction<boolean>) => {
      state.invalidInstitutionNumber = action.payload;
    },

    captureInvalidRoutingTransitNumber: (state, action: PayloadAction<boolean>) => {
      state.invalidRoutingTransitNumber = action.payload;
    },

    captureInvalidAccountNumber: (state, action: PayloadAction<boolean>) => {
      state.invalidAccountNumber = action.payload;
    },

    capturePayoutSettingsStatus: (state, action: PayloadAction<UpsertPayoutSettingsStatus>) => {
      state.payoutSettingsSatus = action.payload;
    },

    capturePayoutSettings: (state, action: PayloadAction<PayoutSettings>) => {
      state.payoutSettings = action.payload;
    },

    captureAddingPayoutMethod: (state, action: PayloadAction<boolean>) => {
      state.addingPayoutMethod = action.payload;
    },

    captureReloadAfterNameChange: (state, action: PayloadAction<boolean>) => {
      state.reloadAfterNameChange = action.payload;
    },
  },
});

export const selectPayoutSettingsTokenError = (state: RootState): Error | undefined => {
  if (state.accountManagement.payoutSettingsErrorMessage) {
    return { message: state.accountManagement.payoutSettingsErrorMessage } as Error;
  }
  if (state.accountManagement.payoutSettingsSatus?.code === MutationStatusCode.Error) {
    // Force error state if a status is an error - FetchStatusPayload and queryStatus should bring over the pull payload status with error message if possible.
    return { message: state.accountManagement.payoutSettingsSatus?.error || '' } as Error;
  }
  return undefined;
};

export const selectPayoutSettings = (state: RootState): PayoutSettings | undefined => state.accountManagement.payoutSettings;
export const selectPayoutSettingsStatus = (state: RootState): UpsertPayoutSettingsStatus | undefined =>
  state.accountManagement.payoutSettingsSatus;
export const selectPayoutSettingsStatusSuccess = (state: RootState): boolean | undefined =>
  state.accountManagement.payoutSettingsSatus?.code === MutationStatusCode.Success;
export const selectPayoutSettingsError = (state: RootState): Error | undefined => state.accountManagement.error;
export const selectModifyPayoutVisible = (state: RootState): boolean | undefined => state.accountManagement.modifyPayoutVisible;
export const selectModifyFrequencyVisible = (state: RootState): boolean | undefined => state.accountManagement.modifyFrequencyVisible;
export const selectActiveAccountNumber = (state: RootState): string | undefined => state.accountManagement.activeAccountNumber;
export const selectActiveInstitutionNumber = (state: RootState): string | undefined => state.accountManagement.activeInstitutionNumber;
export const selectActiveRoutingTransitNumber = (state: RootState): string | undefined =>
  state.accountManagement.activeRoutingTransitNumber;
export const selectActiveAccountType = (state: RootState): string | undefined => state.accountManagement.activeAccountType;
export const selectErrorMessage = (state: RootState): string | undefined => state.accountManagement.payoutSettingsErrorMessage;
export const selectInvalidRoutingTransitNumber = (state: RootState): boolean | undefined =>
  state.accountManagement.invalidRoutingTransitNumber;
export const selectInvalidInstitutionNumber = (state: RootState): boolean | undefined =>
  state.accountManagement.invalidInstitutionNumber;
export const selectInvalidAccountNumber = (state: RootState): boolean | undefined => state.accountManagement.invalidAccountNumber;
export const selectAddingPayoutMethod = (state: RootState): boolean => state.accountManagement.addingPayoutMethod;
export const selectLogoStatus = (state: RootState): string | undefined => state.accountManagement.logoStatus;
export const selectReloadAfterNameChange = (state: RootState): boolean => state.accountManagement.reloadAfterNameChange;
export const {
  fetchError,
  uploadLogoSuccess,
  uploadLogoFailure,
  clearLogo,
  captureModifyPayoutVisible,
  captureModifyFrequencyVisible,
  capturePayoutSettingsStatus,
  capturePayoutSettingsTokenErrorMessage,
  capturePayoutSettings,
  captureActiveAccountNumber,
  captureActiveInstitutionNumber,
  captureActiveRoutingTransitNumber,
  captureActiveAccountType,
  captureInvalidRoutingTransitNumber,
  captureInvalidAccountNumber,
  captureInvalidInstitutionNumber,
  captureAddingPayoutMethod,
  captureReloadAfterNameChange,
} = slice.actions;

export default slice.reducer;
