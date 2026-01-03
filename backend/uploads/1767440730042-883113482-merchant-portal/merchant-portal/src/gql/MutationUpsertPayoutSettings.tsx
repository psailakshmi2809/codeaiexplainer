import { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import gql from 'graphql-tag';
import { UpsertPayoutSettingsMutationVariables, UpsertPayoutSettingsStatus, PayoutInterval } from '../gql-types.generated';
import { getStandardHeaders } from '../util/StandardRequestHeaders';

// eslint-disable-next-line @typescript-eslint/naming-convention
const MUTATION_UPSERT_PAYOUT_SETTINGS = gql`
  mutation upsertPayoutSettings($input: UpsertPayoutSettingsInput!) {
    upsertPayoutSettings(input: $input) {
      code
      message
    }
  }
`;

export const mutationUpsertPayoutSettings = async (
  client: ApolloClient<NormalizedCacheObject>,
  token: string,
  interval?: PayoutInterval,
): Promise<UpsertPayoutSettingsStatus | undefined> => {
  const headers = await getStandardHeaders();
  const { data, errors } = await client.mutate<
    { upsertPayoutSettings: UpsertPayoutSettingsStatus },
    UpsertPayoutSettingsMutationVariables
  >({
    variables: { input: { token, interval } },
    mutation: MUTATION_UPSERT_PAYOUT_SETTINGS,
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
    throw new Error('An error has occurred during the payout settings upsert.');
  }
  if (data && data.upsertPayoutSettings) {
    return data.upsertPayoutSettings;
  }

  return undefined;
};
