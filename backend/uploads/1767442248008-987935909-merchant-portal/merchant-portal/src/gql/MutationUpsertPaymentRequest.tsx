import { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import gql from 'graphql-tag';
import { DateTime } from 'luxon';

import {
  CommunicationType,
  MutationUpsertPaymentRequestArgs,
  PaymentRequestStatus,
  UpsertPaymentRequestStatus,
} from '../gql-types.generated';
import { getStandardHeaders } from '../util/StandardRequestHeaders';

// eslint-disable-next-line @typescript-eslint/naming-convention
const MUTATION_UPSERT_PAYMENT_REQUEST = gql`
  mutation upsertPaymentRequest($input: UpsertPaymentRequestInput!) {
    upsertPaymentRequest(input: $input) {
      code
      message
      customerOption {
        customerId
        customerName
      }
      paymentRequestId
      error
    }
  }
`;

export const mutationUpsertPaymentRequest = async (
  client: ApolloClient<NormalizedCacheObject>,
  referenceNumber: string,
  type: CommunicationType,
  amount: number,
  invoiceRef?: string,
  invoiceRefs?: string[],
  email?: string,
  phoneNumber?: string,
  id?: string,
  status?: PaymentRequestStatus,
  statusReason?: string,
  dueDate?: DateTime,
  customerId?: string,
  additionalInfo?: string,
): Promise<UpsertPaymentRequestStatus | undefined> => {
  const headers = await getStandardHeaders();
  const { data, errors } = await client.mutate<{ upsertPaymentRequest: UpsertPaymentRequestStatus }, MutationUpsertPaymentRequestArgs>(
    {
      variables: {
        input: {
          referenceNumber,
          type,
          amount,
          invoiceRef,
          invoiceRefs,
          email,
          phoneNumber,
          sendCommunication: true,
          id,
          status,
          statusReason,
          dueDate,
          customerId,
          sendManualCommunication: true,
          additionalInfo,
        },
      },
      mutation: MUTATION_UPSERT_PAYMENT_REQUEST,
      context: {
        headers,
      },
    },
  );
  if (errors && errors.length > 0) {
    errors.forEach(error => {
      // Log error details in the console.
      console.error(error);
    });
    // Friendly error to the user.
    throw new Error('An error has occurred during the merchant upsert.');
  }
  if (data && data.upsertPaymentRequest) {
    return data.upsertPaymentRequest;
  }

  return undefined;
};
