import { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import gql from 'graphql-tag';
import { UpsertPersonMutationVariables, UpsertPersonStatus, AppRole } from '../gql-types.generated';
import { getStandardHeaders } from '../util/StandardRequestHeaders';

// eslint-disable-next-line @typescript-eslint/naming-convention
const MUTATION_UPSERT_PERSON = gql`
  mutation upsertPerson($input: UpsertPersonInput!) {
    upsertPerson(input: $input) {
      code
      message
      error
    }
  }
`;

export const mutationUpsertPerson = async (
  client: ApolloClient<NormalizedCacheObject>,
  options: {
    email: string;
    deleted?: boolean;
    id?: string;
    firstName?: string;
    lastName?: string;
    role?: AppRole;
  },
): Promise<UpsertPersonStatus | undefined> => {
  console.log('personOptions', options);
  const { email, deleted, id, firstName, lastName, role } = options;
  const headers = await getStandardHeaders();
  const { data, errors } = await client.mutate<{ upsertPerson: UpsertPersonStatus }, UpsertPersonMutationVariables>({
    variables: { input: { id, firstName, lastName, email, role, deleted } },
    mutation: MUTATION_UPSERT_PERSON,
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
    throw new Error('An error has occurred during the person upsert.');
  }

  if (data && data.upsertPerson) {
    return data.upsertPerson;
  }

  return undefined;
};
