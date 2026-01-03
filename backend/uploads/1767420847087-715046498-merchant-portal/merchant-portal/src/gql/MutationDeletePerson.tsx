import { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import gql from 'graphql-tag';

import { DeletePersonMutationVariables, DeletePersonStatus } from '../gql-types.generated';
import { getStandardHeaders } from '../util/StandardRequestHeaders';

// eslint-disable-next-line @typescript-eslint/naming-convention
const MUTATION_DELETE_PERSON = gql`
  mutation deletePerson($input: DeletePersonInput!) {
    deletePerson(input: $input) {
      code
      message
      error
    }
  }
`;

export const mutationDeletePerson = async (
  client: ApolloClient<NormalizedCacheObject>,
  id: string,
): Promise<DeletePersonStatus | undefined> => {
  const headers = await getStandardHeaders();
  const { data, errors } = await client.mutate<{ deletePerson: DeletePersonStatus }, DeletePersonMutationVariables>({
    variables: { input: { id } },
    mutation: MUTATION_DELETE_PERSON,
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
    throw new Error('An error has occurred during the person delete.');
  }
  if (data && data.deletePerson) {
    return data.deletePerson;
  }

  return undefined;
};
