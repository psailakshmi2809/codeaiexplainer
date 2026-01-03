import { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import gql from 'graphql-tag';
import { Maybe } from 'graphql/jsutils/Maybe';
import { PayoutSettings, PayoutSettingsQuery } from '../gql-types.generated';
import { getStandardHeaders } from '../util/StandardRequestHeaders';

// eslint-disable-next-line @typescript-eslint/naming-convention
const QUERY_PAYOUT_SETTINGS = gql`
  query payoutSettings {
    account {
      settings {
        accountPayouts {
          accountType
          accountLastFour
          currency
          schedule {
            interval
          }
          statementDescription
          status
        }
      }
    }
  }
`;

export const queryPayoutSettings = async (client: ApolloClient<NormalizedCacheObject>): Promise<Maybe<PayoutSettings> | undefined> => {
  const headers = await getStandardHeaders();
  const { data, errors } = await client.query<PayoutSettingsQuery>({
    query: QUERY_PAYOUT_SETTINGS,
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
  return data?.account.settings?.accountPayouts;
};
