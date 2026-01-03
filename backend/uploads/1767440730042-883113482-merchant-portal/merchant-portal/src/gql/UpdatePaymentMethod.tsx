import { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import gql from 'graphql-tag';
import { UpdatePaymentMethodStatus } from '../gql-types.generated';
import { getStandardHeaders } from '../util/StandardRequestHeaders';

// eslint-disable-next-line @typescript-eslint/naming-convention
const MUTATION_UPDATE_PAYMENT_METHOD = gql`
  mutation updatePaymentMethod($input: UpdatePaymentMethodInput!) {
    updatePaymentMethod(input: $input) {
      code
      message
      error
      paymentMethod {
        id
        creditCard {
          cardBrand
          cardHolder {
            email
            phone {
              number
              countryCode
            }
          }
          __typename
        }
        createdAt
        createdBy
        paymentBank {
          accountType
        }
      }
    }
  }
`;

export const updatePaymentMethod = async (
  client: ApolloClient<NormalizedCacheObject>,
  paymentMethodId: string,
  isDefault: boolean,
  resourceId: string,
  tenantId: string,
  shareWithMerchant?: boolean,
  email?: string,
  phone?: { number: string; countryCode: string },
): Promise<UpdatePaymentMethodStatus | undefined> => {
  const headers = await getStandardHeaders();
  const { data, errors } = await client.mutate<{ updatePaymentMethod: UpdatePaymentMethodStatus }>({
    variables: { input: { paymentMethodId, isDefault, resourceId, shareWithMerchant, email, phone } },
    mutation: MUTATION_UPDATE_PAYMENT_METHOD,
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
    throw new Error('An error has occurred.');
  }

  if (data && data.updatePaymentMethod) {
    return data.updatePaymentMethod;
  }

  return undefined;
};
