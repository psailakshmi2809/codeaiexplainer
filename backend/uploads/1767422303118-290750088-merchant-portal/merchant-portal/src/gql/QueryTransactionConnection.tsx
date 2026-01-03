import { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import gql from 'graphql-tag';
import { TransactionRecordOrder, TransactionRecordsQuery } from '../gql-types.generated';
import { getStandardHeaders } from '../util/StandardRequestHeaders';

// eslint-disable-next-line @typescript-eslint/naming-convention
const QUERY_TRANSACTION_CONNECTION = gql`
  query transactionRecords(
    $after: String
    $before: String
    $first: Int
    $last: Int
    $orderBy: TransactionRecordOrder!
    $startDate: DateTime
    $endDate: DateTime
  ) {
    transactionRecords(
      after: $after
      before: $before
      first: $first
      last: $last
      orderBy: $orderBy
      startDate: $startDate
      endDate: $endDate
    ) {
      totalCount
      pageInfo {
        endCursor
        hasNextPage
        hasPreviousPage
        startCursor
        __typename
      }
      nodes {
        createdAt
        id
        transactionType
        grossAmount
        feeAmount
        netAmount
        __typename
      }
      edges {
        cursor
        node {
          id
          __typename
        }
        __typename
      }
      __typename
    }
  }
`;

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const queryTransactionConnection = async (
  client: ApolloClient<NormalizedCacheObject>,
  after: string | undefined,
  before: string | undefined,
  first: number | undefined,
  last: number | undefined,
  orderBy: TransactionRecordOrder,
  startDate: Date,
  endDate: Date,
) => {
  const headers = await getStandardHeaders();
  const { data, errors } = await client.query<TransactionRecordsQuery>({
    variables: { after, before, first, last, orderBy, startDate, endDate },
    query: QUERY_TRANSACTION_CONNECTION,
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
  return data?.transactionRecords;
};
