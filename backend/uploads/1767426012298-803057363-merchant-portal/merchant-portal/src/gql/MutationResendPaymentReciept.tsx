import { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import gql from 'graphql-tag';

import { ResendPaymentReceiptStatus, MutationResendPaymentReceiptArgs } from '../gql-types.generated';
import { getStandardHeaders } from '../util/StandardRequestHeaders';

// eslint-disable-next-line @typescript-eslint/naming-convention
const MUTATION_RESEND_PAYMENT_RECEIPT = gql`
  mutation resendPaymentReceipt($input: ResendPaymentReceiptInput!) {
    resendPaymentReceipt(input: $input) {
      code
      message
      error
      errorReason {
        code
        message
        details {
          code
          message
        }
      }
    }
  }
`;

export const mutationResendPaymentReceipt = async (
  client: ApolloClient<NormalizedCacheObject>,
  paymentId: string,
): Promise<ResendPaymentReceiptStatus | undefined> => {
  const headers = await getStandardHeaders();
  const { data, errors } = await client.mutate<{ resendPaymentReceipt: ResendPaymentReceiptStatus }, MutationResendPaymentReceiptArgs>(
    {
      variables: { input: { paymentId } },
      mutation: MUTATION_RESEND_PAYMENT_RECEIPT,
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
    throw new Error('An error has occurred during the resend payment receipt.');
  }

  if (data && data.resendPaymentReceipt) {
    return data.resendPaymentReceipt;
  }

  return undefined;
};
