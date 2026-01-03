import { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import gql from 'graphql-tag';
import { PaymentRequestForwardInput, PaymentRequestForwardStatus } from '../gql-types.generated';
import { getStandardHeaders } from '../util/StandardRequestHeaders';

// eslint-disable-next-line @typescript-eslint/naming-convention
const MUTATION_FORWARD_PAYMENT_REQUEST = gql`
  mutation paymentRequestForward($input: PaymentRequestForwardInput!) {
    paymentRequestForward(input: $input) {
      code
      error
      message
    }
  }
`;

export const paymentRequestForward = async (
  client: ApolloClient<NormalizedCacheObject>,
  input: PaymentRequestForwardInput,
): Promise<PaymentRequestForwardStatus | null> => {
  const headers = await getStandardHeaders();
  const { data, errors } = await client.mutate<{ paymentRequestForward: PaymentRequestForwardStatus }>({
    variables: {
      input,
    },
    mutation: MUTATION_FORWARD_PAYMENT_REQUEST,
    context: {
      headers,
    },
  });

  if (errors && errors.length > 0) {
    errors.forEach(error => {
      console.error(error);
    });
    throw new Error('An error has occurred during forwarding payment request.');
  }

  if (data && data.paymentRequestForward) {
    return data.paymentRequestForward;
  }

  return null;
};
