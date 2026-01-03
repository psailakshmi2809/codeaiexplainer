import { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import gql from 'graphql-tag';

import { StatementAccessUrlRequestStatus, MutationGenerateStatementAccessUrlArgs } from '../gql-types.generated';

import { getStandardHeaders } from '../util/StandardRequestHeaders';

// eslint-disable-next-line @typescript-eslint/naming-convention
const MUTATION_GENERATE_STATEMENT_ACCESS_URL = gql`
  mutation generateStatementAccessUrl($input: FileName!) {
    generateStatementAccessUrl(input: $input) {
      code
      error
      message
      statementUrl
    }
  }
`;

export const mutationGenerateStatementAccessUrl = async (
  client: ApolloClient<NormalizedCacheObject>,
  name: string,
): Promise<StatementAccessUrlRequestStatus | undefined> => {
  const headers = await getStandardHeaders();
  const { data, errors } = await client.mutate<
    { generateStatementAccessUrl: StatementAccessUrlRequestStatus },
    MutationGenerateStatementAccessUrlArgs
  >({
    variables: {
      input: {
        name,
      },
    },
    mutation: MUTATION_GENERATE_STATEMENT_ACCESS_URL,
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
    throw new Error('An error has occurred during the generating statement access url mutation.');
  }
  if (data && data.generateStatementAccessUrl) {
    return data.generateStatementAccessUrl;
  }
  return undefined;
};
