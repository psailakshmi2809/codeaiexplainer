import { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import gql from 'graphql-tag';
import { MutationStatusCode, UpsertTenantAccountStatus, UpsertTenantAccountMutationVariables } from '../gql-types.generated';
import { getStandardHeaders } from '../util/StandardRequestHeaders';

// eslint-disable-next-line @typescript-eslint/naming-convention
const MUTATION_UPSERT_REFUND_POLICY = gql`
  mutation upsertRefundPolicy($input: UpsertTenantAccountInput!) {
    upsertTenantAccount(input: $input) {
      code
      message
      error
    }
  }
`;

export const mutationUpsertRefundPolicy = async (
  client: ApolloClient<NormalizedCacheObject>,
  refundPolicy: string,
): Promise<UpsertTenantAccountStatus | undefined> => {
  const headers = await getStandardHeaders();
  const { data, errors } = await client.mutate<
    { upsertTenantAccount: UpsertTenantAccountStatus },
    UpsertTenantAccountMutationVariables
  >({
    variables: { input: { refundPolicy } },
    mutation: MUTATION_UPSERT_REFUND_POLICY,
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
