import { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import gql from 'graphql-tag';
import { getStandardHeaders } from '../util/StandardRequestHeaders';
import { DocumentTokenInput, SubmitVerificationStatus, SubmitVerificationMutationVariables } from '../gql-types.generated';

// eslint-disable-next-line @typescript-eslint/naming-convention
const MUTATION_SUBMIT_VERIFICATION = gql`
  mutation submitVerification($input: SubmitVerificationInput!) {
    submitVerification(input: $input) {
      code
      message
      error
    }
  }
`;

export const mutationSubmitVerification = async (
  client: ApolloClient<NormalizedCacheObject>,
  documentTokens: DocumentTokenInput[],
): Promise<SubmitVerificationStatus | undefined> => {
  const headers = await getStandardHeaders();
  const { data, errors } = await client.mutate<{ submitVerification: SubmitVerificationStatus }, SubmitVerificationMutationVariables>({
    variables: { input: { documentTokens } },
    mutation: MUTATION_SUBMIT_VERIFICATION,
    context: {
      headers,
    },
  });

  if (errors && errors.length > 0) {
    errors.forEach(error => {
      //Log error details in the console.
      console.error(error);
    });
    // Friendly error to the user.
    throw new Error('An error has occurred during the update dispute mutation');
  }
  if (data && data.submitVerification) {
    return data.submitVerification;
  }

  return undefined;
};
