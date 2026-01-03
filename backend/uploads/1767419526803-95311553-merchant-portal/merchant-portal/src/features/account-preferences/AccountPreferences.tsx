import { Box, Divider, Grid, Paper, Theme, Typography } from '@mui/material';
import { createStyles, makeStyles } from '@mui/styles';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import {
  IntegrationMode,
  TenantAccountEmailSettingsProfileInput,
  UpdateConvenienceFeesInput,
  UpdateIntegrationSettingsInput,
  UpdatePaymentReminderSettingsInput,
  UpdateTenantAccountEmailSettingsInput,
} from '../../gql-types.generated';
import { selectTenantAccount, selectNetworkBusy, selectViewerUser } from '../app/AppSlice';
import {
  captureUpdateIntegrationSettingsStatus,
  captureUpdatePaymentReminderSettingsStatus,
  captureUpdateTenantAccountEmailSettingsStatus,
  selectIntegrationSettingsRequestInFlight,
  selectUpdateIntegrationSettingsStatus,
  selectUpdatePaymentReminderRequestInFlight,
  selectUpdatePaymentReminderStatus,
  selectUpdateConvenienceFeesError,
  clearUpdateConvenienceFeesError,
  selectTenantAccountEmailSettingsStatus,
  selectUpdateTenantAccountEmailSettingsRequestInFlight,
  selectTenantCustomEmailSettingsError,
  captureTenantCustomEmailSettingsError,
  selectSendTestEmailInFlight,
  selectSendTestEmailError,
  selectSendTestEmailStatus,
  captureSendTestEmailStatus,
  captureSendTestEmailError,
} from './AccountPreferencesSlice';
import {
  fetchSendTestEmail,
  updateConvenienceFees,
  updateIntegrationSettings,
  updatePaymentReminderSettings,
  updateTenantAccountEmailSettings,
} from './AccountPreferencesActions';

import PaymentRequestIntegrationSettings from '../../components/PaymentRequestIntegrationSettings';
import PaymentReminderPreferences from '../../components/PaymentReminderPreferences';
import { ConvenienceFeesSettings } from '../../components/ConvenienceFeesSettings';
import TenantAccountEmailSettings from '../../components/TenantAccountEmailPreferences';
import AccountPreferenceErrorSnackBar from '../../components/AccountPreferenceErrorSnackBar';
import { Helmet } from 'react-helmet';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
      flexFlow: 'column nowrap',
      flex: 1,
      height: '100%',
      minHeight: 350,
    },
    header: {
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      textAlign: 'start',
      padding: theme.spacing(2.5),
    },
    grid: {
      padding: theme.spacing(3),
    },
    internalGrid: {
      display: 'flex',
      flexFlow: 'column wrap',
    },
    item: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      border: `1px solid ${theme.palette.uxGrey.border}`,
      borderRadius: 10,
      minHeight: 100,
      padding: theme.spacing(3, 2),
      marginBottom: theme.spacing(1.5),
    },
  }),
);

const AccountPreferences: React.FC = () => {
  const classes = useStyles();
  const dispatch = useDispatch();

  const tenantAccount = useSelector(selectTenantAccount);
  const { settings, country, businessProfile } = tenantAccount || {};
  const { features, integrationSettings, convenienceFees: convenienceFeeRates } = settings || {};
  const { payments, paymentRequests, customEmailSettings, customers } = features || {};
  const { paymentReminderEmails } = paymentRequests || {};
  const { convenienceFees } = payments || {};
  const { creditCardRateBps, debitCardRateBps, maxCreditConvenienceFee, maxDebitConvenienceFee } = convenienceFeeRates || {};
  const { enabled: isCustomerEnabled } = customers || {};

  const viewerUser = useSelector(selectViewerUser);
  const networkBusy = useSelector(selectNetworkBusy);

  const tenantAccountEmailSettingsRequestInFlight = useSelector(selectUpdateTenantAccountEmailSettingsRequestInFlight);
  const tenantAccountEmailSettingsStatus = useSelector(selectTenantAccountEmailSettingsStatus);
  const paymentReminderSettingsRequestInFlight = useSelector(selectUpdatePaymentReminderRequestInFlight);
  const paymentReminderSettingsStatus = useSelector(selectUpdatePaymentReminderStatus);
  const integrationSettingsRequestInFlight = useSelector(selectIntegrationSettingsRequestInFlight);
  const updateIntegrationSettingsStatus = useSelector(selectUpdateIntegrationSettingsStatus);
  const convenienceFeesUpdateError = useSelector(selectUpdateConvenienceFeesError);
  const tenantCustomEmailSettingsError = useSelector(selectTenantCustomEmailSettingsError);
  const sendTestEmailInFlight = useSelector(selectSendTestEmailInFlight);
  const sendTestEmailError = useSelector(selectSendTestEmailError);
  const sendTestEmailStatus = useSelector(selectSendTestEmailStatus);

  const clearIntegrationSettingsStatus = () => {
    dispatch(captureUpdateIntegrationSettingsStatus(undefined));
  };
  const clearPaymentReminderSettingsStatus = () => {
    dispatch(captureUpdatePaymentReminderSettingsStatus(undefined));
  };
  const clearTenantAccountEmailSettingsStatus = () => {
    dispatch(captureUpdateTenantAccountEmailSettingsStatus(undefined));
  };

  const handleUpdateIntegrationSettings = (
    manualChecked: boolean,
    processUnsentCommunications: boolean,
    previewChecked: boolean,
    previewEmail: string,
  ) => {
    const input: UpdateIntegrationSettingsInput = {
      mode: manualChecked ? IntegrationMode.Manual : IntegrationMode.Automatic,
      processUnsentCommunications,
      previewSettings: {
        enabled: previewChecked,
        email: previewEmail,
      },
    };
    dispatch(updateIntegrationSettings(input));
  };
  const handleUpdatePaymentReminderSettings = (
    sendDueDateReminder: boolean,
    sendOverdueReminder: boolean,
    dueDateReminderDays?: number,
    overdueReminderDays?: number,
    reminderMessage?: string,
    overdueReminderMessage?: string,
  ) => {
    const input: UpdatePaymentReminderSettingsInput = {
      sendDueDateReminder,
      sendOverdueReminder,
      dueDateReminderDays,
      overdueReminderDays,
      reminderMessage,
      overdueReminderMessage,
    };
    dispatch(updatePaymentReminderSettings(input));
  };

  const handleUpdateTenantAccountEmailSettings = (
    enabled?: boolean,
    profile?: TenantAccountEmailSettingsProfileInput,
    paymentRequestDefaultText?: string,
  ) => {
    const input: UpdateTenantAccountEmailSettingsInput = {
      enabled,
      profile,
      paymentRequestDefaultText,
    };
    dispatch(updateTenantAccountEmailSettings(input));
  };

  const onConvenienceFeesUpdate = (input: UpdateConvenienceFeesInput) => {
    dispatch(updateConvenienceFees(input));
  };

  useEffect(() => {
    if (convenienceFeesUpdateError) {
      setTimeout(() => {
        dispatch(clearUpdateConvenienceFeesError());
      }, 5000);
    }

    if (updateIntegrationSettingsStatus?.error) {
      setTimeout(() => {
        clearIntegrationSettingsStatus();
      }, 5000);
    }

    if (tenantAccountEmailSettingsStatus?.error) {
      setTimeout(clearTenantAccountEmailSettingsStatus, 5000);
    }
  }, [convenienceFeesUpdateError, updateIntegrationSettingsStatus]);

  const arePaymentSettingsEnabled = () => {
    const { mode, previewSettings } = integrationSettings || {};
    const { enabled: previewEnabled } = previewSettings || {};
    return mode === IntegrationMode.Manual || !!previewEnabled;
  };

  const areConvenienceFeesEnabled = () => {
    return country && country?.toUpperCase() === 'US' && convenienceFees;
  };

  const clearTenantCustomEmailSetingsError = () => {
    dispatch(captureTenantCustomEmailSettingsError(undefined));
  };

  const handleSendTestEmail = (email: string) => {
    if (email) {
      dispatch(fetchSendTestEmail(email));
    }
  };

  const clearSendTestEmailStatusAndError = () => {
    if (sendTestEmailStatus) {
      dispatch(captureSendTestEmailStatus(undefined));
    }
    if (sendTestEmailError) {
      dispatch(captureSendTestEmailError(undefined));
    }
  };

  return (
    <Paper className={classes.root} role="region" aria-label="Account Preferences">
      <Helmet>
        <meta name="ai:viewId" content="account-preferences"></meta>
        <meta name="ai:viewDescription" content="Aptean Pay Merchant Portal - Account Preferences"></meta>
        <title>Aptean Pay Merchant Portal - Account Preferences</title>
      </Helmet>
      <Box className={classes.header}>
        <Typography variant="title">Account Preferences</Typography>
      </Box>
      <Divider />
      <Grid className={classes.grid} container spacing={3}>
        <Grid
          item
          container
          xs={12}
          lg={!areConvenienceFeesEnabled() && !paymentReminderEmails && !customEmailSettings?.enabled ? 12 : 6}
        >
          {/* Flex items have a default order value of 0, therefore items with an integer value greater than 0 will be displayed after any items that have not been given an explicit order value */}
          <Box className={classes.item} order={!arePaymentSettingsEnabled() ? 1 : undefined}>
            <PaymentRequestIntegrationSettings
              networkBusy={networkBusy}
              viewerAppRole={viewerUser?.relationship?.role}
              updateIntegrationSettings={handleUpdateIntegrationSettings}
              integrationSettingsRequestInFlight={integrationSettingsRequestInFlight}
              integrationSettingsStatus={updateIntegrationSettingsStatus}
              clearIntegrationSettingsStatus={clearIntegrationSettingsStatus}
            />
          </Box>
        </Grid>
        {areConvenienceFeesEnabled() && (
          <Grid item container xs={12} lg={6}>
            <Box className={classes.item}>
              <ConvenienceFeesSettings
                networkBusy={networkBusy}
                viewerAppRole={viewerUser?.relationship?.role}
                updateConvenienceFees={onConvenienceFeesUpdate}
                creditCardRate={creditCardRateBps || 0}
                debitCardRate={debitCardRateBps || 0}
                maxCreditConvenienceFee={(maxCreditConvenienceFee || 0) / 100}
                maxDebitConvenienceFee={(maxDebitConvenienceFee || 0) / 100}
                isCustomerEnabled={isCustomerEnabled}
              />
            </Box>
          </Grid>
        )}
        {tenantAccount && paymentReminderEmails && (
          <Grid item container xs={12} lg={6}>
            <Box className={classes.item}>
              <PaymentReminderPreferences
                networkBusy={networkBusy}
                tenantAccount={tenantAccount}
                viewerAppRole={viewerUser?.relationship?.role}
                merchantName={businessProfile?.name}
                logoUrl={businessProfile?.logoUrl || ''}
                updatePaymentReminderSettings={handleUpdatePaymentReminderSettings}
                paymentReminderSettingsRequestInFlight={paymentReminderSettingsRequestInFlight}
                paymentReminderSettingsStatus={paymentReminderSettingsStatus}
                clearPaymentReminderSettingsStatus={clearPaymentReminderSettingsStatus}
              />
            </Box>
          </Grid>
        )}
        {tenantAccount && customEmailSettings && customEmailSettings.enabled && (
          <Grid item container xs={12} lg={6}>
            <Box className={classes.item}>
              <TenantAccountEmailSettings
                networkBusy={networkBusy}
                tenantAccount={tenantAccount}
                viewerAppRole={viewerUser?.relationship?.role}
                update={handleUpdateTenantAccountEmailSettings}
                requestInFlight={tenantAccountEmailSettingsRequestInFlight}
                status={tenantAccountEmailSettingsStatus}
                clearStatus={clearTenantAccountEmailSettingsStatus}
                sendTestEmailInFlight={sendTestEmailInFlight}
                sendTestEmailError={sendTestEmailError}
                sendTestEmailStatus={sendTestEmailStatus}
                handleSendTestEmail={handleSendTestEmail}
                clearSendTestEmailStatusAndError={clearSendTestEmailStatusAndError}
              />
            </Box>
          </Grid>
        )}
        {/* convenience fee error */}
        <AccountPreferenceErrorSnackBar open={!!convenienceFeesUpdateError || !!updateIntegrationSettingsStatus?.error} />
        {/* custom email settings error */}
        <AccountPreferenceErrorSnackBar
          open={!!tenantCustomEmailSettingsError}
          message={tenantCustomEmailSettingsError?.message}
          onClose={clearTenantCustomEmailSetingsError}
        />
      </Grid>
    </Paper>
  );
};

export default AccountPreferences;
