import { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import gql from 'graphql-tag';
import { getStandardHeaders } from '../util/StandardRequestHeaders';
import { ImageStatus, ImageType, MutationUploadImageArgs } from '../gql-types.generated';

// eslint-disable-next-line @typescript-eslint/naming-convention
const MUTATION_UPLOAD_IMAGE = gql`
  mutation uploadImage($input: UploadImageInput!) {
    uploadImage(input: $input) {
      uniqueId
      imageUri
    }
  }
`;

export const mutationUploadImage = async (
  client: ApolloClient<NormalizedCacheObject>,
  file: File,
  imageType: ImageType,
): Promise<Record<string, string> | undefined> => {
  const headers = await getStandardHeaders();
  const { data, errors } = await client.mutate<{ uploadImage: ImageStatus }, MutationUploadImageArgs>({
    variables: { input: { file, imageType } },
    mutation: MUTATION_UPLOAD_IMAGE,
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
  if (data && data.uploadImage.uniqueId && data.uploadImage.imageUri) {
    return {
      id: data.uploadImage.uniqueId,
      imageUri: data.uploadImage.imageUri,
    };
  }
  return undefined;
};
