import { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import gql from 'graphql-tag';
import { GetTenantAccountQuery, TenantAccount } from '../gql-types.generated';
import { getStandardHeaders } from '../util/StandardRequestHeaders';

// eslint-disable-next-line @typescript-eslint/naming-convention
const QUERY_TENANT_ACCOUNT = gql`
  query getTenantAccount {
    account {
      #Stuff from legal entity
      country
      createdAt
      id
      owner {
        tenantId
      }
      updatedAt
      email
      payFacType
      payfac {
        ids {
          resourceId
          resourceType
        }
      }
      #stuff from merchant account
      capabilities {
        cardPayments
        achPayments
        accountPayouts
      }
      #merchant account stuff for account management
      businessProfile {
        description
        logoUrl
        highResLogoUrl
        name
        url
        supportEmail
        mcc
      }
      businessType #EntityType for Account Management
      company {
        address {
          city
          country
          line1
          line2
          postalCode
          region
        }
        description
        name
        phone {
          countryCode
          number
          phoneNumber
        }
        structure
        verification {
          status
          kycIssue
          ssnIssue
          additionalDocuments {
            documentId
            rejectReason
            status
            type
          }
          documents {
            documentId
            rejectReason
            status
            type
          }
          transitionStatus
        }
      }
      settings {
        supportedPaymentMethods
        customEmailSettings {
          enabled
          profile {
            from
            host
            port
            username
            password
            securityType
          }
          paymentRequestDefaultText
        }
        features {
          creditMemos {
            enabled
          }
          customers {
            enabled
          }
          payments {
            convenienceFees
            virtualTerminal
          }
          paymentRequests {
            consolidatedPayment
            partialPayment
            paymentReminderEmails
          }
          customEmailSettings {
            enabled
          }
        }
        options {
          payments {
            requirePartialPaymentReason
          }
        }
        cardPayments {
          #achPayments is like this too. Find out if the values will be different
          refundPolicy
          statementDescription
        }
        achPayments {
          refundPolicy
          statementDescription
        }
        accountPayouts {
          statementDescription
          status
          schedule {
            interval
          }
          currency
          accountType
          accountLastFour
        }
        integrationSettings {
          mode
          processUnsentCommunications
          previewSettings {
            enabled
            email
          }
        }
        paymentReminders {
          dueDateReminderDays
          overdueReminderDays
          overdueReminderMessage
          reminderMessage
          sendDueDateReminder
          sendOverdueReminder
        }
        convenienceFees {
          maxCreditConvenienceFee
          maxDebitConvenienceFee
          creditCardRateBps
          debitCardRateBps
        }
        supportedCapabilities {
          accountBalance
          accountStatus
          basicAccountStatus
          businessOwners
          description
          disputes
          entityType
          feeSchedule
          legalEntityName
          payoutReports
          payouts
          refundPolicy
          statementDescription
          statements
          website
        }
      }
      statements {
        createdAt
        startTime
        endTime
        availableFormats {
          format
          fileName
        }
      }
      payoutReports {
        payoutReportId
        startTime
        endTime
        payoutCreateTime
        payoutCompleteTime
      }
      requirements {
        pastDue
        currentlyDue
        pendingVerification
        eventuallyDue
      }
      tosAcceptance {
        date
      }
      defaultCurrency
      balances {
        balance
        incomingPending
        outgoingPending
        reserve
        updatedTimestamp
      }
      feeSchedule
      errors
    }
  }
`;

export const queryTenantAccount = async (client: ApolloClient<NormalizedCacheObject>): Promise<TenantAccount | undefined> => {
  const headers = await getStandardHeaders();
  const { data, errors } = await client.query<GetTenantAccountQuery>({
    query: QUERY_TENANT_ACCOUNT,
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
  return data?.account as TenantAccount;
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const watchQueryTenantAccount = async (client: ApolloClient<NormalizedCacheObject>) => {
  const headers = await getStandardHeaders();
  return client.watchQuery<GetTenantAccountQuery>({
    query: QUERY_TENANT_ACCOUNT,
    context: {
      headers,
    },
    pollInterval: 2000,
  });
};
