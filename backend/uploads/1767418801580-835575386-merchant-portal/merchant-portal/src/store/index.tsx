import { Action, combineReducers, configureStore, ThunkAction } from '@reduxjs/toolkit';

import appReducer from '../features/app/AppSlice';
import homeReducer from '../features/home/HomeSlice';
import userManagementReducer from '../features/user-management/UserManagementSlice';
import virtualTerminalReducer from '../features/virtual-terminal/PaymentVirtualTerminalSlice';
import accountManagementReducer from '../features/account-management/AccountManagementSlice';
import customerManagementReducer from '../features/customers-management/CustomerManagementSlice';
import helpReducer from '../features/help/HelpSlice';
import accountPreferencesReducer from '../features/account-preferences/AccountPreferencesSlice';
import paymentRequestReducer from '../features/payment-request/PaymentRequestSlice';
import MerchantPttOnboardingSlice from '../features/merchant-ptt-onboarding/MerchantPttOnboardingSlice';

export const rootReducer = combineReducers({
  app: appReducer,
  home: homeReducer,
  userManagement: userManagementReducer,
  accountManagement: accountManagementReducer,
  customerManagement: customerManagementReducer,
  help: helpReducer,
  accountPreferences: accountPreferencesReducer,
  virtualTerminal: virtualTerminalReducer,
  paymentRequest: paymentRequestReducer,
  merchantPttOnboaring: MerchantPttOnboardingSlice,
});

const store = configureStore({
  devTools: process.env.NODE_ENV !== 'production',
  reducer: rootReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
export type AppThunk = ThunkAction<void, RootState, null, Action<string>>;
export type AppDispatch = typeof store.dispatch;

export default store;
