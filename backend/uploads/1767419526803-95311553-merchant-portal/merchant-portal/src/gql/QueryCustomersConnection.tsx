import { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import gql from 'graphql-tag';
import { CustomerConnection, QueryCustomersArgs, CustomersQuery } from '../gql-types.generated';
import { getStandardHeaders } from '../util/StandardRequestHeaders';

// eslint-disable-next-line @typescript-eslint/naming-convention
const QUERY_CUSTOMERS_CONNECTION = gql`
  query customers(
    $queryString: String
    $startDate: DateTime
    $endDate: DateTime
    $after: String
    $before: String
    $first: Int
    $last: Int
    $id: String
    $dateRangeType: CustomerDateRangeType
    $orderBy: CustomerOrder!
  ) {
    customers(
      queryString: $queryString
      startDate: $startDate
      endDate: $endDate
      after: $after
      before: $before
      first: $first
      last: $last
      id: $id
      dateRangeType: $dateRangeType
      orderBy: $orderBy
    ) {
      totalCount
      pageInfo {
        endCursor
        hasNextPage
        hasPreviousPage
        startCursor
      }
      nodes {
        createdAt
        createdBy
        customerNumber
        customerUsers {
          email
          role
        }
        id
        name
        owner {
          tenantId
        }
        updatedAt
        updatedBy
        convenienceFees {
          overrideConvenienceFees
          creditCardRateBps
          debitCardRateBps
        }
      }
      edges {
        cursor
        node {
          id
        }
      }
    }
  }
`;

export const queryCustomersConnection = async (
  client: ApolloClient<NormalizedCacheObject>,
  options: QueryCustomersArgs,
): Promise<CustomerConnection | undefined> => {
  const { queryString, startDate, endDate, after, before, first, last, id, dateRangeType, orderBy } = options;
  const headers = await getStandardHeaders();
  const { data, errors } = await client.query<CustomersQuery>({
    variables: { queryString, startDate, endDate, after, before, first, last, id, dateRangeType, orderBy },
    query: QUERY_CUSTOMERS_CONNECTION,
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

  return data?.customers as CustomerConnection;
};
