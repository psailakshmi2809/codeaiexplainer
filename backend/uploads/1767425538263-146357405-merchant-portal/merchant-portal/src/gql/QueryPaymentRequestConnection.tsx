import { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import gql from 'graphql-tag';
import { PaymentRequestOrder, PaymentRequestsQuery, PaymentRequestStatus } from '../gql-types.generated';
import { getStandardHeaders } from '../util/StandardRequestHeaders';

// eslint-disable-next-line @typescript-eslint/naming-convention
const QUERY_PAYMENT_CONNECTION = gql`
  query paymentRequests(
    $after: String
    $before: String
    $first: Int
    $last: Int
    $orderBy: PaymentRequestOrder!
    $queryString: String
    $status: PaymentRequestStatus
    $statusFilter: [PaymentRequestStatus!]
    $customerId: String
    $id: String
  ) {
    paymentRequests(
      after: $after
      before: $before
      first: $first
      last: $last
      orderBy: $orderBy
      queryString: $queryString
      status: $status
      statusFilter: $statusFilter
      customerId: $customerId
      id: $id
    ) {
      totalCount
      pageInfo {
        endCursor
        hasNextPage
        hasPreviousPage
        startCursor
      }
      nodes {
        amount
        communications {
          communicationType
          email
          phoneNumber
          requestTimestamp
          sentTimestamp
          status
          subType
        }
        createdAt
        createdBy
        id
        invoiceLink
        invoiceLinks
        invoiceId
        referenceNumber
        status
        statusReason
        customerPONumber
        orderNumber
        invoiceNumber
        discountEndDate
        discountAmount
        dueDate
        totalDue
        totalRefunded
        payments {
          id
          status
          amount
          amountRefunded
          attemptTimestamp
          createdAt
          amountDisputed
          creditAmount
          paymentMethod {
            creditCard {
              cardBrand
              lastFour
            }
            paymentBank {
              lastFour
            }
          }
          creditMemoAllocation {
            referenceNumber
            amount
          }
          refunds {
            id
            status
            amount
          }
        }
        paymentUrl
        owner {
          paymentId
          tenantId
          disputeId
          customerId
        }
        customer {
          id
          name
          customerNumber
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

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const queryPaymentRequestConnection = async (
  client: ApolloClient<NormalizedCacheObject>,
  after: string | undefined,
  before: string | undefined,
  first: number | undefined,
  last: number | undefined,
  orderBy: PaymentRequestOrder,
  queryString: string | undefined,
  status: PaymentRequestStatus | undefined,
  statusFilter: PaymentRequestStatus[] | undefined,
  customerId: string | undefined,
  id: string | undefined,
) => {
  const headers = await getStandardHeaders();
  const { data, errors } = await client.query<PaymentRequestsQuery>({
    variables: { after, before, first, last, orderBy, queryString, status, statusFilter, customerId, id },
    query: QUERY_PAYMENT_CONNECTION,
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
  return data?.paymentRequests;
};
