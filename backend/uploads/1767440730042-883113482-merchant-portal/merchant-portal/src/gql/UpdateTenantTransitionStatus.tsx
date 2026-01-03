import { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import gql from 'graphql-tag';
import { TransitionStatus, UpdatePayoutSettingsStatus } from '../gql-types.generated';
import { getStandardHeaders } from '../util/StandardRequestHeaders';

// eslint-disable-next-line @typescript-eslint/naming-convention
const MUTATION_UPDATE_TENANT_TRANSITION_STATUS = gql`
  mutation updateTenantTransitionStatus($input: UpdateTenantAccountTransitionStatusInput!) {
    updateTenantTransitionStatus(input: $input) {
      code
      message
      error
    }
  }
`;

export const updateTenantTransitionStatus = async (
  client: ApolloClient<NormalizedCacheObject>,
  transitionStatus: TransitionStatus,
): Promise<UpdatePayoutSettingsStatus | undefined> => {
  const headers = await getStandardHeaders();
  const { data, errors } = await client.mutate<{ updateTenantTransitionStatus: UpdatePayoutSettingsStatus }>({
    variables: { input: { transitionStatus } },
    mutation: MUTATION_UPDATE_TENANT_TRANSITION_STATUS,
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
    throw new Error('An error has occurred.');
  }

  if (data && data.updateTenantTransitionStatus) {
    return data.updateTenantTransitionStatus;
  }

  return undefined;
};
