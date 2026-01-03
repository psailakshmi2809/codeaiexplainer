import { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import gql from 'graphql-tag';
import { FileFormat, PayoutReport } from '../gql-types.generated';
import { getStandardHeaders } from '../util/StandardRequestHeaders';

// eslint-disable-next-line @typescript-eslint/naming-convention
const QUERY_PAYOUT_REPORT = gql`
  query payoutReport($payoutReportId: ID!, $format: FileFormat!) {
    payoutReport(payoutReportId: $payoutReportId, format: $format) {
      id
      uri
      status
    }
  }
`;

export const queryPayoutReport = async (
  client: ApolloClient<NormalizedCacheObject>,
  payoutReportId: string,
  format: FileFormat,
): Promise<PayoutReport | undefined> => {
  const headers = await getStandardHeaders();
  const { data, errors } = await client.query({
    variables: { payoutReportId, format },
    query: QUERY_PAYOUT_REPORT,
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
  return data.payoutReport as PayoutReport;
};
