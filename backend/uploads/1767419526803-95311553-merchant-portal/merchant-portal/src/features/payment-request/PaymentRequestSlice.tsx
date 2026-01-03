/* eslint-disable no-param-reassign */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../store';
import { UpsertPaymentRequestStatus } from '../../gql-types.generated';
import { KeyedInvalidOperationServiceError } from '../../custom-types/KeyedInvalidOperationServiceError';

export interface InvoiceFileUpload {
  id: string;
  file: File;
  path: string;
  success: boolean;
}
interface SliceState {
  sendPaymentRequestError?: string;
  sendPaymentRequestGQLError?: KeyedInvalidOperationServiceError;
  isPaymentRequestFormValid: boolean;
  isRecipientEmailValid: boolean;
  isRecipientPhoneValid: boolean;
  isAmountValid: boolean;
  isRefNumValid: boolean;
  sendPaymentRequestInFlight: boolean;
  paymentRequestStatus?: UpsertPaymentRequestStatus;
  invoices: InvoiceFileUpload[];
  invoiceUploadIndex: number;
  invoiceUploadTotal: number;
  isLoadingInvoices: boolean;
}

const initialState: SliceState = {
  sendPaymentRequestError: undefined,
  isPaymentRequestFormValid: false,
  isRecipientEmailValid: true,
  isRecipientPhoneValid: true,
  isAmountValid: true,
  isRefNumValid: true,
  paymentRequestStatus: undefined,
  sendPaymentRequestInFlight: false,
  invoices: [],
  invoiceUploadTotal: 0,
  invoiceUploadIndex: 0,
  isLoadingInvoices: false,
};

export const slice = createSlice({
  name: 'paymentRequest',
  initialState,
  reducers: {
    captureSendPaymentRequestError: (state, action: PayloadAction<string>) => {
      state.sendPaymentRequestError = action.payload;
    },
    clearSendPaymentRequestError: state => {
      state.sendPaymentRequestError = undefined;
    },
    captureSendPaymentRequestGQLError: (state, action: PayloadAction<KeyedInvalidOperationServiceError | undefined>) => {
      state.sendPaymentRequestGQLError = action.payload;
    },
    clearSendPaymentRequestGQLError: state => {
      state.sendPaymentRequestGQLError = undefined;
    },
    fetchIsLoadingInvoices: (state, action: PayloadAction<boolean>) => {
      state.isLoadingInvoices = action.payload;
    },
    captureInvoiceUpload: (state, action: PayloadAction<InvoiceFileUpload>) => {
      state.invoices.push(action.payload);
    },
    captureInvoiceArray: (state, action: PayloadAction<InvoiceFileUpload[]>) => {
      state.invoices = action.payload;
    },
    clearInvoices: state => {
      state.invoices = [];
    },
    fetchInvoiceUploadIndex: (state, action: PayloadAction<number>) => {
      state.invoiceUploadIndex = action.payload;
    },
    fetchInvoiceUploadTotal: (state, action: PayloadAction<number>) => {
      state.invoiceUploadTotal = action.payload;
    },
    clearPaymentRequestStatus: state => {
      state.paymentRequestStatus = undefined;
    },
    capturePaymentRequestStatus: (state, action: PayloadAction<UpsertPaymentRequestStatus>) => {
      state.paymentRequestStatus = action.payload;
    },
    fetchIsPaymentRequestFormValid: (state, action: PayloadAction<boolean>) => {
      state.isPaymentRequestFormValid = action.payload;
    },
    fetchIsRecipientEmailValid: (state, action: PayloadAction<boolean>) => {
      state.isRecipientEmailValid = action.payload;
    },
    fetchIsRecipientPhoneValid: (state, action: PayloadAction<boolean>) => {
      state.isRecipientPhoneValid = action.payload;
    },
    fetchIsAmountValid: (state, action: PayloadAction<boolean>) => {
      state.isAmountValid = action.payload;
    },
    fetchIsRefNumValid: (state, action: PayloadAction<boolean>) => {
      state.isRefNumValid = action.payload;
    },
    captureSendPaymentRequestInFlight: (state, action: PayloadAction<boolean>) => {
      state.sendPaymentRequestInFlight = action.payload;
    },
  },
});

export const selectSendPaymentRequestError = (state: RootState): string | undefined => state.paymentRequest.sendPaymentRequestError;
export const selectSendPaymentRequestGQLError = (state: RootState): KeyedInvalidOperationServiceError | undefined =>
  state.paymentRequest.sendPaymentRequestGQLError;
export const selectIsPaymentRequestFormValid = (state: RootState): boolean => state.paymentRequest.isPaymentRequestFormValid;
export const selectIsRecipientEmailValid = (state: RootState): boolean => state.paymentRequest.isRecipientEmailValid;
export const selectIsAmountValid = (state: RootState): boolean => state.paymentRequest.isAmountValid;
export const selectIsRefNumValid = (state: RootState): boolean => state.paymentRequest.isRefNumValid;
export const selectPaymentRequestStatus = (state: RootState): UpsertPaymentRequestStatus | undefined =>
  state.paymentRequest.paymentRequestStatus;
export const selectSendPaymentRequestInFlight = (state: RootState): boolean => state.paymentRequest.sendPaymentRequestInFlight;
export const selectIsLoadingInvoices = (state: RootState): boolean | undefined => state.paymentRequest.isLoadingInvoices;
export const selectInvoiceUploadTotal = (state: RootState): number | undefined => state.paymentRequest.invoiceUploadTotal;
export const selectInvoiceUploadIndex = (state: RootState): number | undefined => state.paymentRequest.invoiceUploadIndex;
export const selectInvoices = (state: RootState): InvoiceFileUpload[] | undefined => state.paymentRequest.invoices;

export const {
  captureSendPaymentRequestInFlight,
  captureSendPaymentRequestError,
  captureSendPaymentRequestGQLError,
  clearSendPaymentRequestError,
  clearSendPaymentRequestGQLError,
  fetchIsLoadingInvoices,
  fetchInvoiceUploadIndex,
  fetchInvoiceUploadTotal,
  captureInvoiceUpload,
  captureInvoiceArray,
  clearInvoices,
  capturePaymentRequestStatus,
  clearPaymentRequestStatus,
  fetchIsPaymentRequestFormValid,
  fetchIsRecipientEmailValid,
  fetchIsAmountValid,
  fetchIsRefNumValid,
} = slice.actions;

export default slice.reducer;
