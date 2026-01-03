/* eslint-disable no-param-reassign */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Customer, CustomerConnection, UpsertCustomerStatus } from '../../gql-types.generated';
import { RootState } from '../../store';

interface SliceState {
  customersConnection?: CustomerConnection;
  customers?: Customer[];
  queryCustomersErrors?: string[];
  isLoadingCustomers?: boolean;
  isCustomerListInFlight?: boolean;
  isUpsertCustomerInFlight?: boolean;
  upsertCustomerError?: string;
  upsertCustomerStatus?: UpsertCustomerStatus;
  customerQueryString?: string;
  customerQueryHasErrors: boolean;
  upsertCustomerHasDuplicateEmailsError: boolean;
}

const initialState: SliceState = {
  customers: [],
  isLoadingCustomers: false,
  isUpsertCustomerInFlight: false,
  customerQueryHasErrors: false,
  upsertCustomerHasDuplicateEmailsError: false,
};

export const slice = createSlice({
  name: 'customerManagement',
  initialState,
  reducers: {
    fetchIsCustomerListInFlight: (state, action: PayloadAction<boolean>) => {
      state.isCustomerListInFlight = action.payload;
    },
    fetchIsLoadingCustomers: (state, action: PayloadAction<boolean>) => {
      state.isLoadingCustomers = action.payload;
    },
    fetchCustomersSuccess: (state, action: PayloadAction<CustomerConnection>) => {
      state.customersConnection = action.payload;
      let items = state.customers;

      // Initialise the array if this is the first run, or a refresh. We know its a refresh
      // when the connection contains the first page of data.
      if (!items || !state.customersConnection.pageInfo.hasPreviousPage) {
        items = [];
      }

      action.payload.nodes.forEach(node => {
        if (!items?.some(i => i.id === node?.id)) {
          items?.push(node as Customer);
        }
      });

      state.customers = items;
    },
    fetchQueryCustomersErrors: (state, action: PayloadAction<string[] | undefined>) => {
      state.queryCustomersErrors = action.payload;
    },
    captureUpsertCustomerInFlight: (state, action: PayloadAction<boolean | undefined>) => {
      state.isUpsertCustomerInFlight = action.payload;
    },
    captureUpsertCustomerError: (state, action: PayloadAction<string | undefined>) => {
      state.upsertCustomerError = action.payload;
    },
    clearUpsertCustomerError: state => {
      // clearing all the upsertCustomer error message and checks
      state.upsertCustomerError = undefined;
      state.upsertCustomerHasDuplicateEmailsError = false;
    },
    clearUpsertCustomerStatus: state => {
      state.upsertCustomerStatus = undefined;
    },
    captureUpsertCustomerStatus: (state, action: PayloadAction<UpsertCustomerStatus>) => {
      state.upsertCustomerStatus = action.payload;
    },
    captureCustomerSearch: (state, action: PayloadAction<string | undefined>) => {
      state.customerQueryString = action.payload;
    },
    fetchCustomerQueryHasErrors: (state, action: PayloadAction<boolean>) => {
      state.customerQueryHasErrors = action.payload;
    },
    fetchUpsertCustomerHasDuplicateEmailsError: (state, action: PayloadAction<boolean>) => {
      state.upsertCustomerHasDuplicateEmailsError = action.payload;
    },
  },
});

export const selectIsCustomerListInFlight = (state: RootState): boolean | undefined => state.customerManagement.isCustomerListInFlight;
export const selectIsLoadingCustomers = (state: RootState): boolean | undefined => state.customerManagement.isLoadingCustomers;
export const selectCustomerConnection = (state: RootState): CustomerConnection | undefined =>
  state.customerManagement.customersConnection;
export const selectCustomers = (state: RootState): Customer[] | undefined => state.customerManagement.customers;
export const selectQueryCustomersErrors = (state: RootState): string[] | undefined => state.customerManagement.queryCustomersErrors;
export const selectUpsertCustomerError = (state: RootState): string | undefined => state.customerManagement.upsertCustomerError;
export const selectUpsertCustomerStatus = (state: RootState): UpsertCustomerStatus | undefined =>
  state.customerManagement.upsertCustomerStatus;
export const selectUpsertInFlight = (state: RootState): boolean | undefined => state.customerManagement.isUpsertCustomerInFlight;
export const selectCustomerSearch = (state: RootState): string | undefined => state.customerManagement.customerQueryString;
export const selectCustomerQueryHasErrors = (state: RootState): boolean => state.customerManagement.customerQueryHasErrors;
export const selectUpsertCustomerHasDuplicateEmailsError = (state: RootState): boolean =>
  state.customerManagement.upsertCustomerHasDuplicateEmailsError;

export const {
  fetchIsCustomerListInFlight,
  fetchIsLoadingCustomers,
  fetchCustomersSuccess,
  fetchQueryCustomersErrors,
  captureUpsertCustomerError,
  clearUpsertCustomerError,
  clearUpsertCustomerStatus,
  captureUpsertCustomerInFlight,
  captureUpsertCustomerStatus,
  captureCustomerSearch,
  fetchCustomerQueryHasErrors,
  fetchUpsertCustomerHasDuplicateEmailsError,
} = slice.actions;

export default slice.reducer;
