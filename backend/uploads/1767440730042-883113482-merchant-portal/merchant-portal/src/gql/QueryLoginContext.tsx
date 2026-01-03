import { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import gql from 'graphql-tag';
import { LoginContextQuery, LoginContext } from '../gql-types.generated';
import { getStandardHeaders } from '../util/StandardRequestHeaders';

// eslint-disable-next-line @typescript-eslint/naming-convention
const QUERY_LOGIN_CONTEXT = gql`
  query loginContext {
    loginContext {
      firstName
      lastName
      email
      accounts {
        id
        defaultCurrency
        owner {
          tenantId
        }
        balances {
          currentBalance {
            amount
            currency
          }
        }
        businessProfile {
          name
          logoUrl
        }
        company {
          name
        }
        merchantSummary {
          paymentsDueToday
        }
        settings {
          supportedCapabilities {
            accountBalance
          }
        }
      }
    }
  }
`;

export const queryLoginContext = async (client: ApolloClient<NormalizedCacheObject>): Promise<Partial<LoginContext> | undefined> => {
  const headers = await getStandardHeaders(true);
  const { data, errors } = await client.query<LoginContextQuery>({
    query: QUERY_LOGIN_CONTEXT,
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
    throw new Error('An error has occurred during the query.');
  }
  return data?.loginContext as LoginContext;
};
