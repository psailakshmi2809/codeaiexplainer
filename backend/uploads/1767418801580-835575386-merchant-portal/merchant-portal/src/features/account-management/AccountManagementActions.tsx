import { gqlClient } from '../../components/AppProvider';
import { ImageType, MutationStatusCode, PayoutInterval, UpsertPayoutSettingsStatus } from '../../gql-types.generated';
import { mutationUpsertPayoutSettings } from '../../gql/MutationUpsertPayoutSettings';
import { mutationUpsertPayoutFrequency } from '../../gql/MutationUpsertPayoutFrequency';
import { queryPayoutSettings } from '../../gql/QueryPayoutSettings';
import { AppDispatch, AppThunk } from '../../store';
import { decrementRequestsInFlight, incrementRequestsInFlight } from '../app/AppSlice';
import {
  capturePayoutSettings,
  capturePayoutSettingsStatus,
  captureReloadAfterNameChange,
  fetchError,
  uploadLogoFailure,
  uploadLogoSuccess,
} from './AccountManagementSlice';
import { mutationUpsertRefundPolicy } from '../../gql/MutationUpsertRefundPolicy';
import { mutationUpsertStatementDescription } from '../../gql/MutationUpsertStatementDescription';
import { fetchLoginContext, fetchTenantAccount } from '../app/AppActions';
import { mutationUpsertBusinessUrl } from '../../gql/MutationUpsertBusinessUrl';
import { mutationUpsertSupportEmail } from '../../gql/MutationUpsertSupportEmail';
import { mutationUpsertHighResLogoUrl, mutationUpsertLogoUrl } from '../../gql/MutationUpsertLogo';
import { mutationUploadImage } from '../../gql/MutationUploadImage';
import { mutationUpsertPayerOptions } from '../../gql/MutationUpsertPayerOptions';
import { mutationUpsertBusinessName } from '../../gql/MutationUpsertBusinessName';

export const upsertPayoutSettings =
  (token: string, interval?: PayoutInterval): AppThunk =>
  async (dispatch: AppDispatch): Promise<void> => {
    dispatch(incrementRequestsInFlight());

    try {
      const payoutSettingsStatus = await mutationUpsertPayoutSettings(gqlClient, token, interval);
      if (payoutSettingsStatus) {
        if (payoutSettingsStatus.code === MutationStatusCode.Error) {
          // Fetch error immediately if found now.
          dispatch(fetchError({ message: payoutSettingsStatus.message } as Error));
        }
        dispatch(capturePayoutSettingsStatus(payoutSettingsStatus));
      }
      dispatch(decrementRequestsInFlight());
    } catch (e) {
      console.error(e);
      dispatch(fetchError(e as Error));
      dispatch(decrementRequestsInFlight());
    }
  };

export const fetchPayoutSettings =
  () =>
  async (dispatch: AppDispatch): Promise<void> => {
    dispatch(incrementRequestsInFlight());
    try {
      const payoutSettings = await queryPayoutSettings(gqlClient);
      if (payoutSettings) {
        dispatch(capturePayoutSettings(payoutSettings));
      }
      dispatch(decrementRequestsInFlight());
    } catch (e) {
      dispatch(fetchError(e as Error));
      dispatch(decrementRequestsInFlight());
    }
  };

export const upsertPayoutFrequency =
  (interval: PayoutInterval): AppThunk =>
  async (dispatch: AppDispatch): Promise<void> => {
    dispatch(incrementRequestsInFlight());
    try {
      const payoutSettingsStatus = await mutationUpsertPayoutFrequency(gqlClient, interval);
      if (payoutSettingsStatus) {
        if (payoutSettingsStatus.code === MutationStatusCode.Error) {
          // Fetch error immediately if found now.
          dispatch(fetchError({ message: payoutSettingsStatus.message } as Error));
        }
        dispatch(capturePayoutSettingsStatus(payoutSettingsStatus as UpsertPayoutSettingsStatus));
        dispatch(fetchPayoutSettings());
      }
      dispatch(decrementRequestsInFlight());
    } catch (e) {
      console.error(e);
      dispatch(fetchError(e as Error));
      dispatch(decrementRequestsInFlight());
    }
  };

export const upsertRefundPolicy =
  (refundPolicy: string) =>
  async (dispatch: AppDispatch): Promise<void> => {
    dispatch(incrementRequestsInFlight());
    try {
      const tenantAccountStatus = await mutationUpsertRefundPolicy(gqlClient, refundPolicy);
      console.log(tenantAccountStatus);
      dispatch(decrementRequestsInFlight());
      dispatch(fetchTenantAccount());
    } catch (e) {
      console.log(e);
      dispatch(decrementRequestsInFlight());
    }
  };

export const upsertStatementDescription =
  (statementDescription: string) =>
  async (dispatch: AppDispatch): Promise<void> => {
    dispatch(incrementRequestsInFlight());
    try {
      const tenantAccountStatus = await mutationUpsertStatementDescription(gqlClient, statementDescription);
      console.log(tenantAccountStatus);
      dispatch(decrementRequestsInFlight());
      dispatch(fetchTenantAccount());
    } catch (e) {
      console.log(e);
      dispatch(decrementRequestsInFlight());
    }
  };

export const upsertBusinessUrl =
  (businessUrl: string) =>
  async (dispatch: AppDispatch): Promise<void> => {
    dispatch(incrementRequestsInFlight());
    try {
      const tenantAccountStatus = await mutationUpsertBusinessUrl(gqlClient, businessUrl);
      console.log(tenantAccountStatus);
      dispatch(decrementRequestsInFlight());
      dispatch(fetchTenantAccount());
    } catch (e) {
      console.log(e);
      dispatch(decrementRequestsInFlight());
    }
  };

export const upsertLogoUrl =
  (logoUrl: string) =>
  async (dispatch: AppDispatch): Promise<void> => {
    dispatch(incrementRequestsInFlight());
    try {
      const tenantAccountStatus = await mutationUpsertLogoUrl(gqlClient, logoUrl);
      console.log(tenantAccountStatus);
      dispatch(decrementRequestsInFlight());
      dispatch(fetchTenantAccount());
    } catch (e) {
      console.log(e);
      dispatch(decrementRequestsInFlight());
    }
  };

export const upsertHighResLogoUrl =
  (highResLogoUrl: string) =>
  async (dispatch: AppDispatch): Promise<void> => {
    dispatch(incrementRequestsInFlight());
    try {
      const tenantAccountStatus = await mutationUpsertHighResLogoUrl(gqlClient, highResLogoUrl);
      console.log(tenantAccountStatus);
      dispatch(decrementRequestsInFlight());
      dispatch(fetchTenantAccount());
    } catch (e) {
      console.log(e);
      dispatch(decrementRequestsInFlight());
    }
  };

export const uploadLogo =
  (logo: File, highResLogo?: File): AppThunk =>
  async (dispatch: AppDispatch): Promise<void> => {
    try {
      if (highResLogo) {
        dispatch(incrementRequestsInFlight());
        const uploadHighResResponse = await mutationUploadImage(gqlClient, highResLogo, ImageType.Logo);
        if (!uploadHighResResponse) {
          dispatch(uploadLogoFailure());
          throw new Error('[HomeActions] Upload Logo request not sent');
        }
        dispatch(decrementRequestsInFlight());
        if (uploadHighResResponse.imageUri) {
          await dispatch(upsertHighResLogoUrl(uploadHighResResponse.imageUri));
        }
      }
      dispatch(incrementRequestsInFlight());
      const uploadResponse = await mutationUploadImage(gqlClient, logo, ImageType.Logo);
      if (!uploadResponse) {
        dispatch(uploadLogoFailure());
        throw new Error('[HomeActions] Upload Logo request not sent');
      }
      dispatch(decrementRequestsInFlight());
      dispatch(uploadLogoSuccess(uploadResponse.id));
      if (uploadResponse.imageUri) {
        await dispatch(upsertLogoUrl(uploadResponse.imageUri));
      }
    } catch (e) {
      dispatch(uploadLogoFailure());
      console.error(e);
      dispatch(decrementRequestsInFlight());
    }
  };

export const upsertSupportEmail =
  (supportEmail: string) =>
  async (dispatch: AppDispatch): Promise<void> => {
    dispatch(incrementRequestsInFlight());
    try {
      const tenantAccountStatus = await mutationUpsertSupportEmail(gqlClient, supportEmail);
      console.log(tenantAccountStatus);
      dispatch(decrementRequestsInFlight());
      dispatch(fetchTenantAccount());
    } catch (e) {
      console.log(e);
      dispatch(decrementRequestsInFlight());
    }
  };

export const upsertPayerOptions =
  (partialReasonRequired: boolean) =>
  async (dispatch: AppDispatch): Promise<void> => {
    dispatch(incrementRequestsInFlight());
    try {
      const tenantAccountStatus = await mutationUpsertPayerOptions(gqlClient, partialReasonRequired);
      console.log(tenantAccountStatus);
      dispatch(decrementRequestsInFlight());
      dispatch(fetchTenantAccount());
    } catch (e) {
      console.log(e);
      dispatch(decrementRequestsInFlight());
    }
  };

export const upsertBusinessName =
  (businessName: string) =>
  async (dispatch: AppDispatch): Promise<void> => {
    dispatch(incrementRequestsInFlight());
    try {
      const tenantAccountStatus = await mutationUpsertBusinessName(gqlClient, businessName);
      dispatch(decrementRequestsInFlight());
      if (tenantAccountStatus) {
        dispatch(fetchTenantAccount());
        dispatch(captureReloadAfterNameChange(true));
        dispatch(fetchLoginContext());
      }
    } catch (e) {
      console.log(e);
      dispatch(decrementRequestsInFlight());
    }
  };
