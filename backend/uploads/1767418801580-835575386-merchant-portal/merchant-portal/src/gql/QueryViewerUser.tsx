import { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import gql from 'graphql-tag';
import { Maybe } from 'graphql/jsutils/Maybe';
import { GetViewerUserQuery, Person } from '../gql-types.generated';
import { getStandardHeaders } from '../util/StandardRequestHeaders';

// eslint-disable-next-line @typescript-eslint/naming-convention
const QUERY_VIEWER_USER = gql`
  query getViewerUser {
    viewer {
      currentUser {
        id
        firstName
        lastName
        email
        relationship {
          role
        }
      }
    }
  }
`;

export const queryViewerUser = async (
  client: ApolloClient<NormalizedCacheObject>,
): Promise<Maybe<Partial<Person> | undefined> | undefined> => {
  const headers = await getStandardHeaders();
  const { data, errors } = await client.query<GetViewerUserQuery>({
    query: QUERY_VIEWER_USER,
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

  return data?.viewer.currentUser;
};
