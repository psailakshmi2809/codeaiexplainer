import { gqlClient } from '../../components/AppProvider';
import { MutationStatusCode, Person, AppRole } from '../../gql-types.generated';
import { mutationDeletePerson } from '../../gql/MutationDeletePerson';
import { mutationUpsertPerson } from '../../gql/MutationUpsertPerson';
import { queryPersonList } from '../../gql/QueryPersonList';
import { AppDispatch, AppThunk } from '../../store';
import { decrementRequestsInFlight, incrementRequestsInFlight } from '../app/AppSlice';
import { fetchError, fetchUserListSuccess, captureDeletePersonStatus, captureUpsertPersonStatus } from './UserManagementSlice';

export const upsertPersonData =
  (firstName: string, lastName: string, email: string, role: AppRole, id?: string): AppThunk =>
  async (dispatch: AppDispatch): Promise<void> => {
    dispatch(incrementRequestsInFlight());

    try {
      const upsertPersonStatus = await mutationUpsertPerson(gqlClient, {
        email,
        id,
        firstName,
        lastName,
        role,
        deleted: false,
      });
      if (upsertPersonStatus) {
        if (upsertPersonStatus.code === MutationStatusCode.Error) {
          // Fetch error immediately if found now.
          dispatch(fetchError({ message: upsertPersonStatus.message } as Error));
        }
        dispatch(captureUpsertPersonStatus(upsertPersonStatus));
      }
      dispatch(decrementRequestsInFlight());
    } catch (e) {
      console.error(e);
      dispatch(fetchError(e));
      dispatch(decrementRequestsInFlight());
    }
  };

export const deletePersonData =
  (id: string): AppThunk =>
  async (dispatch: AppDispatch): Promise<void> => {
    dispatch(incrementRequestsInFlight());

    try {
      const deletePersonStatus = await mutationDeletePerson(gqlClient, id);
      if (deletePersonStatus) {
        if (deletePersonStatus.code === MutationStatusCode.Error) {
          // Fetch error immediately if found now.
          dispatch(fetchError({ message: deletePersonStatus.message } as Error));
        }
        dispatch(captureDeletePersonStatus(deletePersonStatus));
      }
      dispatch(decrementRequestsInFlight());
    } catch (e) {
      console.error(e);
      dispatch(fetchError(e));
      dispatch(decrementRequestsInFlight());
    }
  };

export const fetchUserList =
  () =>
  async (dispatch: AppDispatch): Promise<void> => {
    dispatch(incrementRequestsInFlight());

    try {
      const userList = await queryPersonList(gqlClient);
      if (userList) {
        dispatch(fetchUserListSuccess(userList as Person[]));
      }
      dispatch(decrementRequestsInFlight());
    } catch (e) {
      dispatch(fetchError(e));
      dispatch(decrementRequestsInFlight());
    }
  };
