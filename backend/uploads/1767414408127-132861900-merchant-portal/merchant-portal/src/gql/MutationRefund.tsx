import { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import gql from 'graphql-tag';

import { CreateRefundStatus, CreateRefundMutationVariables } from '../gql-types.generated';

import { getCreateRefundOrPaymentHeaders } from '../util/StandardRequestHeaders';

// eslint-disable-next-line @typescript-eslint/naming-convention
const MUTATION_REFUND = gql`
  mutation createRefund($input: CreateRefundInput!) {
    createRefund(input: $input) {
      code
      error
      message
    }
  }
`;

export const mutationRefund = async (
  client: ApolloClient<NormalizedCacheObject>,
  refundIdempotencyKey: string,
  paymentId: string,
  refundReason: string,
  amount: number | null,
  paymentRequestId?: string,
): Promise<CreateRefundStatus | undefined> => {
  const headers = await getCreateRefundOrPaymentHeaders(refundIdempotencyKey);
  const { data, errors } = await client.mutate<{ createRefund: CreateRefundStatus }, CreateRefundMutationVariables>({
    variables: {
      input: {
        paymentId,
        refundReason,
        amount,
        paymentRequestId,
      },
    },
    mutation: MUTATION_REFUND,
    context: {
      headers,
    },
  });
  if (errors && errors.length > 0) {
    errors.forEach(error => {
      // Log error details in the console.
      console.error(error);
    });
    // Friendly error to the user.
    throw new Error('An error has occurred during the refund mutation.');
  }
  if (data && data.createRefund) {
    return data.createRefund;
  }
  return undefined;
};
