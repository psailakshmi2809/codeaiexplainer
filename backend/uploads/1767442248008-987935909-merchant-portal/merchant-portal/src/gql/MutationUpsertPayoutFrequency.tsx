import { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import gql from 'graphql-tag';
import { UpsertPayoutFrequencyMutationVariables, UpsertPayoutFrequencyStatus, PayoutInterval } from '../gql-types.generated';
import { getStandardHeaders } from '../util/StandardRequestHeaders';

// eslint-disable-next-line @typescript-eslint/naming-convention
const MUTATION_UPSERT_PAYOUT_FREQUENCY = gql`
  mutation upsertPayoutFrequency($input: UpsertPayoutFrequencyInput!) {
    upsertPayoutFrequency(input: $input) {
      code
      message
    }
  }
`;

export const mutationUpsertPayoutFrequency = async (
  client: ApolloClient<NormalizedCacheObject>,
  interval: PayoutInterval,
): Promise<UpsertPayoutFrequencyStatus | undefined> => {
  const headers = await getStandardHeaders();
  const { data, errors } = await client.mutate<
    { upsertPayoutFrequency: UpsertPayoutFrequencyStatus },
    UpsertPayoutFrequencyMutationVariables
  >({
    variables: { input: { interval } },
    mutation: MUTATION_UPSERT_PAYOUT_FREQUENCY,
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
    throw new Error('An error has occurred during the payout frequency update.');
  }
  if (data && data.upsertPayoutFrequency) {
    return data.upsertPayoutFrequency;
  }

  return undefined;
};
