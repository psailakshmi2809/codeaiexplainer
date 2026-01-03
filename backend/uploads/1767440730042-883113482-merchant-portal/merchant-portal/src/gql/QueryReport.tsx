import { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import gql from 'graphql-tag';
import { Report } from '../gql-types.generated';
import { getStandardHeaders } from '../util/StandardRequestHeaders';

// eslint-disable-next-line @typescript-eslint/naming-convention
const QUERY_REPORT = gql`
  query report($id: String!) {
    report(id: $id) {
      id
      downloadUrl
      status
    }
  }
`;

export const queryReport = async (client: ApolloClient<NormalizedCacheObject>, id: string): Promise<Report | undefined> => {
  const headers = await getStandardHeaders();
  const { data, errors } = await client.query({
    variables: { id },
    query: QUERY_REPORT,
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
    throw new Error('An error has occurred during the query.');
  }
  return data.report as Report;
};
