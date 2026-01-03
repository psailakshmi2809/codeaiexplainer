import { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import gql from 'graphql-tag';
import { CreatePaymentStatus, CurrencyType, PaymentRequestAllocationInput, RiskMetadataPaymentInput } from '../gql-types.generated';
import { getCreateRefundOrPaymentHeaders } from '../util/StandardRequestHeaders';

// eslint-disable-next-line @typescript-eslint/naming-convention
const MUTATION_CREATE_PAYMENT_FOR_REQUESTS = gql`
  mutation createPayment($input: CreatePaymentInput!) {
    createPayment(input: $input) {
      code
      message
      error
      payment {
        amount
        amountDisputed
        amountRefunded
        attemptTimestamp
        cancelReason
        completedTimestamp
        currency
        failureReason
        feeAmount
        id
        initiatedBy
        pendingReason
        pendingReasonCode
        status
      }
    }
  }
`;

export const createPaymentForRequests = async (
  client: ApolloClient<NormalizedCacheObject>,
  paymentMethodId: string,
  amount: number,
  paymentRequestAllocation: PaymentRequestAllocationInput[],
  currency: CurrencyType,
  immediateCapture: boolean,
  riskMetadata: RiskMetadataPaymentInput,
  failOnReview: boolean,
  idempotencyKey: string,
  orderNumber: string,
  customerPONumber: string,
  invoiceNumber: string,
  description: string,
  customerId: string,
): Promise<CreatePaymentStatus | null> => {
  const headers = await getCreateRefundOrPaymentHeaders(idempotencyKey);
  const { data, errors } = await client.mutate<{ createPayment: CreatePaymentStatus }>({
    variables: {
      input: {
        paymentMethodId,
        amount,
        currency,
        immediateCapture,
        riskMetadata,
        failOnReview,
        orderNumber,
        customerPONumber,
        invoiceNumber,
        description,
        paymentRequestAllocation,
        customerId,
      },
    },
    mutation: MUTATION_CREATE_PAYMENT_FOR_REQUESTS,
    context: {
      headers,
    },
  });

  if (errors && errors.length > 0) {
    errors.forEach(error => {
      console.error(error);
    });
    throw new Error('An error has occurred during payment creation.');
  }

  if (data && data.createPayment) {
    return data.createPayment;
  }

  return null;
};
