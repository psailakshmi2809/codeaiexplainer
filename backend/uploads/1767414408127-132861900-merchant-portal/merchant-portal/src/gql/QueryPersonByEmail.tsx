import { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import gql from 'graphql-tag';
import { GetPersonByEmailQuery, Person } from '../gql-types.generated';
import { getStandardHeaders } from '../util/StandardRequestHeaders';

// eslint-disable-next-line @typescript-eslint/naming-convention
const QUERY_PERSON_BY_EMAIL = gql`
  query getPersonByEmail($email: String!) {
    person(email: $email) {
      id
      firstName
      lastName
      email
      relationship {
        role
        primaryAccountHolder
      }
      owner {
        tenantId
      }
    }
  }
`;

export const queryPersonByEmail = async (
  client: ApolloClient<NormalizedCacheObject>,
  email: string,
): Promise<Partial<Person> | undefined> => {
  const headers = await getStandardHeaders();
  const { data, errors } = await client.query<GetPersonByEmailQuery>({
    variables: { email },
    query: QUERY_PERSON_BY_EMAIL,
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

  return data?.person;
};
