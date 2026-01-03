/* eslint-disable no-param-reassign */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Person, DeletePersonStatus, UpsertPersonStatus } from '../../gql-types.generated';
import { RootState } from '../../store';

interface SliceState {
  error?: Error;
  userList: Person[];
  upsertPersonStatus?: UpsertPersonStatus;
  deletePersonStatus?: DeletePersonStatus;
}

const initialState: SliceState = {
  error: undefined,
  userList: [],
  upsertPersonStatus: undefined,
  deletePersonStatus: undefined,
};

export const slice = createSlice({
  name: 'userManagement',
  initialState,
  reducers: {
    fetchError: (state, action: PayloadAction<Error>) => {
      state.error = action.payload;
    },

    clearError: state => {
      state.error = undefined;
    },

    captureUpsertPersonStatus: (state, action: PayloadAction<UpsertPersonStatus | undefined>) => {
      state.upsertPersonStatus = action.payload;
    },

    captureDeletePersonStatus: (state, action: PayloadAction<DeletePersonStatus | undefined>) => {
      state.deletePersonStatus = action.payload;
    },

    fetchUserListSuccess: (state, action: PayloadAction<Person[]>) => {
      state.userList = action.payload;
    },
  },
});

export const selectError = (state: RootState): Error | undefined => state.userManagement.error;
export const selectUpsertPersonStatus = (state: RootState): UpsertPersonStatus | undefined => state.userManagement.upsertPersonStatus;
export const selectDeletePersonStatus = (state: RootState): DeletePersonStatus | undefined => state.userManagement.deletePersonStatus;
export const selectUserList = (state: RootState): Person[] => state.userManagement.userList;
export const selectBusinessOwners = (state: RootState): Person[] =>
  state.userManagement.userList.filter((user: Person) => {
    return user?.relationship?.owner;
  });
export const selectPrimaryAccountHolder = (state: RootState): Person | undefined =>
  state.userManagement.userList.find((user: Person) => {
    return user?.relationship?.primaryAccountHolder;
  });

export const { captureDeletePersonStatus, captureUpsertPersonStatus, fetchError, fetchUserListSuccess, clearError } = slice.actions;

export default slice.reducer;
