import { gqlClient } from '../../components/AppProvider';
import { LoginContext, Person, TenantAccount } from '../../gql-types.generated';
import { queryLoginContext } from '../../gql/QueryLoginContext';
import { queryPersonByEmail } from '../../gql/QueryPersonByEmail';
import { queryTenantAccount, watchQueryTenantAccount } from '../../gql/QueryTenantAccount';
import { AppDispatch } from '../../store';
import {
  incrementRequestsInFlight,
  fetchViewerUserByEmailSuccess,
  decrementRequestsInFlight,
  fetchError,
  fetchTenantAccountSuccess,
  fetchQueryTenantErrors,
  fetchQueryPersonErrors,
  fetchQueryLoginContextErrors,
  fetchLoginContextSuccess,
  clearAppError,
} from './AppSlice';

export const fetchLoginContext =
  () =>
  async (dispatch: AppDispatch): Promise<void> => {
    dispatch(incrementRequestsInFlight());
    dispatch(fetchQueryLoginContextErrors(undefined));
    try {
      const loginContext = await queryLoginContext(gqlClient);
      if (loginContext) {
        dispatch(fetchLoginContextSuccess(loginContext as LoginContext));
      }

      dispatch(decrementRequestsInFlight());
    } catch (e) {
      if (e?.networkError?.result?.errors) {
        const arr: string[] = [];
        e.networkError.result.errors.forEach((error: { message: string }) => {
          arr.push(error.message);
        });
        dispatch(fetchQueryLoginContextErrors(arr));
      }
      dispatch(fetchError(e));
      dispatch(decrementRequestsInFlight());
    }
  };

export const fetchViewerUserByEmail =
  (email: string) =>
  async (dispatch: AppDispatch): Promise<void> => {
    dispatch(incrementRequestsInFlight());
    dispatch(fetchQueryPersonErrors(undefined));
    dispatch(clearAppError());
    try {
      const viewerUser = await queryPersonByEmail(gqlClient, email);
      if (viewerUser) {
        dispatch(fetchViewerUserByEmailSuccess(viewerUser as Person));
      }

      dispatch(decrementRequestsInFlight());
    } catch (e) {
      if (e?.networkError?.result?.errors) {
        const arr: string[] = [];
        e.networkError.result.errors.forEach((error: { message: string }) => {
          arr.push(error.message);
        });
        dispatch(fetchQueryPersonErrors(arr));
      }
      dispatch(fetchError(e));
      dispatch(decrementRequestsInFlight());
    }
  };

export const fetchTenantAccount =
  () =>
  async (dispatch: AppDispatch): Promise<void> => {
    dispatch(incrementRequestsInFlight());
    dispatch(fetchQueryTenantErrors(undefined));
    try {
      const account = await queryTenantAccount(gqlClient);
      if (account) {
        dispatch(fetchTenantAccountSuccess(account));
      }
      dispatch(decrementRequestsInFlight());
    } catch (e) {
      if (e?.networkError?.result?.errors) {
        const arr: string[] = [];
        e.networkError.result.errors.forEach((error: { message: string }) => {
          arr.push(error.message);
        });
        dispatch(fetchQueryTenantErrors(arr));
      }
      dispatch(fetchError(e));
      dispatch(decrementRequestsInFlight());
    }
  };

export const watchTenantAccount =
  () =>
  async (dispatch: AppDispatch): Promise<void> => {
    dispatch(incrementRequestsInFlight());
    let changeCount = 0;
    let sub: ZenObservable.Subscription;
    let timeout: NodeJS.Timeout;
    try {
      await watchQueryTenantAccount(gqlClient).then(obsQuery => {
        try {
          // Timeout after 6 seconds.
          timeout = setTimeout(() => {
            obsQuery.stopPolling();
            sub.unsubscribe();
            const { data, loading } = obsQuery.getCurrentResult();
            if (changeCount >= 1 && data && data.account && !loading) {
              obsQuery.stopPolling();
              sub.unsubscribe();
              dispatch(fetchTenantAccountSuccess(data.account as TenantAccount));
              dispatch(decrementRequestsInFlight());
            }
          }, 6000);
          // Subscribe only executed when the cache value updates. Needs to update initial change.
          sub = obsQuery.subscribe(({ data, loading }) => {
            if (changeCount >= 1 && data && data.account && !loading) {
              clearTimeout(timeout);
              obsQuery.stopPolling();
              sub.unsubscribe();
              dispatch(fetchTenantAccountSuccess(data.account as TenantAccount));
              dispatch(decrementRequestsInFlight());
            }
            changeCount += 1;
          });
        } catch (e) {
          // Force unsub.
          if (sub) {
            sub.unsubscribe();
          }
          if (timeout) {
            clearTimeout(timeout);
          }
          obsQuery.stopPolling();
          dispatch(fetchError(e));
          dispatch(decrementRequestsInFlight());
        }
      });
    } catch (e) {
      dispatch(fetchError(e));
      dispatch(decrementRequestsInFlight());
    }
  };
