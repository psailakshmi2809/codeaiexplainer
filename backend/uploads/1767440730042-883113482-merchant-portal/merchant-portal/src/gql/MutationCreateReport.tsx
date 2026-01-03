import { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import gql from 'graphql-tag';

import { ReportType, FileFormat, CreateReportStatus, MutationCreateReportArgs } from '../gql-types.generated';

import { getStandardHeaders } from '../util/StandardRequestHeaders';

// eslint-disable-next-line @typescript-eslint/naming-convention
const MUTATION_CREATE_REPORT = gql`
  mutation createReport($input: CreateReportInput!) {
    createReport(input: $input) {
      code
      error
      message
      report {
        id
      }
    }
  }
`;

export const mutationCreateReport = async (
  client: ApolloClient<NormalizedCacheObject>,
  endDate: string | undefined,
  format: FileFormat,
  reportType: ReportType,
  startDate: string | undefined,
): Promise<CreateReportStatus | undefined> => {
  const headers = await getStandardHeaders();
  const { data, errors } = await client.mutate<{ createReport: CreateReportStatus }, MutationCreateReportArgs>({
    variables: {
      input: {
        endDate,
        format,
        reportType,
        startDate,
      },
    },
    mutation: MUTATION_CREATE_REPORT,
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
    throw new Error('An error has occurred during the report mutation.');
  }
  if (data && data.createReport) {
    return data.createReport;
  }
  return undefined;
};
