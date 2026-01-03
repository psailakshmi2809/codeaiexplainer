import { gqlClient } from '../../components/AppProvider';
import {
  CommunicationType,
  MutationStatusCode,
  PaymentRequestConnection,
  PaymentRequestOrder,
  DocumentTokenInput,
  Person,
  PaymentOrder,
  PaymentConnection,
  PaymentRequestStatus,
  Payment,
  FileFormat,
  PaymentRequest,
  ReportType,
  Report,
  ReportStatus,
  PaymentStatus,
  PaymentStatusExtended,
  AmountRange,
  CustomerOrder,
  CustomerConnection,
  PaymentRequestForwardInput,
  PayoutReport,
} from '../../gql-types.generated';
import { mutationRefund } from '../../gql/MutationRefund';
import { mutationUpsertPaymentRequest } from '../../gql/MutationUpsertPaymentRequest';
import { queryAccountRequirements } from '../../gql/QueryAdditionalVerifications';
import { queryPaymentRequestConnection } from '../../gql/QueryPaymentRequestConnection';
import { queryPaymentConnection } from '../../gql/QueryPaymentConnection';
import store, { AppDispatch, AppThunk } from '../../store';
import { decrementRequestsInFlight, incrementRequestsInFlight } from '../app/AppSlice';
import {
  captureRefundSuccess,
  fetchAccountRequirementsSuccess,
  fetchPaymentRequestListSuccess,
  captureSearchError,
  captureInvolvedUsersError,
  captureRefundError,
  captureRemindError,
  captureCloseOrCompleteError,
  captureVerificationsError,
  captureAccountRequirementsError,
  captureReminderStatus,
  captureVerificationStatus,
  fetchInvolvedUsersSuccess,
  fetchIsLoadingPaymentRequests,
  fetchIsLoadingPayments,
  fetchRefundIdempotencyKey,
  fetchPaymentListSuccess,
  capturePaymentListError,
  fetchRefundErrorMessage,
  captureUpdatePaymentRequestStatus,
  captureUpdatePaymentRequestError,
  capturePaymentById,
  capturePaymentByIdError,
  capturePaymentsReportError,
  capturePaymentsReport,
  capturePaymentRequestById,
  capturePaymentRequestByIdError,
  capturePaymentRequestByIdAfterUpdate,
  capturePaymentRequestByIdAfterUpdateError,
  fetchIsPaymentRequestListInFlight,
  fetchIsPaymentListInFlight,
  fetchSendingPaymentReceipt,
  fetchResendPaymentReceiptError,
  fetchIsPaymentReceiptResent,
  captureGenerateStatementAccessUrlError,
  captureGenerateStatementAccessUrl,
  captureGenerateStatementAccessUrlInFlight,
  captureCustomerOptionError,
  fetchIsCustomerOptionInFlight,
  fetchCustomerOptionListSuccess,
  clearCustomerOptionList,
  fetchRemindPaymentRequestsSuccessCount,
  fetchIsRemindPaymentRequestsInFlight,
  fetchForwardPaymentRequestInFlight,
  captureForwardPaymentRequestError,
  captureForwardPaymentRequestSucccess,
  capturePayoutReport,
  capturePayoutReportError,
  capturePayoutReportInFlight,
  captureExportsCancelledInFlight,
  captureGeneratingExportInFlight,
  capturePayoutReportCancelledInFlight,
} from './HomeSlice';
import { mutationSubmitVerification } from '../../gql/MutationSubmitVerification';
import { queryPersonList } from '../../gql/QueryPersonList';
import { queryReport } from '../../gql/QueryReport';
import { mutationCreateReport } from '../../gql/MutationCreateReport';
import { REPORT_TIME_INTERVAL, REPORT_TIME_LIMIT, PAYOUT_TIME_INTERVAL } from '../../util/Constants';
import { DateTime } from 'luxon';
import { mutationResendPaymentReceipt } from '../../gql/MutationResendPaymentReciept';
import { mutationGenerateStatementAccessUrl } from '../../gql/MutationGenerateStatementAccessUrl';
import { queryCustomersConnection } from '../../gql/QueryCustomersConnection';
import { paymentRequestForward } from '../../gql/MutationForwardPaymentRequest';
import { ApolloError } from '@apollo/client';
import { queryPayoutReport } from '../../gql/QueryPayoutReport';

export const fetchInvolvedUsers =
  () =>
  async (dispatch: AppDispatch): Promise<void> => {
    dispatch(incrementRequestsInFlight());
    try {
      const involvedUsers = await queryPersonList(gqlClient);
      if (involvedUsers) {
        dispatch(fetchInvolvedUsersSuccess(involvedUsers as Person[]));
      }
      dispatch(decrementRequestsInFlight());
    } catch (e) {
      console.error(e);
      dispatch(captureInvolvedUsersError(e));
      dispatch(decrementRequestsInFlight());
    }
  };

export const fetchAccountRequirements =
  () =>
  async (dispatch: AppDispatch): Promise<void> => {
    dispatch(incrementRequestsInFlight());
    try {
      const accountRequirements = await queryAccountRequirements(gqlClient);
      if (accountRequirements) {
        dispatch(fetchAccountRequirementsSuccess(accountRequirements));
        dispatch(fetchInvolvedUsers());
      }
      dispatch(decrementRequestsInFlight());
    } catch (e) {
      console.error(e);
      dispatch(captureAccountRequirementsError(e));
      dispatch(decrementRequestsInFlight());
    }
  };

export const fetchPaymentRequestList =
  (
    after: string | undefined,
    pageSize: number | undefined,
    orderBy: PaymentRequestOrder,
    queryString: string | undefined,
    status: PaymentRequestStatus | undefined,
    statusFilter: PaymentRequestStatus[] | undefined,
    customerId: string | undefined,
    id?: string,
  ) =>
  async (dispatch: AppDispatch): Promise<void> => {
    try {
      //clearing search error before making another request
      dispatch(captureSearchError(undefined));
      dispatch(fetchIsPaymentRequestListInFlight(true));

      // NOTE: The last n items does nothing, so we'll pass in 0
      const last = 0;
      const before = undefined;
      const first = pageSize || 25;
      const modifiedQueryString = queryString && queryString.trim().length > 0 ? queryString.trim() : undefined;
      if (!after) {
        dispatch(fetchIsLoadingPaymentRequests(true));
      }
      const paymentRequestList = await queryPaymentRequestConnection(
        gqlClient,
        after,
        before,
        first,
        last,
        orderBy,
        modifiedQueryString,
        status,
        statusFilter,
        customerId,
        id,
      );
      if (paymentRequestList) {
        dispatch(fetchPaymentRequestListSuccess(paymentRequestList as PaymentRequestConnection));
        if (!after) {
          dispatch(fetchIsLoadingPaymentRequests(false));
        }
      }
      dispatch(fetchIsPaymentRequestListInFlight(false));
    } catch (e) {
      console.error(e);
      dispatch(captureSearchError(e));
      if (!after) {
        dispatch(fetchIsLoadingPaymentRequests(false));
      }
      dispatch(fetchIsPaymentRequestListInFlight(false));
    }
  };

export const fetchPaymentList =
  (
    after: string | undefined,
    pageSize: number | undefined,
    orderBy: PaymentOrder,
    queryString: string | undefined,
    status: PaymentStatus[] | undefined,
    extendedPaymentStatus: PaymentStatusExtended[] | undefined,
    startDate: string | undefined,
    endDate: string | undefined,
    startAmount: number | undefined,
    endAmount: number | undefined,
    customerId: string | undefined,
  ) =>
  async (dispatch: AppDispatch): Promise<void> => {
    try {
      //clearing search error before making another request
      dispatch(captureSearchError(undefined));
      dispatch(fetchIsPaymentListInFlight(true));

      const last = 0;
      const before = undefined;
      const first = pageSize || 25;
      const paymentId = undefined;
      const modifiedQueryString = queryString && queryString.trim().length > 0 ? queryString.trim() : undefined;
      let amountRange: AmountRange | undefined;
      if (startAmount && endAmount) {
        amountRange = {
          start: startAmount,
          end: endAmount,
        };
      }

      let updatedStartDate: string | undefined;
      let updatedEndDate: string | undefined;
      if (startDate && endDate) {
        // Getting the time difference between local and utc
        const timeOffset = new Date().getTimezoneOffset();
        // Converting date according to time difference between local and utc
        updatedStartDate = DateTime.fromISO(startDate).toUTC().plus({ minutes: timeOffset }).toISO();
        updatedEndDate = DateTime.fromISO(endDate).toUTC().plus({ minutes: timeOffset }).toISO();
      }

      if (!after) {
        dispatch(fetchIsLoadingPayments(true));
      }
      const paymentList = await queryPaymentConnection(
        gqlClient,
        after,
        before,
        first,
        last,
        orderBy,
        modifiedQueryString,
        status,
        extendedPaymentStatus,
        updatedStartDate,
        updatedEndDate,
        amountRange,
        customerId,
        paymentId,
      );
      if (paymentList) {
        dispatch(fetchPaymentListSuccess(paymentList as PaymentConnection));
        if (!after) {
          dispatch(fetchIsLoadingPayments(false));
        }
      }
      dispatch(fetchIsPaymentListInFlight(false));
    } catch (e) {
      dispatch(captureSearchError(e));
      dispatch(capturePaymentListError(e));
      if (!after) {
        dispatch(fetchIsLoadingPayments(false));
      }
      dispatch(fetchIsPaymentListInFlight(false));
    }
  };

export const refund =
  (
    refundIdempotencyKey: string,
    paymentId: string,
    refundReason: string,
    amount: number | null,
    paymentRequestId?: string,
  ): AppThunk =>
  async (dispatch: AppDispatch): Promise<void> => {
    try {
      const refundRequest = await mutationRefund(gqlClient, refundIdempotencyKey, paymentId, refundReason, amount, paymentRequestId);
      if (refundRequest && refundRequest.code) {
        dispatch(captureRefundSuccess(refundRequest.code));
        dispatch(fetchRefundIdempotencyKey(undefined)); //reset the refund idempotency key now that the refund call is finished
        if (refundRequest.code === MutationStatusCode.Error) {
          dispatch(captureRefundError({ message: refundRequest.message } as Error));
          dispatch(fetchRefundErrorMessage(refundRequest.message));
        }
      }
      if (!refundRequest) throw new Error('[HomeActions] Payment Request not sent');
      console.log('refundRequest: ', refundRequest);
      //dispatch(decrementRequestsInFlight());
    } catch (e) {
      console.error(e);
      if (e.message.trim().includes('Response not successful: Received status code 400')) {
        dispatch(captureRefundError(new Error('An error has occurred during the refund creation.')));
      } else {
        dispatch(captureRefundError(e));
      }
      dispatch(fetchRefundIdempotencyKey(undefined));
      //dispatch(decrementRequestsInFlight());
    }
  };

export const remindPaymentRequest =
  (
    referenceId: string,
    amount: number,
    id: string,
    invoiceId?: string,
    invoiceIds?: string[],
    email?: string,
    phone?: string,
  ): AppThunk =>
  async (dispatch: AppDispatch): Promise<void> => {
    try {
      const type = CommunicationType.Email;
      const paymentRequest = await mutationUpsertPaymentRequest(
        gqlClient,
        referenceId,
        type,
        amount,
        invoiceId,
        invoiceIds,
        email,
        phone,
        id,
      );
      if (paymentRequest) {
        dispatch(captureReminderStatus(paymentRequest));
        if (paymentRequest.code === MutationStatusCode.Error) {
          dispatch(captureRemindError({ message: paymentRequest.message } as Error));
        }
      }
      if (!paymentRequest) throw new Error('[HomeActions] Payment Reminder not sent');
    } catch (e) {
      console.error(e);
      dispatch(captureRemindError(e));
    }
  };

export const closeOrCompletePaymentRequest =
  (
    referenceId: string,
    amount: number,
    id: string,
    status: PaymentRequestStatus,
    statusReason: string,
    callback: () => void,
  ): AppThunk =>
  async (dispatch: AppDispatch): Promise<void> => {
    try {
      const type = CommunicationType.Email;
      const paymentRequest = await mutationUpsertPaymentRequest(
        gqlClient,
        referenceId,
        type,
        amount,
        undefined,
        undefined,
        undefined,
        undefined,
        id,
        status,
        statusReason,
      );
      if (paymentRequest) {
        callback();
        if (paymentRequest.code === MutationStatusCode.Error) {
          dispatch(captureCloseOrCompleteError({ message: paymentRequest.message } as Error));
        }
      }
      if (!paymentRequest) throw new Error('[HomeActions] Payment Reminder not sent');
    } catch (e) {
      console.error(e);
      dispatch(captureCloseOrCompleteError(e));
    }
  };
export const upsertVerifications =
  (documentTokens: DocumentTokenInput[]): AppThunk =>
  async (dispatch: AppDispatch): Promise<void> => {
    try {
      const submitVerification = await mutationSubmitVerification(gqlClient, documentTokens);
      if (submitVerification) {
        dispatch(captureVerificationStatus(submitVerification));
        if (submitVerification.code === MutationStatusCode.Error) {
          dispatch(captureVerificationsError({ message: submitVerification.message } as Error));
        }
      }
      if (!submitVerification) throw new Error('[HomeActions] Verifications not submitted');
    } catch (e) {
      console.error(e);
      dispatch(captureVerificationsError(e));
    }
  };

// export const downloadStatement = (startDate: Date, endDate: Date): AppThunk => async (dispatch: AppDispatch): Promise<void> => {
//   try {
//     const statement = await mutationStatement(gqlClient, startDate, endDate);
//     if (!statement) {
//       throw new Error('[HomeActions] Generate statement request not sent');
//     }
//   } catch (e) {
//     console.error(e);
//   }
// };

export const updatePaymentRequest =
  (
    referenceId: string,
    amount: number,
    id: string,
    invoiceId?: string,
    invoiceIds?: string[],
    email?: string,
    phone?: string,
  ): AppThunk =>
  async (dispatch: AppDispatch): Promise<void> => {
    try {
      let type = CommunicationType.None;
      if (email && phone) {
        type = CommunicationType.EmailAndSms;
      } else if (email) {
        type = CommunicationType.Email;
      } else if (phone) {
        type = CommunicationType.Sms;
      }

      const paymentRequest = await mutationUpsertPaymentRequest(
        gqlClient,
        referenceId,
        type,
        amount,
        invoiceId,
        invoiceIds,
        email,
        phone,
        id,
      );
      if (paymentRequest) {
        dispatch(captureUpdatePaymentRequestStatus(paymentRequest));
        if (paymentRequest.code === MutationStatusCode.Error) {
          dispatch(captureUpdatePaymentRequestError({ message: paymentRequest.message } as Error));
        }
      }
      if (!paymentRequest) throw new Error('Unable to update Payment Request');
    } catch (e) {
      dispatch(captureUpdatePaymentRequestError(e));
    }
  };

export const fetchPaymentById =
  (orderBy: PaymentOrder, paymentId: string) =>
  async (dispatch: AppDispatch): Promise<void> => {
    try {
      const after = undefined;
      const before = undefined;
      const first = 1;
      const last = 0;
      const status = undefined;
      const customerId = undefined;
      const extendedPaymentStatus = undefined;
      const startDate = undefined;
      const endDate = undefined;
      const amountRange = undefined;
      const queryString = undefined;
      const paymentConnection = await queryPaymentConnection(
        gqlClient,
        after,
        before,
        first,
        last,
        orderBy,
        queryString,
        status,
        extendedPaymentStatus,
        startDate,
        endDate,
        amountRange,
        customerId,
        paymentId,
      );
      const payment = paymentConnection?.nodes[0];
      if (payment) {
        dispatch(capturePaymentById(payment as Payment));
      } else {
        throw new Error('Unable to fetch Payment');
      }
    } catch (e) {
      dispatch(capturePaymentByIdError(e));
    }
  };

const queryPaymentsReport = async (id: string): Promise<Report | undefined> => {
  const timeInterval = parseInt(REPORT_TIME_INTERVAL);
  const timeLimit = parseInt(REPORT_TIME_LIMIT);

  const initialTime = Date.now();
  let queryTime = Date.now();
  let storeState = store.getState();

  while (queryTime - initialTime < timeLimit) {
    try {
      // eslint-disable-next-line no-await-in-loop
      const report = await queryReport(gqlClient, id);
      // if the request was cancelled in between
      // getting the state from store
      storeState = store.getState();
      const { exportsCancelledInFlight } = storeState.home;
      if (exportsCancelledInFlight) return undefined;

      if (report && report.downloadUrl && report.status === ReportStatus.Completed) return report;

      if (report?.status === ReportStatus.Failed) return undefined;
    } catch (e) {
      // if the request was cancelled in between
      // getting the state from store
      storeState = store.getState();
      const { exportsCancelledInFlight } = storeState.home;
      if (exportsCancelledInFlight) return undefined;
      // doing nothing to handle error, so that subsequent requests can be made
    } finally {
      // eslint-disable-next-line no-loop-func
      setTimeout(() => {
        queryTime = Date.now();
      }, timeInterval);
    }
  }
  return undefined;
};

export const createPaymentsReport =
  (endDate: string, format: FileFormat, startDate: string) =>
  async (dispatch: AppDispatch): Promise<void> => {
    try {
      dispatch(captureGeneratingExportInFlight(true));
      dispatch(captureExportsCancelledInFlight(false));
      const reportType = ReportType.Payment;
      const reportStatus = await mutationCreateReport(gqlClient, endDate, format, reportType, startDate);

      dispatch(captureGeneratingExportInFlight(false));
      if (reportStatus && reportStatus.report?.id) {
        //fetching report after mutation
        const report = await queryPaymentsReport(reportStatus.report?.id);
        // getting the state from store
        const storeState = store.getState();
        const { exportsCancelledInFlight } = storeState.home;
        if (report) {
          dispatch(capturePaymentsReport(report));
        } else if (!exportsCancelledInFlight) {
          // error handling if don't get the report with completed status in time limit
          throw new Error('Unable to fetch Payments Report');
        } else {
          // clearing cancelled in flight state immediately after
          dispatch(captureExportsCancelledInFlight(false));
        }
      } else {
        // error handling if don't get the creteReport response
        throw new Error('Unable to create Payments Report');
      }
    } catch (e) {
      dispatch(captureGeneratingExportInFlight(false));
      dispatch(capturePaymentsReportError(e));
    }
  };

export const fetchPaymentRequestById =
  (orderBy: PaymentRequestOrder, id: string) =>
  async (dispatch: AppDispatch): Promise<void> => {
    try {
      const after = undefined;
      const before = undefined;
      const first = 1;
      const last = 0;
      const queryString = undefined;
      const status = undefined;
      const statusFilter = undefined;
      const customerId = undefined;
      const paymentRequestConnection = await queryPaymentRequestConnection(
        gqlClient,
        after,
        before,
        first,
        last,
        orderBy,
        queryString,
        status,
        statusFilter,
        customerId,
        id,
      );
      const paymentRequest = paymentRequestConnection?.nodes[0];
      if (paymentRequest) {
        dispatch(capturePaymentRequestById(paymentRequest as PaymentRequest));
      } else {
        throw new Error('Unable to fetch Payment Request');
      }
    } catch (e) {
      dispatch(capturePaymentRequestByIdError(e));
    }
  };

export const fetchPaymentRequestByIdAfterUpdate =
  (orderBy: PaymentRequestOrder, id: string) =>
  async (dispatch: AppDispatch): Promise<void> => {
    try {
      dispatch(capturePaymentRequestByIdAfterUpdateError(undefined));
      dispatch(capturePaymentRequestByIdAfterUpdate(undefined));
      const after = undefined;
      const before = undefined;
      const first = 1;
      const last = 0;
      const queryString = undefined;
      const status = undefined;
      const statusFilter = undefined;
      const customerId = undefined;
      const paymentRequestConnection = await queryPaymentRequestConnection(
        gqlClient,
        after,
        before,
        first,
        last,
        orderBy,
        queryString,
        status,
        statusFilter,
        customerId,
        id,
      );
      const paymentRequest = paymentRequestConnection?.nodes[0];
      if (paymentRequest) {
        dispatch(capturePaymentRequestByIdAfterUpdate(paymentRequest as PaymentRequest));
      } else {
        throw new Error('Unable to fetch Payment Request');
      }
    } catch (e) {
      dispatch(capturePaymentRequestByIdAfterUpdateError(e));
    }
  };

export const resendPaymentReceipt =
  (paymentId: string) =>
  async (dispatch: AppDispatch): Promise<void> => {
    try {
      dispatch(fetchSendingPaymentReceipt(true));
      dispatch(fetchResendPaymentReceiptError(undefined));
      const resendPaymentReceiptStatus = await mutationResendPaymentReceipt(gqlClient, paymentId);
      if (resendPaymentReceiptStatus) {
        dispatch(fetchIsPaymentReceiptResent(true));
        dispatch(fetchSendingPaymentReceipt(false));
      } else {
        dispatch(fetchSendingPaymentReceipt(false));
        throw new Error('Unable to resend payment receipt.');
      }
    } catch (e) {
      dispatch(fetchSendingPaymentReceipt(false));
      dispatch(fetchResendPaymentReceiptError(e as ApolloError));
    }
  };

export const fetchGenerateStatementAccessUrl =
  (statementName: string) =>
  async (dispatch: AppDispatch): Promise<void> => {
    try {
      dispatch(captureGenerateStatementAccessUrlError(undefined));
      dispatch(captureGenerateStatementAccessUrl(undefined));
      dispatch(captureGenerateStatementAccessUrlInFlight(true));

      const generateStatementAccessUrl = await mutationGenerateStatementAccessUrl(gqlClient, statementName);
      const statementUrl = generateStatementAccessUrl?.statementUrl;

      if (statementUrl) {
        dispatch(captureGenerateStatementAccessUrl(statementUrl));
        dispatch(captureGenerateStatementAccessUrlInFlight(false));
      } else {
        throw new Error(generateStatementAccessUrl?.error || generateStatementAccessUrl?.message || 'Unable to generate statement');
      }
    } catch (e) {
      dispatch(captureGenerateStatementAccessUrlError(e));
      dispatch(captureGenerateStatementAccessUrlInFlight(false));
    }
  };

export const fetchCustomerOptionList =
  (orderBy: CustomerOrder, queryString?: string) =>
  async (dispatch: AppDispatch): Promise<void> => {
    try {
      //clearing search error and previous results before making another request
      dispatch(captureCustomerOptionError(undefined));
      dispatch(clearCustomerOptionList());
      dispatch(fetchIsCustomerOptionInFlight(true));

      let after: string | undefined;
      const before = undefined;
      const first = 50;
      const last = 0;
      const startDate = undefined;
      const endDate = undefined;
      const dateRangeType = undefined;
      const id = undefined;

      let hasMoreResults = true;
      let resultIndex = 0;

      while (hasMoreResults && resultIndex < 4) {
        // eslint-disable-next-line no-await-in-loop
        const customerOptionList: CustomerConnection | undefined = await queryCustomersConnection(gqlClient, {
          after,
          before,
          first,
          last,
          orderBy,
          queryString,
          startDate,
          endDate,
          dateRangeType,
          id,
        });
        if (customerOptionList) {
          dispatch(fetchCustomerOptionListSuccess(customerOptionList));
        }
        hasMoreResults = customerOptionList?.pageInfo.hasNextPage || false;
        after = customerOptionList?.pageInfo.endCursor || undefined;
        resultIndex += 1;
      }
      dispatch(fetchIsCustomerOptionInFlight(false));
    } catch (e) {
      dispatch(captureCustomerOptionError(e));
      dispatch(fetchIsCustomerOptionInFlight(false));
      dispatch(clearCustomerOptionList());
    }
  };

export const remindPaymentRequests =
  (paymentRequests: PaymentRequest[]): AppThunk =>
  async (dispatch: AppDispatch): Promise<void> => {
    dispatch(fetchRemindPaymentRequestsSuccessCount(0));
    dispatch(fetchIsRemindPaymentRequestsInFlight(true));
    const requestsLength = paymentRequests.length;
    let successCount = 0;
    if (requestsLength > 0) {
      for (let requestsIndex = 0; requestsIndex < requestsLength; requestsIndex += 1) {
        const record = paymentRequests[requestsIndex];
        const { referenceNumber, amount, id, invoiceId, invoiceIds } = record;
        const updatedInvoiceId: string | undefined = invoiceId === null ? undefined : invoiceId;
        const updatedInvoiceIds: string[] | undefined = invoiceIds === null ? undefined : invoiceIds;
        const email = record.communications.find(item => item?.communicationType === CommunicationType.Email)?.email;
        const phone = record.communications.find(item => item?.communicationType === CommunicationType.Sms)?.phoneNumber;
        const customerId = record?.owner?.customerId;
        if (referenceNumber && amount && (email || phone || customerId) && id) {
          try {
            const type = CommunicationType.Email;
            // eslint-disable-next-line no-await-in-loop
            const paymentRequest = await mutationUpsertPaymentRequest(
              gqlClient,
              referenceNumber,
              type,
              amount,
              updatedInvoiceId,
              updatedInvoiceIds,
              email as string,
              phone as string,
              id,
            );
            if (!paymentRequest || paymentRequest.code === MutationStatusCode.Error) {
              throw new Error(`[HomeActions] Payment Reminder not sent for request id: ${id}, reference: ${referenceNumber}`);
            }
            successCount += 1;
          } catch (e) {
            console.error(e);
          }
        }
      }
    }
    dispatch(fetchRemindPaymentRequestsSuccessCount(successCount));
    dispatch(fetchIsRemindPaymentRequestsInFlight(false));
  };

export const forwardPaymentRequest =
  (input: PaymentRequestForwardInput) =>
  async (dispatch: AppDispatch): Promise<void> => {
    dispatch(fetchForwardPaymentRequestInFlight(true));

    try {
      const forwardPaymentRequestStatus = await paymentRequestForward(gqlClient, input);

      if (forwardPaymentRequestStatus?.code === MutationStatusCode.Error) {
        dispatch(captureForwardPaymentRequestError({ message: forwardPaymentRequestStatus.message } as Error));
        return;
      }

      dispatch(captureForwardPaymentRequestSucccess(forwardPaymentRequestStatus));
    } catch (e) {
      dispatch(captureForwardPaymentRequestError(e as Error));
    } finally {
      dispatch(fetchForwardPaymentRequestInFlight(false));
    }
  };

const fetchPayoutReport = async (payoutReportId: string, format: FileFormat): Promise<PayoutReport | undefined> => {
  const timeInterval = parseInt(PAYOUT_TIME_INTERVAL);
  const timeLimit = parseInt(REPORT_TIME_LIMIT);

  const initialTime = Date.now();
  let queryTime = Date.now();
  let storeState = store.getState();

  while (queryTime - initialTime < timeLimit) {
    try {
      // eslint-disable-next-line no-await-in-loop
      const payoutReport = await queryPayoutReport(gqlClient, payoutReportId, format);
      // if the request was cancelled in between
      // getting the state from store
      storeState = store.getState();
      const { payoutReportCancelledInFlight } = storeState.home;
      if (payoutReportCancelledInFlight) return undefined;

      if (payoutReport && payoutReport.uri && payoutReport.status === ReportStatus.Completed) return payoutReport;

      if (payoutReport?.status === ReportStatus.Failed) return undefined;
    } catch (e) {
      // if the request was cancelled in between
      // getting the state from store
      storeState = store.getState();
      const { payoutReportCancelledInFlight } = storeState.home;
      if (payoutReportCancelledInFlight) return undefined;
      // doing nothing to handle error, so that subsequent requests can be made
    } finally {
      // eslint-disable-next-line no-loop-func
      setTimeout(() => {
        queryTime = Date.now();
      }, timeInterval);
    }
  }
  return undefined;
};

export const createPayoutReport =
  (payoutReportId: string, format: FileFormat) =>
  async (dispatch: AppDispatch): Promise<void> => {
    try {
      // clearing payout report state before fetching other
      dispatch(capturePayoutReport(undefined));
      dispatch(capturePayoutReportError(undefined));
      dispatch(capturePayoutReportInFlight(true));
      dispatch(capturePayoutReportCancelledInFlight(false));

      const payoutReport = await fetchPayoutReport(payoutReportId, format);
      // getting the state from store
      const storeState = store.getState();
      const { payoutReportCancelledInFlight } = storeState.home;
      if (payoutReport) {
        dispatch(capturePayoutReport(payoutReport));
      } else if (!payoutReportCancelledInFlight) {
        // error handling if don't get the report with completed status in time limit
        throw new Error('Unable to fetch Payout Report');
      } else {
        // clearing cancelled in flight state immediately after
        dispatch(capturePayoutReportCancelledInFlight(false));
      }
    } catch (e) {
      dispatch(capturePayoutReportError(e));
      dispatch(capturePayoutReportInFlight(false));
    }
  };
