import { gqlClient } from '../../components/AppProvider';
import { CommunicationType, MutationStatusCode } from '../../gql-types.generated';
import { mutationUpsertPaymentRequest } from '../../gql/MutationUpsertPaymentRequest';
import { AppDispatch, AppThunk } from '../../store';
import { DateTime } from 'luxon';
import { KeyedInvalidOperationServiceError } from '../../custom-types/KeyedInvalidOperationServiceError';
import { GraphQLError } from 'graphql';
import { mutationUploadDocument2 } from '../../gql/MutationUploadDocument2';
import { v4 as uuid4 } from 'uuid';
import {
  clearSendPaymentRequestGQLError,
  clearSendPaymentRequestError,
  captureSendPaymentRequestError,
  captureSendPaymentRequestGQLError,
  captureSendPaymentRequestInFlight,
  capturePaymentRequestStatus,
  captureInvoiceUpload,
  fetchInvoiceUploadIndex,
  fetchInvoiceUploadTotal,
  fetchIsLoadingInvoices,
  InvoiceFileUpload,
} from '../payment-request/PaymentRequestSlice';
import { mutationUploadDocument } from '../../gql/MutationUploadDocument';
import { uploadDocumentFailure, uploadDocumentSuccess } from '../home/HomeSlice';

export const upsertPaymentRequest =
  (
    referenceId: string,
    amount: number,
    invoiceRef: string | undefined,
    invoiceRefs: string[],
    email?: string,
    phoneNumber?: string,
    dueDate?: DateTime,
    customerId?: string,
    additionalInfo?: string,
  ): AppThunk =>
  async (dispatch: AppDispatch): Promise<void> => {
    try {
      dispatch(clearSendPaymentRequestGQLError());
      dispatch(clearSendPaymentRequestError());
      dispatch(captureSendPaymentRequestInFlight(true));
      // The email must always be provided, if the phone number is provided to, we need to send SMS and Email
      const type = phoneNumber || customerId ? CommunicationType.EmailAndSms : CommunicationType.Email;
      const paymentRequest = await mutationUpsertPaymentRequest(
        gqlClient,
        referenceId,
        type,
        amount,
        invoiceRef,
        invoiceRefs,
        email,
        phoneNumber,
        undefined,
        undefined,
        undefined,
        dueDate,
        customerId,
        additionalInfo,
      );
      if (paymentRequest) {
        dispatch(capturePaymentRequestStatus(paymentRequest));
        if (paymentRequest.code === MutationStatusCode.Error) {
          dispatch(captureSendPaymentRequestError(paymentRequest.message || ''));
        } else {
          dispatch(clearSendPaymentRequestError());
          dispatch(clearSendPaymentRequestGQLError());
        }
      }
      if (!paymentRequest) throw new Error('[HomeActions] Payment Request not sent');
      dispatch(captureSendPaymentRequestInFlight(false));
    } catch (e) {
      console.error(e);
      if (e?.graphQLErrors && e.graphQLErrors[0]) {
        const error = e.graphQLErrors[0] as GraphQLError;
        if (error.extensions && error.extensions.exception) {
          dispatch(captureSendPaymentRequestGQLError(error.extensions.exception as KeyedInvalidOperationServiceError));
        }
      }
      dispatch(captureSendPaymentRequestInFlight(false));
      dispatch(captureSendPaymentRequestError(e.message));
    }
  };
export const uploadDocument =
  (file: File): AppThunk =>
  async (dispatch: AppDispatch): Promise<void> => {
    try {
      const uploadResponse = await mutationUploadDocument(gqlClient, file);
      if (!uploadResponse) {
        dispatch(uploadDocumentFailure());
        throw new Error('[HomeActions] Upload Document request not sent');
      }
      dispatch(uploadDocumentSuccess(uploadResponse.id));
    } catch (e) {
      dispatch(uploadDocumentFailure());
      console.error(e);
    }
  };

export const uploadDocuments =
  (files: File[], index: number): AppThunk =>
  async (dispatch: AppDispatch): Promise<void> => {
    const totalFilesCount = files.length;
    if (index >= totalFilesCount) {
      dispatch(fetchIsLoadingInvoices(false));
      return;
    }
    dispatch(fetchIsLoadingInvoices(true));
    dispatch(fetchInvoiceUploadTotal(totalFilesCount));
    dispatch(fetchInvoiceUploadIndex(index));
    try {
      // Iterate through the files, and keep state of what is being uploaded and its progress through the array.
      // Continuously dispatch to update the new collection of uploaded files.
      const file = files[index];
      if (file) {
        const uploadResponse = await mutationUploadDocument2(gqlClient, file);
        if (!uploadResponse) {
          // Store failed state of document upload in collection.
          dispatch(
            captureInvoiceUpload({
              id: uuid4(),
              file,
              success: false,
            } as InvoiceFileUpload),
          );
        } else {
          dispatch(
            captureInvoiceUpload({
              id: uploadResponse.id,
              file,
              success: true,
            } as InvoiceFileUpload),
          );
        }
      }
      dispatch(uploadDocuments(files, index + 1));
    } catch (e) {
      dispatch(uploadDocumentFailure());
      console.error(e);
    }
  };
