import { gqlClient } from '../../components/AppProvider';
import { TransitionStatus } from '../../gql-types.generated';
import { updateTenantTransitionStatus } from '../../gql/UpdateTenantTransitionStatus';
import { AppDispatch } from '../../store';
import { decrementRequestsInFlight, incrementRequestsInFlight } from '../app/AppSlice';
import { fetchPttOnboardingError } from './MerchantPttOnboardingSlice';

export const updateOnboardTransitionStatus =
  (status: TransitionStatus, callback: (success: boolean) => void) =>
  async (dispatch: AppDispatch): Promise<void> => {
    try {
      dispatch(incrementRequestsInFlight());
      dispatch(fetchPttOnboardingError(undefined));
      const transitionStatus = await updateTenantTransitionStatus(gqlClient, status);
      if (transitionStatus && callback) {
        callback(true);
      }
      dispatch(decrementRequestsInFlight());
    } catch (e) {
      dispatch(fetchPttOnboardingError(e.message));
      dispatch(decrementRequestsInFlight());
      callback(false);
    }
  };
