import { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import gql from 'graphql-tag';
import { PaymentMethodHolderInput, ConvertPayfacPaymentMethodTokenStatus, VirtualTerminalMode } from '../gql-types.generated';
import { getStandardHeaders } from '../util/StandardRequestHeaders';

// eslint-disable-next-line @typescript-eslint/naming-convention
const MUTATION_CONVERT_PAYFAC_PAYMENT_METHOD_TOKEN = gql`
  mutation convertPayfacPaymentMethodToken($input: ConvertPayfacPaymentMethodTokenInput!) {
    convertPayfacPaymentMethodToken(input: $input) {
      code
      message
      error
      token {
        id
        clientIp
        created
        livemode
        type
        used
      }
    }
  }
`;

export const convertPayfacPaymentMethodToken = async (
  client: ApolloClient<NormalizedCacheObject>,
  type: string,
  token: string,
  holder: PaymentMethodHolderInput,
  virtualTerminalMode: VirtualTerminalMode,
  customerId?: string,
): Promise<ConvertPayfacPaymentMethodTokenStatus | undefined> => {
  const headers = await getStandardHeaders();
  const { data, errors } = await client.mutate<{ convertPayfacPaymentMethodToken: ConvertPayfacPaymentMethodTokenStatus }>({
    variables: { input: { type, token, holder, virtualTerminalMode, customerId } },
    mutation: MUTATION_CONVERT_PAYFAC_PAYMENT_METHOD_TOKEN,
    context: {
      headers,
    },
  });

  if (errors && errors.length > 0) {
    errors.forEach(error => {
      // Log error details in the console.
      console.error(error);
    });
    // Friendly error to the person.
    throw new Error('An error has occurred during the payfac token conversion.');
  }

  if (data && data.convertPayfacPaymentMethodToken) {
    return data.convertPayfacPaymentMethodToken;
  }

  return undefined;
};
