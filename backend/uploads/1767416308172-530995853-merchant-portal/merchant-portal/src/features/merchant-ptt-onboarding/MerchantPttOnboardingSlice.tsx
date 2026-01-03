/* eslint-disable no-param-reassign */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { RootState } from '../../store';

interface SliceState {
  onboardingError?: string;
}

const initialState: SliceState = {
  onboardingError: undefined,
};

export const slice = createSlice({
  name: 'merchantPttOnboarding',
  initialState,
  reducers: {
    fetchPttOnboardingError: (state, action: PayloadAction<string | undefined>) => {
      state.onboardingError = action.payload;
    },
  },
});

export const selectPttOnboardingError = (state: RootState): string | undefined => state.merchantPttOnboaring.onboardingError;

export const { fetchPttOnboardingError } = slice.actions;

export default slice.reducer;
