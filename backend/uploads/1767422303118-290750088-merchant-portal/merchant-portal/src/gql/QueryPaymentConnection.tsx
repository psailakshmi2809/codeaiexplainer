import { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import gql from 'graphql-tag';
import { AmountRange, PaymentOrder, PaymentsQuery, PaymentStatus, PaymentStatusExtended } from '../gql-types.generated';
import { getStandardHeaders } from '../util/StandardRequestHeaders';

// eslint-disable-next-line @typescript-eslint/naming-convention
const QUERY_PAYMENTS = gql`
  query payments(
    $after: String
    $before: String
    $first: Int
    $last: Int
    $orderBy: PaymentOrder!
    $queryString: String
    $status: [PaymentStatus!]
    $extendedPaymentStatus: [PaymentStatusExtended!]
    $startDate: DateTime
    $endDate: DateTime
    $amountRange: AmountRange
    $customerId: String
    $id: String
  ) {
    payments(
      after: $after
      before: $before
      first: $first
      last: $last
      orderBy: $orderBy
      queryString: $queryString
      status: $status
      extendedPaymentStatus: $extendedPaymentStatus
      startDate: $startDate
      endDate: $endDate
      amountRange: $amountRange
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
        id
        status
        pendingReason
        pendingReasonCode
        amount
        amountBeforeFees
        amountDisputed
        amountRefunded
        attemptTimestamp
        completedTimestamp
        createdAt
        cancelReason
        currency
        convenienceFee
        creditAmount
        description
        failureReason
        failureDetail {
          code
          details {
            code
          }
        }
        feeAmount
        immediateCapture
        initiatedBy
        authorizationCode
        customerPONumber
        orderNumber
        invoiceNumber
        paymentMethod {
          creditCard {
            cardBrand
            lastFour
            cardHolder {
              email
            }
          }
          paymentBank {
            lastFour
            accountHolder {
              email
            }
          }
        }
        owner {
          tenantId
          paymentRequestId
          customerId
        }
        refunds {
          amount
          attemptTimestamp
          currency
          id
          refundReason
          status
          createTime
          owner {
            tenantId
          }
          payment {
            id
            amount
            amountBeforeFees
          }
        }
        paymentRequest {
          id
          amount
          referenceNumber
          totalDue
          totalPaid
          status
          payments {
            id
            amount
            amountRefunded
            creditAmount
          }
        }
        paymentRequestAllocation {
          amount
          partialPaymentReason
          paymentRequest {
            id
            amount
            referenceNumber
            totalDue
            totalPaid
            status
            payments {
              id
              amount
              amountRefunded
              creditAmount
            }
          }
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
export const queryPaymentConnection = async (
  client: ApolloClient<NormalizedCacheObject>,
  after: string | undefined,
  before: string | undefined,
  first: number | undefined,
  last: number | undefined,
  orderBy: PaymentOrder,
  queryString: string | undefined,
  status: PaymentStatus[] | undefined,
  extendedPaymentStatus: PaymentStatusExtended[] | undefined,
  startDate: string | undefined,
  endDate: string | undefined,
  amountRange: AmountRange | undefined,
  customerId: string | undefined,
  id: string | undefined,
) => {
  const headers = await getStandardHeaders();
  const { data, errors } = await client.query<PaymentsQuery>({
    variables: {
      after,
      before,
      first,
      last,
      orderBy,
      queryString,
      status,
      extendedPaymentStatus,
      startDate,
      endDate,
      amountRange,
      customerId,
      id,
    },
    query: QUERY_PAYMENTS,
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
  return data?.payments;
};
