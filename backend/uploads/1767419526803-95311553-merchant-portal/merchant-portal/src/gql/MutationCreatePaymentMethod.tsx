import { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import gql from 'graphql-tag';
import { CreatePaymentMethodStatus } from '../gql-types.generated';
import { getStandardHeaders } from '../util/StandardRequestHeaders';

// eslint-disable-next-line @typescript-eslint/naming-convention
const MUTATION_CREATE_PAYMENT_METHOD = gql`
  mutation createPaymentMethod($input: CreatePaymentMethodInput!) {
    createPaymentMethod(input: $input) {
      code
      message
      error
      paymentMethod {
        id
        creditCard {
          cardHolder {
            holderName
            email
            address {
              line1
              line2
              postalCode
              country
            }
          }
          cardBrand
          lastFour
          expirationMonth
          expirationYear
        }
        isLongLived
        createdAt
        createdBy
      }
    }
  }
`;

export const createPaymentMethod = async (
  client: ApolloClient<NormalizedCacheObject>,
  token: string,
  attachToResourceId: string | undefined,
): Promise<CreatePaymentMethodStatus | undefined> => {
  const headers = await getStandardHeaders();
  const { data, errors } = await client.mutate<{ createPaymentMethod: CreatePaymentMethodStatus }>({
    variables: { input: { token, attachToResourceId } },
    mutation: MUTATION_CREATE_PAYMENT_METHOD,
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
    throw new Error('An error has occurred during payment method creation.');
  }

  if (data && data.createPaymentMethod) {
    return data.createPaymentMethod;
  }

  return undefined;
};
