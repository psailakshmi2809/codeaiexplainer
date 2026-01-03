import { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import gql from 'graphql-tag';
import {
  MutationUpdateTenantAccountEmailSettingsArgs,
  UpdateTenantAccountEmailSettingsInput,
  UpdateTenantAccountEmailSettingsStatus,
} from '../gql-types.generated';
import { getStandardHeaders } from '../util/StandardRequestHeaders';

// eslint-disable-next-line @typescript-eslint/naming-convention
const MUTATION_UPDATE_INTEGRATION_SETTINGS = gql`
  mutation updateTenantAccountEmailSettings($input: UpdateTenantAccountEmailSettingsInput!) {
    updateTenantAccountEmailSettings(input: $input) {
      code
      message
      error
    }
  }
`;

export const mutationUpdateTenantAccountEmailSettings = async (
  client: ApolloClient<NormalizedCacheObject>,
  options: UpdateTenantAccountEmailSettingsInput,
): Promise<UpdateTenantAccountEmailSettingsStatus | undefined> => {
  const { enabled, profile, paymentRequestDefaultText } = options;
  const headers = await getStandardHeaders();
  const { data, errors } = await client.mutate<
    { status: UpdateTenantAccountEmailSettingsStatus },
    MutationUpdateTenantAccountEmailSettingsArgs
  >({
    variables: { input: { enabled, profile, paymentRequestDefaultText } },
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

  if (data && data.status) {
    return data.status;
  }

  return undefined;
};
