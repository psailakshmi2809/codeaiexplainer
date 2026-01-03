import { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import gql from 'graphql-tag';
import { PaymentMethodConnection, PaymentMethodStatus, PaymentMethodType } from '../gql-types.generated';
import { getStandardHeaders } from '../util/StandardRequestHeaders';

// eslint-disable-next-line @typescript-eslint/naming-convention
const QUERY_PAYMENT_METHODS = gql`
  query paymentMethods(
    $queryString: String
    $customerId: String
    $resourceId: String!
    $paymentMethodType: PaymentMethodType
    $status: [PaymentMethodStatus!]
  ) {
    paymentMethods(
      queryString: $queryString
      customerId: $customerId
      resourceId: $resourceId
      paymentMethodType: $paymentMethodType
      status: $status
    ) {
      nodes {
        id
        createdAt
        createdBy
        creditCard {
          cardHolder {
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

export const queryPaymentMethods = async (
  client: ApolloClient<NormalizedCacheObject>,
  paymentMethodType: PaymentMethodType | undefined,
  resourceId: string,
  status: PaymentMethodStatus[],
  queryString?: string,
  customerId?: string,
): Promise<PaymentMethodConnection | undefined> => {
  const headers = await getStandardHeaders();
  if (!queryString && !customerId) {
    throw new Error('An email or name for a query string, or a customer id is required for querying payment methods.');
  }
  const { data, errors } = await client.query<{ paymentMethods: PaymentMethodConnection }>({
    variables: { queryString, customerId, resourceId, paymentMethodType, status },
    query: QUERY_PAYMENT_METHODS,
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
    throw new Error('An error has occurred during the paymentMethods by email query.');
  }

  if (data && data.paymentMethods) {
    return data.paymentMethods;
  }

  return undefined;
};
