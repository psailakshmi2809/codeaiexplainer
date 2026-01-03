import { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import gql from 'graphql-tag';
import {
  MutationUpdateIntegrationSettingsArgs,
  UpdateIntegrationSettingsInput,
  UpdateIntegrationSettingsStatus,
} from '../gql-types.generated';
import { getStandardHeaders } from '../util/StandardRequestHeaders';

// eslint-disable-next-line @typescript-eslint/naming-convention
const MUTATION_UPSERT_INTEGRATION_SETTINGS = gql`
  mutation updateIntegrationSettings($input: UpdateIntegrationSettingsInput!) {
    updateIntegrationSettings(input: $input) {
      code
      message
      error
    }
  }
`;

export const mutationUpdateIntegrationSettings = async (
  client: ApolloClient<NormalizedCacheObject>,
  options: UpdateIntegrationSettingsInput,
): Promise<UpdateIntegrationSettingsStatus | undefined> => {
  const {
    mode,
    previewSettings: { enabled, email },
    processUnsentCommunications,
  } = options;
  const headers = await getStandardHeaders();
  const { data, errors } = await client.mutate<
    { updateIntegrationSettings: UpdateIntegrationSettingsStatus },
    MutationUpdateIntegrationSettingsArgs
  >({
    variables: { input: { mode, previewSettings: { enabled, email }, processUnsentCommunications } },
    mutation: MUTATION_UPSERT_INTEGRATION_SETTINGS,
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
    throw new Error('An error has occurred while updating integration settings.');
  }

  if (data && data.updateIntegrationSettings) {
    return data.updateIntegrationSettings;
  }

  return undefined;
};
