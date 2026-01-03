import { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import gql from 'graphql-tag';

import { SendTestEmailStatus } from '../gql-types.generated';
import { getStandardHeaders } from '../util/StandardRequestHeaders';

// eslint-disable-next-line @typescript-eslint/naming-convention
const MUTATION_SEND_TEST_EMAIL = gql`
  mutation sendTestEmail($input: SendTestEmailInput!) {
    sendTestEmail(input: $input) {
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

export const mutationSendTestEmail = async (
  client: ApolloClient<NormalizedCacheObject>,
  email: string,
): Promise<SendTestEmailStatus | undefined> => {
  const headers = await getStandardHeaders();
  const { data, errors } = await client.mutate<{ sendTestEmail: SendTestEmailStatus }>({
    variables: { input: { email } },
    mutation: MUTATION_SEND_TEST_EMAIL,
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
    throw new Error('An error has occurred during the sending test email.');
  }

  if (data && data.sendTestEmail) {
    return data.sendTestEmail;
  }

  return undefined;
};
