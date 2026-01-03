import { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import gql from 'graphql-tag';
import { PersonsListQuery } from '../gql-types.generated';
import { getStandardHeaders } from '../util/StandardRequestHeaders';

// eslint-disable-next-line @typescript-eslint/naming-convention
const QUERY_PERSON_LIST = gql`
  query personsList {
    persons {
      firstName
      lastName
      email
      relationship {
        owner
        primaryAccountHolder
        role
        involvement
      }
      verification {
        status
      }
      updatedAt
      id
      createdAt
    }
  }
`;

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const queryPersonList = async (client: ApolloClient<NormalizedCacheObject>) => {
  const headers = await getStandardHeaders();
  const { data, errors } = await client.query<PersonsListQuery>({
    query: QUERY_PERSON_LIST,
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

  return data?.persons;
};
