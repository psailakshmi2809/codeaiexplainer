import { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import gql from 'graphql-tag';
import { getStandardHeaders } from '../util/StandardRequestHeaders';
import { MediaStatus, MutationUploadArgs } from '../gql-types.generated';

// eslint-disable-next-line @typescript-eslint/naming-convention
const MUTATION_UPLOAD_DOCUMENT = gql`
  mutation uploadDocument($input: UploadInput!) {
    upload(input: $input) {
      uniqueId
    }
  }
`;

export const mutationUploadDocument = async (
  client: ApolloClient<NormalizedCacheObject>,
  file: File,
): Promise<Record<string, string> | undefined> => {
  const headers = await getStandardHeaders();
  const { data, errors } = await client.mutate<{ upload: MediaStatus }, MutationUploadArgs>({
    variables: { input: { file } },
    mutation: MUTATION_UPLOAD_DOCUMENT,
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
  if (data && data.upload.uniqueId) {
    return {
      id: data.upload.uniqueId,
    };
  }
  return undefined;
};
