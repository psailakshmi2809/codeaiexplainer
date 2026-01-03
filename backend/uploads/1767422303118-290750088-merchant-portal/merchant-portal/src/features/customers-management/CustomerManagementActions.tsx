import { gqlClient } from '../../components/AppProvider';
import { AppDispatch, AppThunk } from '../../store';
import { QueryCustomersArgs, UpsertCustomerInput } from '../../gql-types.generated';
import { queryCustomersConnection } from '../../gql/QueryCustomersConnection';
import { mutationUpsertCustomer } from '../../gql/MutationUpsertCustomer';
import {
  fetchIsLoadingCustomers,
  fetchCustomersSuccess,
  fetchQueryCustomersErrors,
  fetchIsCustomerListInFlight,
  clearUpsertCustomerError,
  captureUpsertCustomerInFlight,
  captureUpsertCustomerStatus,
  captureUpsertCustomerError,
  fetchCustomerQueryHasErrors,
  fetchUpsertCustomerHasDuplicateEmailsError,
} from './CustomerManagementSlice';

export const fetchCustomers =
  (options: QueryCustomersArgs) =>
  async (dispatch: AppDispatch): Promise<void> => {
    const { after } = options;
    if (!after) {
      dispatch(fetchIsLoadingCustomers(true));
    }
    dispatch(fetchIsCustomerListInFlight(true));
    dispatch(fetchQueryCustomersErrors(undefined));
    dispatch(fetchCustomerQueryHasErrors(false));
    try {
      const customers = await queryCustomersConnection(gqlClient, options);
      if (customers) {
        dispatch(fetchCustomersSuccess(customers));
      }
    } catch (e) {
      dispatch(fetchCustomerQueryHasErrors(true));
      if (e?.networkError?.result?.errors) {
        const errors: string[] = e?.networkError?.result?.errors.map((error: { message: string }) => error.message);
        dispatch(fetchQueryCustomersErrors(errors));
      }
    } finally {
      if (!after) {
        dispatch(fetchIsLoadingCustomers(false));
      }
      dispatch(fetchIsCustomerListInFlight(false));
    }
  };

export const upsertCustomer =
  (options: UpsertCustomerInput): AppThunk =>
  async (dispatch: AppDispatch): Promise<void> => {
    try {
      dispatch(clearUpsertCustomerError());
      dispatch(captureUpsertCustomerInFlight(true));

      const upsertStatus = await mutationUpsertCustomer(gqlClient, options);

      if (upsertStatus) {
        dispatch(captureUpsertCustomerStatus(upsertStatus));
      }

      if (upsertStatus?.error) {
        dispatch(captureUpsertCustomerError(upsertStatus.error));
      }
    } catch (e) {
      // checking duplicate entry error specificly
      const error = e?.graphQLErrors[0];
      const exception = error?.extensions?.exception;
      const hasDuplicateEmailsError =
        exception?.errorCode === 'DUPLICATE_ENTRY' &&
        exception.reasonCode === 'EMAIL_ASSOCIATED_WITH_ANOTHER_CUSTOMER' &&
        exception?.duplicateEntries.length > 0;

      if (hasDuplicateEmailsError) {
        const duplicateEntries = exception?.duplicateEntries;
        const duplicateEntriesLength = duplicateEntries.length;
        const emailsText =
          duplicateEntriesLength === 1
            ? duplicateEntries[0]
            : `${duplicateEntries.slice(0, duplicateEntriesLength - 1).join(', ')} and ${
                duplicateEntries[duplicateEntriesLength - 1]
              }`;
        const message = `${emailsText}${
          duplicateEntriesLength === 1 ? ' is' : ' are'
        } already associated with a Customer of your merchant account`;
        dispatch(captureUpsertCustomerError(message));
        dispatch(fetchUpsertCustomerHasDuplicateEmailsError(true));
      } else if (e?.message) {
        dispatch(captureUpsertCustomerError(e.message));
      }
    } finally {
      dispatch(captureUpsertCustomerInFlight(false));
    }
  };
