/* eslint-disable no-param-reassign */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CreatePaymentStatus, PaymentMethod, PaymentRequest } from '../../gql-types.generated';
import { RootState } from '../../store';

interface SliceState {
  isCustomerCountryCodeValid: boolean;
  isCustomerNameValid: boolean;
  isPaymentVirtualTerminalValid: boolean;
  isMethodInfoValid: boolean;
  isCustomerAmountValid: boolean;
  isCustomerEmailValid: boolean;
  isSearchEmailOrNameValid: boolean;
  isCustomerPhoneValid: boolean;
  isCustomerPostalValid: boolean;
  isCustomerDescriptionValid: boolean;
  isCreatePaymentInFlight: boolean;
  isQueryMethodsByEmailInFlight: boolean;
  isCreatePaymentMethodInFlight: boolean;
  updatePaymentMethodError?: Error;
  isUpdatePaymentMethodInFlight: boolean;
  matchedMethods?: PaymentMethod[];
  requestsToPay?: PaymentRequest[];
  paymentError?: Error;
  createPaymentMethodError?: Error;
  createPaymentStatus?: CreatePaymentStatus;
  createdPaymentMethod?: PaymentMethod;
  createPaymentSuccessMessage?: string;
  hasReachedPaymentMethodLimit: boolean;
}

const initialState: SliceState = {
  isCustomerAmountValid: true,
  isCustomerEmailValid: true,
  isSearchEmailOrNameValid: true,
  matchedMethods: [],
  requestsToPay: [],
  isCustomerPhoneValid: true,
  isCustomerPostalValid: true,
  isCustomerCountryCodeValid: true,
  isCustomerNameValid: true,
  isCustomerDescriptionValid: true,
  isPaymentVirtualTerminalValid: false,
  isMethodInfoValid: false,
  isCreatePaymentInFlight: false,
  isUpdatePaymentMethodInFlight: false,
  updatePaymentMethodError: undefined,
  isQueryMethodsByEmailInFlight: false,
  isCreatePaymentMethodInFlight: false,
  hasReachedPaymentMethodLimit: false,
};

export const slice = createSlice({
  name: 'virtualTerminal',
  initialState,
  reducers: {
    fetchIsCustomerCountryCodeValid: (state, action: PayloadAction<boolean>) => {
      state.isCustomerCountryCodeValid = action.payload;
    },
    fetchIsCustomerNameValid: (state, action: PayloadAction<boolean>) => {
      state.isCustomerNameValid = action.payload;
    },
    fetchIsMethodInfoValid: (state, action: PayloadAction<boolean>) => {
      state.isMethodInfoValid = action.payload;
    },
    fetchCreatedPaymentMethod: (state, action: PayloadAction<PaymentMethod | undefined>) => {
      state.createdPaymentMethod = action.payload;
    },
    fetchIsPaymentVirtualTerminalValid: (state, action: PayloadAction<boolean>) => {
      state.isPaymentVirtualTerminalValid = action.payload;
    },
    fetchIsCustomerDescriptionValid: (state, action: PayloadAction<boolean>) => {
      state.isCustomerDescriptionValid = action.payload;
    },
    fetchIsCustomerEmailValid: (state, action: PayloadAction<boolean>) => {
      state.isCustomerEmailValid = action.payload;
    },
    fetchIsSearchEmailOrNameValid: (state, action: PayloadAction<boolean>) => {
      state.isSearchEmailOrNameValid = action.payload;
    },
    fetchIsCustomerPhoneValid: (state, action: PayloadAction<boolean>) => {
      state.isCustomerPhoneValid = action.payload;
    },
    fetchIsCustomerAmountValid: (state, action: PayloadAction<boolean>) => {
      state.isCustomerAmountValid = action.payload;
    },
    fetchIsCustomerPostalValid: (state, action: PayloadAction<boolean>) => {
      state.isCustomerPostalValid = action.payload;
    },
    fetchPaymentError: (state, action: PayloadAction<Error | undefined>) => {
      state.paymentError = action.payload;
    },
    fetchCreatePaymentMethodError: (state, action: PayloadAction<Error | undefined>) => {
      state.createPaymentMethodError = action.payload;
    },
    fetchMatchedMethods: (state, action: PayloadAction<PaymentMethod[] | undefined>) => {
      state.matchedMethods = action.payload;
    },
    fetchIsQueryMethodsByEmailInFlight: (state, action: PayloadAction<boolean>) => {
      state.isQueryMethodsByEmailInFlight = action.payload;
    },
    fetchIsCreatePaymentInFlight: (state, action: PayloadAction<boolean>) => {
      state.isCreatePaymentInFlight = action.payload;
    },
    fetchIsCreatePaymentMethodInFlight: (state, action: PayloadAction<boolean>) => {
      state.isCreatePaymentMethodInFlight = action.payload;
    },
    fetchCreatePaymentStatus: (state, action: PayloadAction<CreatePaymentStatus | undefined>) => {
      state.createPaymentStatus = action.payload;
    },
    fetchRequestsToPay: (state, action: PayloadAction<PaymentRequest[] | undefined>) => {
      state.requestsToPay = action.payload;
    },
    fetchCreatePaymentSuccessMessage: (state, action: PayloadAction<string | undefined>) => {
      state.createPaymentSuccessMessage = action.payload;
    },
    fetchHasReachedPaymentMethodLimit: (state, action: PayloadAction<boolean>) => {
      state.hasReachedPaymentMethodLimit = action.payload;
    },
    fetchUpdatePaymentMethodError: (state, action: PayloadAction<Error | undefined>) => {
      state.updatePaymentMethodError = action.payload;
    },
    fetchIsUpdatePaymentMethodInFlight: (state, action: PayloadAction<boolean>) => {
      state.isUpdatePaymentMethodInFlight = action.payload;
    },
  },
});

export const selectMatchedMethods = (state: RootState): PaymentMethod[] | undefined => state.virtualTerminal.matchedMethods;
export const selectRequestsToPay = (state: RootState): PaymentRequest[] | undefined => state.virtualTerminal.requestsToPay;
export const selectIsQueryMethodsByEmailInFlight = (state: RootState): boolean => state.virtualTerminal.isQueryMethodsByEmailInFlight;
export const selectCreatePaymentStatus = (state: RootState): CreatePaymentStatus | undefined =>
  state.virtualTerminal.createPaymentStatus;
export const selectPaymentError = (state: RootState): Error | undefined => state.virtualTerminal.paymentError;
export const selectCreatePaymentMethodError = (state: RootState): Error | undefined => state.virtualTerminal.createPaymentMethodError;
export const selectIsCustomerAmountValid = (state: RootState): boolean => state.virtualTerminal.isCustomerAmountValid;
export const selectIsCustomerEmailValid = (state: RootState): boolean => state.virtualTerminal.isCustomerEmailValid;
export const selectIsSearchEmailOrNameValid = (state: RootState): boolean => state.virtualTerminal.isSearchEmailOrNameValid;
export const selectIsCustomerPhoneValid = (state: RootState): boolean => state.virtualTerminal.isCustomerPhoneValid;
export const selectIsCustomerPostalValid = (state: RootState): boolean => state.virtualTerminal.isCustomerPostalValid;
export const selectIsCustomerCountryCodeValid = (state: RootState): boolean => state.virtualTerminal.isCustomerCountryCodeValid;
export const selectIsCustomerNameValid = (state: RootState): boolean => state.virtualTerminal.isCustomerNameValid;
export const selectIsCustomerDescriptionValid = (state: RootState): boolean => state.virtualTerminal.isCustomerDescriptionValid;
export const selectIsPaymentVirtualTerminalValid = (state: RootState): boolean => state.virtualTerminal.isPaymentVirtualTerminalValid;
export const selectIsMethodInfoValid = (state: RootState): boolean => state.virtualTerminal.isMethodInfoValid;
export const selectIsCreatePaymentInFlight = (state: RootState): boolean => state.virtualTerminal.isCreatePaymentInFlight;
export const selectIsCreatePaymentMethodInFlight = (state: RootState): boolean => state.virtualTerminal.isCreatePaymentMethodInFlight;
export const selectCreatedPaymentMethod = (state: RootState): PaymentMethod | undefined => state.virtualTerminal.createdPaymentMethod;
export const selectCreatePaymentSuccessMessage = (state: RootState): string | undefined =>
  state.virtualTerminal.createPaymentSuccessMessage;
export const selectHasReachedPaymentMethodLimit = (state: RootState): boolean => state.virtualTerminal.hasReachedPaymentMethodLimit;
export const selectUpdatePaymentMethodError = (state: RootState): Error | undefined => state.virtualTerminal.updatePaymentMethodError;
export const selectIsUpdatePaymentMethodInFlight = (state: RootState): boolean => state.virtualTerminal.isUpdatePaymentMethodInFlight;

export const {
  fetchPaymentError,
  fetchCreatePaymentMethodError,
  fetchCreatePaymentStatus,
  fetchIsCreatePaymentInFlight,
  fetchIsCreatePaymentMethodInFlight,
  fetchIsQueryMethodsByEmailInFlight,
  fetchMatchedMethods,
  fetchIsCustomerPostalValid,
  fetchIsCustomerAmountValid,
  fetchIsCustomerPhoneValid,
  fetchIsSearchEmailOrNameValid,
  fetchIsCustomerDescriptionValid,
  fetchIsPaymentVirtualTerminalValid,
  fetchIsMethodInfoValid,
  fetchCreatedPaymentMethod,
  fetchIsCustomerNameValid,
  fetchIsCustomerCountryCodeValid,
  fetchIsCustomerEmailValid,
  fetchRequestsToPay,
  fetchCreatePaymentSuccessMessage,
  fetchHasReachedPaymentMethodLimit,
  fetchUpdatePaymentMethodError,
  fetchIsUpdatePaymentMethodInFlight,
} = slice.actions;

export default slice.reducer;
