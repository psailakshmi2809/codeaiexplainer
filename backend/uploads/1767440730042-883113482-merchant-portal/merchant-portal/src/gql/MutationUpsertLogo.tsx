import { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import gql from 'graphql-tag';

import { MutationStatusCode, UpsertTenantAccountStatus, UpsertTenantAccountMutationVariables } from '../gql-types.generated';
import { getStandardHeaders } from '../util/StandardRequestHeaders';

// eslint-disable-next-line @typescript-eslint/naming-convention
const MUTATION_UPSERT_LOGO_URL = gql`
  mutation upsertLogoUrl($input: UpsertTenantAccountInput!) {
    upsertTenantAccount(input: $input) {
      code
      message
      error
    }
  }
`;

// eslint-disable-next-line @typescript-eslint/naming-convention
const MUTATION_UPSERT_HIGHRES_LOGO_URL = gql`
  mutation upsertLogoUrl($input: UpsertTenantAccountInput!) {
    upsertTenantAccount(input: $input) {
      code
      message
      error
    }
  }
`;

export const mutationUpsertLogoUrl = async (
  client: ApolloClient<NormalizedCacheObject>,
  logoUrl: string,
): Promise<UpsertTenantAccountStatus | undefined> => {
  const headers = await getStandardHeaders();
  const { data, errors } = await client.mutate<
    { upsertTenantAccount: UpsertTenantAccountStatus },
    UpsertTenantAccountMutationVariables
  >({
    variables: { input: { logoUrl } },
    mutation: MUTATION_UPSERT_LOGO_URL,
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
    throw new Error('An error has occurred during the tenant upsert.');
  }

  if (
    data &&
    (data.upsertTenantAccount.code === MutationStatusCode.Pending || data.upsertTenantAccount.code === MutationStatusCode.Success)
  ) {
    return data.upsertTenantAccount;
  }

  return undefined;
};

export const mutationUpsertHighResLogoUrl = async (
  client: ApolloClient<NormalizedCacheObject>,
  highResLogoUrl: string,
): Promise<UpsertTenantAccountStatus | undefined> => {
  const headers = await getStandardHeaders();
  const { data, errors } = await client.mutate<
    { upsertTenantAccount: UpsertTenantAccountStatus },
    UpsertTenantAccountMutationVariables
  >({
    variables: { input: { highResLogoUrl } },
    mutation: MUTATION_UPSERT_HIGHRES_LOGO_URL,
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
    throw new Error('An error has occurred during the tenant upsert.');
  }

  if (
    data &&
    (data.upsertTenantAccount.code === MutationStatusCode.Pending || data.upsertTenantAccount.code === MutationStatusCode.Success)
  ) {
    return data.upsertTenantAccount;
  }

  return undefined;
};
