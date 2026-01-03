import { gqlClient } from '../../components/AppProvider';
import {
  UpdateConvenienceFeesInput,
  UpdateIntegrationSettingsInput,
  UpdatePaymentReminderSettingsInput,
  UpdateTenantAccountEmailSettingsInput,
} from '../../gql-types.generated';
import { mutationSendTestEmail } from '../../gql/MutationSendTestEmail';
import { mutationUpdateConvenienceFees } from '../../gql/MutationUpdateConvenienceFees';
import { mutationUpdateTenantAccountEmailSettings } from '../../gql/MutationUpdateTenantAccountEmailSettings';
import { mutationUpdateIntegrationSettings } from '../../gql/MutationUpsertIntegrationSettings';
import { mutationUpdatePaymentReminderSettings } from '../../gql/MutationUpsertPaymentReminderSettings';
import { AppDispatch } from '../../store';
import { fetchTenantAccount } from '../app/AppActions';
import { decrementRequestsInFlight, incrementRequestsInFlight } from '../app/AppSlice';
import {
  captureConvenienceFeesRequestInFlight,
  captureIntegrationSettingsRequestInFlight,
  capturePaymentReminderSettingsRequestInFlight,
  captureUpdateConvenienceFeesStatus,
  captureUpdateIntegrationSettingsStatus,
  captureUpdatePaymentReminderSettingsStatus,
  captureUpdateConvenienceFeesError,
  clearUpdateConvenienceFeesError,
  captureUpdateTenantAccountEmailSettingsStatus,
  captureTenantCustomEmailSettingsError,
  captureSendTestEmailInFlight,
  captureSendTestEmailError,
  captureSendTestEmailStatus,
} from './AccountPreferencesSlice';

export const updateIntegrationSettings =
  (integrationSettings: UpdateIntegrationSettingsInput) =>
  async (dispatch: AppDispatch): Promise<void> => {
    dispatch(incrementRequestsInFlight());
    dispatch(captureIntegrationSettingsRequestInFlight(true));
    try {
      const integrationSettingsStatus = await mutationUpdateIntegrationSettings(gqlClient, integrationSettings);
      dispatch(captureUpdateIntegrationSettingsStatus(integrationSettingsStatus));
      dispatch(fetchTenantAccount());
    } catch (e) {
      console.log(e);
    } finally {
      dispatch(decrementRequestsInFlight());
      dispatch(captureIntegrationSettingsRequestInFlight(false));
    }
  };

export const updateConvenienceFees =
  (convenienceFeesInput: UpdateConvenienceFeesInput) =>
  async (dispatch: AppDispatch): Promise<void> => {
    dispatch(incrementRequestsInFlight());
    dispatch(captureConvenienceFeesRequestInFlight(true));
    dispatch(captureUpdateConvenienceFeesStatus());
    dispatch(clearUpdateConvenienceFeesError());
    try {
      const convenienceFeesStatus = await mutationUpdateConvenienceFees(gqlClient, convenienceFeesInput);
      dispatch(captureUpdateConvenienceFeesStatus(convenienceFeesStatus));
      dispatch(fetchTenantAccount());
    } catch (e) {
      dispatch(captureUpdateConvenienceFeesError((e as Error).message));
    } finally {
      dispatch(decrementRequestsInFlight());
      dispatch(captureConvenienceFeesRequestInFlight(false));
    }
  };

export const updatePaymentReminderSettings =
  (integrationSettings: UpdatePaymentReminderSettingsInput) =>
  async (dispatch: AppDispatch): Promise<void> => {
    dispatch(incrementRequestsInFlight());
    dispatch(capturePaymentReminderSettingsRequestInFlight(true));
    try {
      const integrationSettingsStatus = await mutationUpdatePaymentReminderSettings(gqlClient, integrationSettings);
      dispatch(captureUpdatePaymentReminderSettingsStatus(integrationSettingsStatus));
      dispatch(fetchTenantAccount());
    } catch (e) {
      console.log(e);
    } finally {
      dispatch(decrementRequestsInFlight());
      dispatch(capturePaymentReminderSettingsRequestInFlight(false));
    }
  };

export const updateTenantAccountEmailSettings =
  (emailSettings: UpdateTenantAccountEmailSettingsInput) =>
  async (dispatch: AppDispatch): Promise<void> => {
    dispatch(incrementRequestsInFlight());
    dispatch(capturePaymentReminderSettingsRequestInFlight(true));
    dispatch(captureTenantCustomEmailSettingsError(undefined));
    try {
      const tenantAccountEmailSettingsStatus = await mutationUpdateTenantAccountEmailSettings(gqlClient, emailSettings);
      dispatch(captureUpdateTenantAccountEmailSettingsStatus(tenantAccountEmailSettingsStatus));
      dispatch(fetchTenantAccount());
    } catch (e) {
      dispatch(captureTenantCustomEmailSettingsError(e));
    } finally {
      dispatch(decrementRequestsInFlight());
      dispatch(capturePaymentReminderSettingsRequestInFlight(false));
    }
  };

export const fetchSendTestEmail =
  (email: string) =>
  async (dispatch: AppDispatch): Promise<void> => {
    dispatch(captureSendTestEmailInFlight(true));
    dispatch(captureSendTestEmailStatus(undefined));
    dispatch(captureSendTestEmailError(undefined));
    try {
      const sendTestEmailStatus = await mutationSendTestEmail(gqlClient, email);
      if (sendTestEmailStatus) dispatch(captureSendTestEmailStatus(sendTestEmailStatus));
    } catch (e) {
      dispatch(captureSendTestEmailError(e));
    } finally {
      dispatch(captureSendTestEmailInFlight(false));
    }
  };
