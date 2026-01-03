import { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import gql from 'graphql-tag';
import { Maybe } from 'graphql/jsutils/Maybe';
import { AccountRequirements, GetAdditionalVerifcationsQuery } from '../gql-types.generated';
import { getStandardHeaders } from '../util/StandardRequestHeaders';

// eslint-disable-next-line @typescript-eslint/naming-convention
const QUERY_ADDITIONAL_VERIFICATIONS = gql`
  query getAdditionalVerifcations {
    account {
      requirements {
        currentDeadline
        currentlyDue
        disabledReason
        errors
        eventuallyDue
        pastDue
        pendingVerification
      }
    }
  }
`;

export const queryAccountRequirements = async (
  client: ApolloClient<NormalizedCacheObject>,
): Promise<Maybe<AccountRequirements | undefined> | undefined> => {
  const headers = await getStandardHeaders();
  const { data, errors } = await client.query<GetAdditionalVerifcationsQuery>({
    query: QUERY_ADDITIONAL_VERIFICATIONS,
    context: {
      headers,
    },
  });
  if (data) {
    console.log('using data: ', data);
  }
  if (errors && errors.length > 0) {
    errors.forEach(error => {
      // Log error details in the console.
      console.error(error);
    });
    // Friendly error to the user.
    throw new Error('An error has occurred during the query.');
  }

  return data?.account?.requirements;
};
