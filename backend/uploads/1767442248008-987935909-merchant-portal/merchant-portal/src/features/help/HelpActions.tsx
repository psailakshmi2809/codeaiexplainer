import { AppDispatch } from '../../store';
import { incrementRequestsInFlight, decrementRequestsInFlight } from '../app/AppSlice';
import { queryOwningProduct } from '../../gql/QueryOwningProduct';
import { gqlClient } from '../../components/AppProvider';
import { fetchProductName } from './HelpSlice';

export const fetchOwningProduct =
  () =>
  async (dispatch: AppDispatch): Promise<void> => {
    dispatch(incrementRequestsInFlight());
    try {
      const owningProduct = await queryOwningProduct(gqlClient);
      if (owningProduct) {
        dispatch(fetchProductName(owningProduct));
      }
      dispatch(decrementRequestsInFlight());
    } catch (e) {
      console.error(e);
      dispatch(decrementRequestsInFlight());
    }
  };
