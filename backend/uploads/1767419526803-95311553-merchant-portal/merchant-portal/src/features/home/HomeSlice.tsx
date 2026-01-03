/* eslint-disable no-param-reassign */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CustomerOption } from '../../custom-types/CustomerOption';

import {
  PaymentRequestConnection,
  UpsertPaymentRequestStatus,
  AccountRequirements,
  PaymentRequest,
  SubmitVerificationStatus,
  MutationStatusCode,
  Person,
  PaymentConnection,
  Payment,
  Report,
  PaymentStatus,
  PaymentStatusExtended,
  CustomerConnection,
  PaymentRequestStatus,
  PaymentRequestForwardStatus,
  PayoutReport,
} from '../../gql-types.generated';
import { RootState } from '../../store';
import { AllPaymentStatusFilterValue, MAX_STATUS_COUNT } from '../../util/PaymentsListFilterValue';
import {
  AllPaymentRequestsStatusFilterValue,
  MAX_STATUS_COUNT as PR_MAX_STATUS_COUNT,
} from '../../util/PaymentRequestsListFilterValue';
import { ApolloError } from '@apollo/client';

export interface InvoiceFileUpload {
  id: string;
  file: File;
  path: string;
  success: boolean;
}
interface SliceState {
  accountRequirements?: AccountRequirements;
  involvedUsers?: Person[];
  paymentRequestConnection?: PaymentRequestConnection;
  paymentRequests?: PaymentRequest[];
  paymentRequestQueryString?: string;
  reminderStatus?: UpsertPaymentRequestStatus;
  invoiceUniqueId?: string;
  refundStatusCode?: string;
  verificationStatus?: SubmitVerificationStatus;
  searchError?: Error;
  involvedUsersError?: Error;
  refundError?: Error;
  remindError?: Error;
  closeOrCompleteError?: Error;
  verificationsError?: Error;
  accountRequirementsError?: Error;
  isLoadingPaymentRequests: boolean;
  refundIdempotencyKey?: string;
  paymentConnection?: PaymentConnection;
  payments?: Payment[];
  isLoadingPayments: boolean;
  paymentListError?: Error;
  paymentQueryString?: string;
  refundErrorMessage?: string | null;
  isPaymentRefunded: boolean;
  paymentRefundedAmount?: number;
  updatePaymentRequestStatus?: UpsertPaymentRequestStatus;
  updatePaymentRequestError?: Error;
  paymentById?: Payment;
  paymentByIdError?: Error;
  paymentsReport?: Report;
  paymentsReportError?: Error;
  paymentRequestById?: PaymentRequest;
  paymentRequestByIdError?: Error;
  hasAdditionalBanner: boolean;
  primaryAccountUser?: Person;
  paymentRequestByIdAfterUpdate?: PaymentRequest;
  paymentRequestByIdAfterUpdateError?: Error;
  isPaymentRequestListInFlight: boolean;
  isPaymentListInFlight: boolean;
  resendingPaymentReceipt: boolean;
  resendPaymentReceiptError?: Error;
  forwardPaymentRequestInFlight: boolean;
  forwardPaymentRequestError?: Error;
  forwardPaymentRequestSuccess: PaymentRequestForwardStatus | null;
  isPaymentReceiptResent: boolean;
  paymentFilterDateOption?: string;
  paymentFilterCustomerOption?: CustomerOption;
  paymentRequestFilterCustomerOption?: CustomerOption;
  paymentFilterFromDate?: string;
  paymentFilterToDate?: string;
  paymentFilterAmountRange: boolean;
  paymentFilterFromAmount?: number;
  paymentFilterToAmount?: number;
  paymentFilterStatusList?: AllPaymentStatusFilterValue[];
  paymentFilterStatusCount: number;
  paymentRequestFilterStatusList?: AllPaymentRequestsStatusFilterValue[];
  paymentRequestFilterStatusCount: number;
  allPaymentsStatusList?: PaymentStatus[];
  allPaymentsStatusExtendedList?: PaymentStatusExtended[];
  allPaymentRequestStatusList?: PaymentRequestStatus[];
  reloadPaymentsAfterFilter: boolean;
  reloadPaymentRequestsAfterFilter: boolean;
  generateStatementAccessUrl?: string;
  generateStatementAccessUrlError?: Error;
  generateStatementAccessUrlInFlight: boolean;
  customerOptionList?: CustomerOption[];
  customerOptionError?: Error;
  isCustomerOptionInFlight: boolean;
  isRemindPaymentRequestsInFlight: boolean;
  remindPaymentRequestsSuccessCount: number;
  lastTabPath: string;
  payoutReport?: PayoutReport;
  payoutReportError?: Error;
  payoutReportInFlight: boolean;
  payoutReportCancelledInFlight: boolean;
  exportsCancelledInFlight: boolean;
  generatingExportInFlight: boolean;
}

const initialState: SliceState = {
  accountRequirements: undefined,
  involvedUsers: undefined,
  paymentRequestConnection: undefined,
  paymentRequests: undefined,
  paymentRequestQueryString: undefined,
  reminderStatus: undefined,
  invoiceUniqueId: undefined,
  refundStatusCode: undefined,
  isLoadingPaymentRequests: true,
  refundIdempotencyKey: undefined,
  isLoadingPayments: true,
  refundErrorMessage: undefined,
  isPaymentRefunded: false,
  paymentRefundedAmount: undefined,
  updatePaymentRequestStatus: undefined,
  hasAdditionalBanner: false,
  isPaymentRequestListInFlight: false,
  isPaymentListInFlight: false,
  resendingPaymentReceipt: false,
  isPaymentReceiptResent: false,
  paymentFilterAmountRange: false,
  paymentFilterStatusCount: MAX_STATUS_COUNT,
  paymentRequestFilterStatusCount: PR_MAX_STATUS_COUNT,
  reloadPaymentsAfterFilter: false,
  reloadPaymentRequestsAfterFilter: false,
  generateStatementAccessUrlInFlight: false,
  isCustomerOptionInFlight: false,
  isRemindPaymentRequestsInFlight: false,
  remindPaymentRequestsSuccessCount: 0,
  forwardPaymentRequestSuccess: null,
  forwardPaymentRequestInFlight: false,
  lastTabPath: '',
  payoutReportInFlight: false,
  payoutReportCancelledInFlight: false,
  exportsCancelledInFlight: false,
  generatingExportInFlight: false,
};

export const slice = createSlice({
  name: 'home',
  initialState,
  reducers: {
    fetchAccountRequirementsSuccess: (state, action: PayloadAction<AccountRequirements>) => {
      state.accountRequirements = action.payload;
    },
    fetchInvolvedUsersSuccess: (state, action: PayloadAction<Person[]>) => {
      const users = [] as Person[];
      const allUsers = action.payload;
      const controller = allUsers.find(person => person.relationship?.involvement?.includes('controller'));
      if (controller) {
        users.push(controller);
      }
      const rep0 = allUsers.find(person => person.relationship?.involvement?.includes('representative-0'));
      if (rep0) {
        users.push(rep0);
      }
      const rep1 = allUsers.find(person => person.relationship?.involvement?.includes('representative-1'));
      if (rep1) {
        users.push(rep1);
      }
      const rep2 = allUsers.find(person => person.relationship?.involvement?.includes('representative-2'));
      if (rep2) {
        users.push(rep2);
      }
      const rep3 = allUsers.find(person => person.relationship?.involvement?.includes('representative-3'));
      if (rep3) {
        users.push(rep3);
      }
      state.involvedUsers = users;

      //setting primary account holder
      const primaryAccount = allUsers.find(person => person.relationship?.primaryAccountHolder);
      state.primaryAccountUser = primaryAccount;
    },
    fetchPaymentRequestListSuccess: (state, action: PayloadAction<PaymentRequestConnection>) => {
      state.paymentRequestConnection = action.payload;
      let items = state.paymentRequests;

      // Initialise the array if this is the first run, or a refresh. We know its a refresh
      // when the connection contains the first page of data.
      if (!items || !state.paymentRequestConnection.pageInfo.hasPreviousPage) {
        items = [];
      }
      action.payload.nodes.map(node => {
        if (!items?.some(i => i.id === node?.id)) {
          items?.push(node as PaymentRequest);
        }
        return node;
      });
      state.paymentRequests = items;
    },
    capturePaymentRequestSearch: (state, action: PayloadAction<string | undefined>) => {
      state.paymentRequestQueryString = action.payload;
    },
    captureReminderStatus: (state, action: PayloadAction<UpsertPaymentRequestStatus>) => {
      state.reminderStatus = action.payload;
    },
    clearReminderStatus: state => {
      state.reminderStatus = undefined;
    },
    uploadDocumentSuccess: (state, action: PayloadAction<string>) => {
      state.invoiceUniqueId = action.payload;
    },
    clearDocument: state => {
      state.invoiceUniqueId = undefined;
    },
    uploadDocumentFailure: state => {
      state.invoiceUniqueId = 'uploadError';
    },
    captureRefundSuccess: (state, action: PayloadAction<string>) => {
      state.refundStatusCode = action.payload;
    },
    clearRefundStatus: state => {
      state.refundStatusCode = undefined;
    },
    captureVerificationStatus: (state, action: PayloadAction<SubmitVerificationStatus>) => {
      state.verificationStatus = action.payload;
    },
    clearVerificationStatus: state => {
      state.verificationStatus = undefined;
    },
    captureSearchError: (state, action: PayloadAction<Error | undefined>) => {
      state.searchError = action.payload;
    },
    captureInvolvedUsersError: (state, action: PayloadAction<Error | undefined>) => {
      state.involvedUsersError = action.payload;
    },
    captureRefundError: (state, action: PayloadAction<Error | undefined>) => {
      state.refundError = action.payload;
    },
    captureRemindError: (state, action: PayloadAction<Error | undefined>) => {
      state.remindError = action.payload;
    },
    captureCloseOrCompleteError: (state, action: PayloadAction<Error | undefined>) => {
      state.closeOrCompleteError = action.payload;
    },
    captureVerificationsError: (state, action: PayloadAction<Error | undefined>) => {
      state.verificationsError = action.payload;
    },
    captureAccountRequirementsError: (state, action: PayloadAction<Error | undefined>) => {
      state.accountRequirementsError = action.payload;
    },
    fetchIsLoadingPaymentRequests: (state, action: PayloadAction<boolean>) => {
      state.isLoadingPaymentRequests = action.payload;
    },
    fetchRefundIdempotencyKey: (state, action: PayloadAction<string | undefined>) => {
      state.refundIdempotencyKey = action.payload;
    },
    fetchPaymentListSuccess: (state, action: PayloadAction<PaymentConnection>) => {
      state.paymentConnection = action.payload;
      let items = state.payments;

      // Initialise the array if this is the first run, or a refresh. We know its a refresh
      // when the connection contains the first page of data.
      if (!items || !state.paymentConnection.pageInfo.hasPreviousPage) {
        items = [];
      }
      action.payload.nodes.map(node => {
        if (!items?.some(i => i.id === node?.id)) {
          items?.push(node as Payment);
        }
        return node;
      });
      state.payments = items;
    },
    fetchLastTabPath: (state, action: PayloadAction<string>) => {
      state.lastTabPath = action.payload;
    },
    fetchIsLoadingPayments: (state, action: PayloadAction<boolean>) => {
      state.isLoadingPayments = action.payload;
    },
    capturePaymentListError: (state, action: PayloadAction<Error | undefined>) => {
      state.paymentListError = action.payload;
    },
    capturePaymentSearch: (state, action: PayloadAction<string | undefined>) => {
      state.paymentQueryString = action.payload;
    },
    fetchRefundErrorMessage: (state, action: PayloadAction<string | null | undefined>) => {
      state.refundErrorMessage = action.payload;
    },
    fetchIsPaymentRefunded: (state, action: PayloadAction<boolean>) => {
      state.isPaymentRefunded = action.payload;
    },
    fetchPaymentRefundedAmount: (state, action: PayloadAction<number | undefined>) => {
      state.paymentRefundedAmount = action.payload;
    },
    captureUpdatePaymentRequestStatus: (state, action: PayloadAction<UpsertPaymentRequestStatus>) => {
      state.updatePaymentRequestStatus = action.payload;
    },
    clearUpdatePaymentRequestStatus: state => {
      state.updatePaymentRequestStatus = undefined;
    },
    captureUpdatePaymentRequestError: (state, action: PayloadAction<Error | undefined>) => {
      state.updatePaymentRequestError = action.payload;
    },
    clearUpdatePaymentRequestError: state => {
      state.updatePaymentRequestError = undefined;
    },
    capturePaymentById: (state, action: PayloadAction<Payment | undefined>) => {
      state.paymentById = action.payload;
    },
    capturePaymentByIdError: (state, action: PayloadAction<Error | undefined>) => {
      state.paymentByIdError = action.payload;
    },
    capturePaymentsReport: (state, action: PayloadAction<Report | undefined>) => {
      state.paymentsReport = action.payload;
    },
    capturePaymentsReportError: (state, action: PayloadAction<Error | undefined>) => {
      state.paymentsReportError = action.payload;
    },
    capturePaymentRequestById: (state, action: PayloadAction<PaymentRequest | undefined>) => {
      state.paymentRequestById = action.payload;
    },
    capturePaymentRequestByIdError: (state, action: PayloadAction<Error | undefined>) => {
      state.paymentRequestByIdError = action.payload;
    },
    fetchHasAdditionalBanner: (state, action: PayloadAction<boolean>) => {
      state.hasAdditionalBanner = action.payload;
    },
    capturePaymentRequestByIdAfterUpdate: (state, action: PayloadAction<PaymentRequest | undefined>) => {
      state.paymentRequestByIdAfterUpdate = action.payload;
    },
    capturePaymentRequestByIdAfterUpdateError: (state, action: PayloadAction<Error | undefined>) => {
      state.paymentRequestByIdAfterUpdateError = action.payload;
    },
    fetchIsPaymentRequestListInFlight: (state, action: PayloadAction<boolean>) => {
      state.isPaymentRequestListInFlight = action.payload;
    },
    fetchIsPaymentListInFlight: (state, action: PayloadAction<boolean>) => {
      state.isPaymentListInFlight = action.payload;
    },
    fetchSendingPaymentReceipt: (state, action: PayloadAction<boolean>) => {
      state.resendingPaymentReceipt = action.payload;
    },
    fetchResendPaymentReceiptError: (state, action: PayloadAction<Error | undefined>) => {
      state.resendPaymentReceiptError = action.payload;
    },
    fetchIsPaymentReceiptResent: (state, action: PayloadAction<boolean>) => {
      state.isPaymentReceiptResent = action.payload;
    },
    fetchPaymentFilterDateOption: (state, action: PayloadAction<string | undefined>) => {
      state.paymentFilterDateOption = action.payload;
    },
    fetchPaymentFilterCustomerOption: (state, action: PayloadAction<CustomerOption | undefined>) => {
      state.paymentFilterCustomerOption = action.payload;
    },
    fetchPaymentRequestFilterCustomerOption: (state, action: PayloadAction<CustomerOption | undefined>) => {
      state.paymentRequestFilterCustomerOption = action.payload;
    },
    fetchPaymentFilterFromDate: (state, action: PayloadAction<string | undefined>) => {
      state.paymentFilterFromDate = action.payload;
    },
    fetchPaymentFilterToDate: (state, action: PayloadAction<string | undefined>) => {
      state.paymentFilterToDate = action.payload;
    },
    fetchPaymentFilterAmountRange: (state, action: PayloadAction<boolean>) => {
      state.paymentFilterAmountRange = action.payload;
    },
    fetchPaymentFilterFromAmount: (state, action: PayloadAction<number | undefined>) => {
      state.paymentFilterFromAmount = action.payload;
    },
    fetchPaymentFilterToAmount: (state, action: PayloadAction<number | undefined>) => {
      state.paymentFilterToAmount = action.payload;
    },
    fetchPaymentFilterStatusList: (state, action: PayloadAction<AllPaymentStatusFilterValue[] | undefined>) => {
      state.paymentFilterStatusList = action.payload;
    },
    fetchPaymentFilterStatusCount: (state, action: PayloadAction<number>) => {
      state.paymentFilterStatusCount = action.payload;
    },
    fetchAllPaymentsStatusList: (state, action: PayloadAction<PaymentStatus[] | undefined>) => {
      state.allPaymentsStatusList = action.payload;
    },
    fetchAllPaymentsStatusExtendedList: (state, action: PayloadAction<PaymentStatusExtended[] | undefined>) => {
      state.allPaymentsStatusExtendedList = action.payload;
    },
    fetchPaymentRequestFilterStatusList: (state, action: PayloadAction<AllPaymentRequestsStatusFilterValue[] | undefined>) => {
      state.paymentRequestFilterStatusList = action.payload;
    },
    fetchPaymentRequestFilterStatusCount: (state, action: PayloadAction<number>) => {
      state.paymentRequestFilterStatusCount = action.payload;
    },
    fetchAllPaymentRequestStatusList: (state, action: PayloadAction<PaymentRequestStatus[] | undefined>) => {
      state.allPaymentRequestStatusList = action.payload;
    },
    fetchReloadPaymentsAfterFilter: (state, action: PayloadAction<boolean>) => {
      state.reloadPaymentsAfterFilter = action.payload;
    },
    fetchReloadPaymentRequestsAfterFilter: (state, action: PayloadAction<boolean>) => {
      state.reloadPaymentRequestsAfterFilter = action.payload;
    },
    captureGenerateStatementAccessUrl: (state, action: PayloadAction<string | undefined>) => {
      state.generateStatementAccessUrl = action.payload;
    },
    captureGenerateStatementAccessUrlError: (state, action: PayloadAction<Error | undefined>) => {
      state.generateStatementAccessUrlError = action.payload;
    },
    captureGenerateStatementAccessUrlInFlight: (state, action: PayloadAction<boolean>) => {
      state.generateStatementAccessUrlInFlight = action.payload;
    },
    clearGenerateStatementAccess: state => {
      state.generateStatementAccessUrl = undefined;
      state.generateStatementAccessUrlError = undefined;
      state.generateStatementAccessUrlInFlight = false;
    },
    fetchIsCustomerOptionInFlight: (state, action: PayloadAction<boolean>) => {
      state.isCustomerOptionInFlight = action.payload;
    },
    captureCustomerOptionError: (state, action: PayloadAction<Error | undefined>) => {
      state.customerOptionError = action.payload;
    },
    clearCustomerOptionList: state => {
      state.customerOptionList = undefined;
    },
    fetchCustomerOptionListSuccess: (state, action: PayloadAction<CustomerConnection>) => {
      const customerList: CustomerOption[] = state.customerOptionList || [];
      action.payload.nodes.forEach(customer => {
        const option: CustomerOption = { id: customer?.id, name: customer?.name, customerNumber: customer?.customerNumber };
        if (option.id && option.customerNumber && !customerList.some(c => c.id === option.id)) customerList.push(option);
      });
      state.customerOptionList = customerList;
    },
    fetchIsRemindPaymentRequestsInFlight: (state, action: PayloadAction<boolean>) => {
      state.isRemindPaymentRequestsInFlight = action.payload;
    },
    fetchRemindPaymentRequestsSuccessCount: (state, action: PayloadAction<number>) => {
      state.remindPaymentRequestsSuccessCount = action.payload;
    },
    fetchForwardPaymentRequestInFlight: (state, action: PayloadAction<boolean>) => {
      state.forwardPaymentRequestInFlight = action.payload;
    },
    captureForwardPaymentRequestError: (state, action: PayloadAction<Error | undefined>) => {
      state.forwardPaymentRequestError = action.payload;
    },
    captureForwardPaymentRequestSucccess: (state, action: PayloadAction<PaymentRequestForwardStatus | null>) => {
      state.forwardPaymentRequestSuccess = action.payload;
    },
    capturePayoutReport: (state, action: PayloadAction<PayoutReport | undefined>) => {
      state.payoutReport = action.payload;
    },
    capturePayoutReportError: (state, action: PayloadAction<Error | undefined>) => {
      state.payoutReportError = action.payload;
    },
    capturePayoutReportInFlight: (state, action: PayloadAction<boolean>) => {
      state.payoutReportInFlight = action.payload;
    },
    capturePayoutReportCancelledInFlight: (state, action: PayloadAction<boolean>) => {
      state.payoutReportCancelledInFlight = action.payload;
    },
    captureExportsCancelledInFlight: (state, action: PayloadAction<boolean>) => {
      state.exportsCancelledInFlight = action.payload;
    },
    captureGeneratingExportInFlight: (state, action: PayloadAction<boolean>) => {
      state.generatingExportInFlight = action.payload;
    },
  },
});

export const selectAccountRequirements = (state: RootState): AccountRequirements | undefined => state.home.accountRequirements;
export const selectInvolvedUsers = (state: RootState): Person[] | undefined => state.home.involvedUsers;
export const selectPaymentRequestConnection = (state: RootState): PaymentRequestConnection | undefined =>
  state.home.paymentRequestConnection;
export const selectPaymentRequests = (state: RootState): PaymentRequest[] | undefined => state.home.paymentRequests;
export const selectPaymentRequestSearch = (state: RootState): string | undefined => state.home.paymentRequestQueryString;
export const selectReminderStatus = (state: RootState): UpsertPaymentRequestStatus | undefined => state.home.reminderStatus;
export const selectRefundStatus = (state: RootState): string | undefined => state.home.refundStatusCode;
export const selectVerificationStatus = (state: RootState): MutationStatusCode | undefined => state.home.verificationStatus?.code;
export const selectSearchError = (state: RootState): Error | undefined => state.home.searchError;
export const selectInvolvedUsersError = (state: RootState): Error | undefined => state.home.involvedUsersError;
export const selectRefundError = (state: RootState): Error | undefined => state.home.refundError;
export const selectRemindError = (state: RootState): Error | undefined => state.home.remindError;
export const selectCloseOrCompleteError = (state: RootState): Error | undefined => state.home.closeOrCompleteError;
export const selectVerificationsError = (state: RootState): Error | undefined => state.home.verificationsError;
export const selectAccountRequirementsError = (state: RootState): Error | undefined => state.home.accountRequirementsError;
export const selectIsLoadingPaymentRequests = (state: RootState): boolean => state.home.isLoadingPaymentRequests;
export const selectRefundIdempotencyKey = (state: RootState): string | undefined => state.home.refundIdempotencyKey;
export const selectPaymentConnection = (state: RootState): PaymentConnection | undefined => state.home.paymentConnection;
export const selectPayments = (state: RootState): Payment[] | undefined => state.home.payments;
export const selectPaymentSearch = (state: RootState): string | undefined => state.home.paymentQueryString;
export const selectIsLoadingPayments = (state: RootState): boolean => state.home.isLoadingPayments;
export const selectRefundErrorMessage = (state: RootState): string | null | undefined => state.home.refundErrorMessage;
export const selectIsPaymentRefunded = (state: RootState): boolean => state.home.isPaymentRefunded;
export const selectPaymentRefundedAmount = (state: RootState): number | undefined => state.home.paymentRefundedAmount;
export const selectUpdatePaymentRequestStatus = (state: RootState): UpsertPaymentRequestStatus | undefined =>
  state.home.updatePaymentRequestStatus;
export const selectUpdatePaymentRequestError = (state: RootState): Error | undefined => state.home.updatePaymentRequestError;
export const selectPaymentById = (state: RootState): Payment | undefined => state.home.paymentById;
export const selectPaymentByIdError = (state: RootState): Error | undefined => state.home.paymentByIdError;
export const selectPaymentsReport = (state: RootState): Report | undefined => state.home.paymentsReport;
export const selectPaymentsReportError = (state: RootState): Error | undefined => state.home.paymentsReportError;
export const selectPaymentRequestById = (state: RootState): PaymentRequest | undefined => state.home.paymentRequestById;
export const selectPaymentRequestByIdError = (state: RootState): Error | undefined => state.home.paymentRequestByIdError;
export const selectHasAdditionalBanner = (state: RootState): boolean => state.home.hasAdditionalBanner;
export const selectPrimaryAccountUser = (state: RootState): Person | undefined => state.home.primaryAccountUser;
export const selectPaymentRequestByIdAfterUpdate = (state: RootState): PaymentRequest | undefined =>
  state.home.paymentRequestByIdAfterUpdate;
export const selectPaymentRequestByIdAfterUpdateError = (state: RootState): Error | undefined =>
  state.home.paymentRequestByIdAfterUpdateError;
export const selectIsPaymentRequestListInFlight = (state: RootState): boolean => state.home.isPaymentRequestListInFlight;
export const selectIsPaymentListInFlight = (state: RootState): boolean => state.home.isPaymentListInFlight;
export const selectResendingPaymentReceipt = (state: RootState): boolean => state.home.resendingPaymentReceipt;
export const selectResendPaymentReceiptError = (state: RootState): ApolloError | undefined =>
  state.home.resendPaymentReceiptError as ApolloError;
export const selectIsPaymentReceiptResent = (state: RootState): boolean => state.home.isPaymentReceiptResent;
export const selectPaymentFilterDateOption = (state: RootState): string | undefined => state.home.paymentFilterDateOption;
export const selectPaymentFilterCustomerOption = (state: RootState): CustomerOption | undefined =>
  state.home.paymentFilterCustomerOption;
export const selectPaymentRequestFilterCustomerOption = (state: RootState): CustomerOption | undefined =>
  state.home.paymentRequestFilterCustomerOption;
export const selectPaymentFilterFromDate = (state: RootState): string | undefined => state.home.paymentFilterFromDate;
export const selectPaymentFilterToDate = (state: RootState): string | undefined => state.home.paymentFilterToDate;
export const selectPaymentFilterAmountRange = (state: RootState): boolean => state.home.paymentFilterAmountRange;
export const selectPaymentFilterFromAmount = (state: RootState): number | undefined => state.home.paymentFilterFromAmount;
export const selectPaymentFilterToAmount = (state: RootState): number | undefined => state.home.paymentFilterToAmount;
export const selectPaymentFilterStatusList = (state: RootState): AllPaymentStatusFilterValue[] | undefined =>
  state.home.paymentFilterStatusList;
export const selectPaymentRequestFilterStatusList = (state: RootState): AllPaymentRequestsStatusFilterValue[] | undefined =>
  state.home.paymentRequestFilterStatusList;
export const selectPaymentFilterStatusCount = (state: RootState): number => state.home.paymentFilterStatusCount;
export const selectPaymentRequestFilterStatusCount = (state: RootState): number => state.home.paymentRequestFilterStatusCount;
export const selectAllPaymentsStatusList = (state: RootState): PaymentStatus[] | undefined => state.home.allPaymentsStatusList;
export const selectAllPaymentsStatusExtendedList = (state: RootState): PaymentStatusExtended[] | undefined =>
  state.home.allPaymentsStatusExtendedList;
export const selectAllPaymentRequestStatusList = (state: RootState): PaymentRequestStatus[] | undefined =>
  state.home.allPaymentRequestStatusList;
export const selectReloadPaymentsAfterFilter = (state: RootState): boolean => state.home.reloadPaymentsAfterFilter;
export const selectReloadPaymentRequestsAfterFilter = (state: RootState): boolean => state.home.reloadPaymentRequestsAfterFilter;
export const selectGenerateStatementAccessUrl = (state: RootState): string | undefined => state.home.generateStatementAccessUrl;
export const selectGenerateStatementAccessUrlError = (state: RootState): Error | undefined =>
  state.home.generateStatementAccessUrlError;
export const selectGenerateStatementAccessUrlInFlight = (state: RootState): boolean => state.home.generateStatementAccessUrlInFlight;
export const selectIsCustomerOptionInFlight = (state: RootState): boolean => state.home.isCustomerOptionInFlight;
export const selectCustomerOptionError = (state: RootState): Error | undefined => state.home.customerOptionError;
export const selectCustomerOptionList = (state: RootState): CustomerOption[] | undefined => state.home.customerOptionList;
export const selectIsRemindPaymentRequestsInFlight = (state: RootState): boolean => state.home.isRemindPaymentRequestsInFlight;
export const selectRemindPaymentRequestsSuccessCount = (state: RootState): number => state.home.remindPaymentRequestsSuccessCount;
export const selectForwardPaymentRequestInFlight = (state: RootState): boolean => state.home.forwardPaymentRequestInFlight;
export const selectForwardPaymentRequestError = (state: RootState): Error | undefined => state.home.forwardPaymentRequestError;
export const selectForwardPaymentRequestSuccess = (state: RootState): PaymentRequestForwardStatus | null =>
  state.home.forwardPaymentRequestSuccess;
export const selectLastTabPath = (state: RootState): string => state.home.lastTabPath;
export const selectPayoutReport = (state: RootState): PayoutReport | undefined => state.home.payoutReport;
export const selectPayoutReportError = (state: RootState): Error | undefined => state.home.payoutReportError;
export const selectPayoutReportInFlight = (state: RootState): boolean => state.home.payoutReportInFlight;
export const selectPayoutReportCancelledInFlight = (state: RootState): boolean => state.home.payoutReportCancelledInFlight;
export const selectExportsCancelledInFlight = (state: RootState): boolean => state.home.exportsCancelledInFlight;
export const selectGeneratingExportInFlight = (state: RootState): boolean => state.home.generatingExportInFlight;

export const {
  captureReminderStatus,
  clearReminderStatus,
  fetchAccountRequirementsSuccess,
  fetchInvolvedUsersSuccess,
  fetchPaymentRequestListSuccess,
  capturePaymentRequestSearch,
  uploadDocumentSuccess,
  uploadDocumentFailure,
  clearDocument,
  captureRefundSuccess,
  clearRefundStatus,
  captureSearchError,
  captureInvolvedUsersError,
  captureRefundError,
  captureRemindError,
  captureCloseOrCompleteError,
  captureVerificationsError,
  captureAccountRequirementsError,
  captureVerificationStatus,
  clearVerificationStatus,
  fetchIsLoadingPaymentRequests,
  fetchRefundIdempotencyKey,
  fetchPaymentListSuccess,
  fetchIsLoadingPayments,
  capturePaymentListError,
  capturePaymentSearch,
  fetchRefundErrorMessage,
  fetchIsPaymentRefunded,
  fetchPaymentRefundedAmount,
  captureUpdatePaymentRequestStatus,
  clearUpdatePaymentRequestStatus,
  captureUpdatePaymentRequestError,
  clearUpdatePaymentRequestError,
  capturePaymentById,
  capturePaymentByIdError,
  capturePaymentsReport,
  capturePaymentsReportError,
  capturePaymentRequestById,
  capturePaymentRequestByIdError,
  fetchHasAdditionalBanner,
  capturePaymentRequestByIdAfterUpdate,
  capturePaymentRequestByIdAfterUpdateError,
  fetchIsPaymentListInFlight,
  fetchIsPaymentRequestListInFlight,
  fetchResendPaymentReceiptError,
  fetchSendingPaymentReceipt,
  fetchIsPaymentReceiptResent,
  fetchPaymentFilterDateOption,
  fetchPaymentFilterCustomerOption,
  fetchPaymentRequestFilterCustomerOption,
  fetchPaymentFilterFromAmount,
  fetchPaymentFilterFromDate,
  fetchPaymentFilterToAmount,
  fetchPaymentFilterToDate,
  fetchPaymentFilterAmountRange,
  fetchPaymentFilterStatusList,
  fetchPaymentRequestFilterStatusList,
  fetchPaymentFilterStatusCount,
  fetchPaymentRequestFilterStatusCount,
  fetchAllPaymentsStatusList,
  fetchAllPaymentRequestStatusList,
  fetchReloadPaymentsAfterFilter,
  fetchReloadPaymentRequestsAfterFilter,
  fetchAllPaymentsStatusExtendedList,
  captureGenerateStatementAccessUrl,
  captureGenerateStatementAccessUrlError,
  captureGenerateStatementAccessUrlInFlight,
  clearGenerateStatementAccess,
  fetchCustomerOptionListSuccess,
  fetchIsCustomerOptionInFlight,
  clearCustomerOptionList,
  captureCustomerOptionError,
  fetchIsRemindPaymentRequestsInFlight,
  fetchRemindPaymentRequestsSuccessCount,
  captureForwardPaymentRequestError,
  captureForwardPaymentRequestSucccess,
  fetchForwardPaymentRequestInFlight,
  fetchLastTabPath,
  capturePayoutReport,
  capturePayoutReportError,
  capturePayoutReportInFlight,
  capturePayoutReportCancelledInFlight,
  captureExportsCancelledInFlight,
  captureGeneratingExportInFlight,
} = slice.actions;

export default slice.reducer;
