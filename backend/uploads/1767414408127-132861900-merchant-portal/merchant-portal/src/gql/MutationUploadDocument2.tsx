import { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import gql from 'graphql-tag';
import { getStandardHeaders } from '../util/StandardRequestHeaders';
import { MediaStatus2, MutationUpload2Args } from '../gql-types.generated';

// eslint-disable-next-line @typescript-eslint/naming-convention
const MUTATION_UPLOAD_DOCUMENT2 = gql`
  mutation uploadDocument2($input: UploadInput!) {
    upload2(input: $input) {
      uniqueId
    }
  }
`;

export const mutationUploadDocument2 = async (
  client: ApolloClient<NormalizedCacheObject>,
  file: File,
): Promise<Record<string, string> | undefined> => {
  const headers = await getStandardHeaders();
  const { data, errors } = await client.mutate<{ upload2: MediaStatus2 }, MutationUpload2Args>({
    variables: { input: { file } },
    mutation: MUTATION_UPLOAD_DOCUMENT2,
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
    throw new Error('An error has occurred during the document upload.');
  }
  if (data && data.upload2.uniqueId) {
    return {
      id: data.upload2.uniqueId,
    };
  }
  return undefined;
};
