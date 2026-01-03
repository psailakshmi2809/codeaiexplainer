import { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import gql from 'graphql-tag';
import { PaymentMethodConnection } from '../gql-types.generated';
import { getStandardHeaders } from '../util/StandardRequestHeaders';

// eslint-disable-next-line @typescript-eslint/naming-convention
const QUERY_PAYMENT_METHODS_BY_TOKEN = gql`
  query paymentMethodsByToken($id: String!) {
    paymentMethods(id: $id) {
      nodes {
        id
        createdAt
        createdBy
        creditCard {
          cardHolder {
            email
            holderName
            email
            phone {
              countryCode
              number
            }
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
        paymentBank {
          accountHolder {
            holderName
            email
            address {
              line1
              line2
              postalCode
              country
            }
            phone {
              countryCode
              number
            }
          }
          lastFour
          accountType
        }
        status
        type
        isLongLived
        updatedAt
        updatedBy
      }
      totalCount
    }
  }
`;

export const queryPaymentMethodByToken = async (
  client: ApolloClient<NormalizedCacheObject>,
  token: string,
): Promise<PaymentMethodConnection | undefined> => {
  const headers = await getStandardHeaders();
  const { data, errors } = await client.query<{ paymentMethods: PaymentMethodConnection }>({
    variables: { id: token },
    query: QUERY_PAYMENT_METHODS_BY_TOKEN,
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
    throw new Error('An error has occurred during the paymentMethods query.');
  }

  if (data && data.paymentMethods) {
    return data.paymentMethods;
  }

  return undefined;
};
