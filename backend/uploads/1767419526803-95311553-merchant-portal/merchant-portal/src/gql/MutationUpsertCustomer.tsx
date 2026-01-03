import { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import gql from 'graphql-tag';
import { MutationUpsertCustomerArgs, UpsertCustomerInput, UpsertCustomerStatus } from '../gql-types.generated';
import { getStandardHeaders } from '../util/StandardRequestHeaders';

// eslint-disable-next-line @typescript-eslint/naming-convention
const MUTATION_UPSERT_CUSTOMER = gql`
  mutation upsertCustomer($input: UpsertCustomerInput!) {
    upsertCustomer(input: $input) {
      code
      message
      error
    }
  }
`;

export const mutationUpsertCustomer = async (
  client: ApolloClient<NormalizedCacheObject>,
  options: UpsertCustomerInput,
): Promise<UpsertCustomerStatus | undefined> => {
  const { id, name, customerNumber, adminEmailIds, sendEmail, convenienceFees } = options;
  const headers = await getStandardHeaders();
  const { data, errors } = await client.mutate<{ upsertCustomer: UpsertCustomerStatus }, MutationUpsertCustomerArgs>({
    variables: { input: { id, name, customerNumber, adminEmailIds, sendEmail, convenienceFees } },
    mutation: MUTATION_UPSERT_CUSTOMER,
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
    throw new Error('An error has occurred during the customer upsert.');
  }

  if (data && data.upsertCustomer) {
    return data.upsertCustomer;
  }

  return undefined;
};
