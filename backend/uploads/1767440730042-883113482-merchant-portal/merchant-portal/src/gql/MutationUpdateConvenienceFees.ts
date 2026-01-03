import { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import gql from 'graphql-tag';
import { MutationUpdateConvenienceFeesArgs, UpdateConvenienceFeesInput, UpdateConvenienceFeesStatus } from '../gql-types.generated';
import { getStandardHeaders } from '../util/StandardRequestHeaders';

// eslint-disable-next-line @typescript-eslint/naming-convention
const MUTATION_UPDATE_INTEGRATION_SETTINGS = gql`
  mutation updateConvenienceFees($input: UpdateConvenienceFeesInput!) {
    updateConvenienceFees(input: $input) {
      code
      message
      error
    }
  }
`;

export const mutationUpdateConvenienceFees = async (
  client: ApolloClient<NormalizedCacheObject>,
  options: UpdateConvenienceFeesInput,
): Promise<UpdateConvenienceFeesStatus | undefined> => {
  const { creditCardRateBps, debitCardRateBps } = options;
  const headers = await getStandardHeaders();
  const { data, errors } = await client.mutate<
    { updateConvenienceFees: UpdateConvenienceFeesStatus },
    MutationUpdateConvenienceFeesArgs
  >({
    variables: { input: { creditCardRateBps, debitCardRateBps } },
    mutation: MUTATION_UPDATE_INTEGRATION_SETTINGS,
    context: {
      headers,
    },
  });
  if (errors && errors.length > 0) {
    errors.forEach(error => {
      throw new Error(error.extensions?.exception.message);
    });
  }

  if (data && data.updateConvenienceFees) {
    return data.updateConvenienceFees;
  }

  return undefined;
};
