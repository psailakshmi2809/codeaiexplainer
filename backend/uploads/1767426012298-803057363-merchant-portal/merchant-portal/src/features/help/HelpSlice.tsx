/* eslint-disable no-param-reassign */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../store';
import { ApteanProduct } from '../../gql-types.generated';

interface SliceState {
  productName?: ApteanProduct;
}

const initialState: SliceState = {
  productName: undefined,
};

export const slice = createSlice({
  name: 'help',
  initialState,
  reducers: {
    fetchProductName: (state, action: PayloadAction<ApteanProduct>) => {
      state.productName = action.payload;
    },
  },
});

export const selectProductName = (state: RootState): ApteanProduct | undefined => state.help.productName;

export const { fetchProductName } = slice.actions;

export default slice.reducer;
