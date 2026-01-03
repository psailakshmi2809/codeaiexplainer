import { Grid, Theme, Typography, Button, Switch, FormControlLabel, TextField, useMediaQuery, useTheme } from '@mui/material';
import { createStyles, makeStyles } from '@mui/styles';
import React, { ChangeEvent, useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectTenantAccount } from '../features/app/AppSlice';
import { AppRole, IntegrationMode, MutationStatusCode, UpdateIntegrationSettingsStatus } from '../gql-types.generated';
import EditIcon from '@mui/icons-material/Edit';
import DoneIcon from '@mui/icons-material/Done';
import CloseIcon from '@mui/icons-material/Close';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      flexFlow: 'nowrap',
    },
    headerContainer: {
      marginBottom: theme.spacing(2),
    },
    divider: {
      width: '100%',
    },
    chipContainer: {
      display: 'flex',
    },
    switchContainer: {
      display: 'flex',
      marginBottom: theme.spacing(1),
      paddingLeft: theme.spacing(0.5),
    },
    helperText: {
      marginTop: theme.spacing(1),
    },
    infoIcon: {
      marginRight: theme.spacing(1),
      fontSize: '20px',
    },
    statusIcon: {
      marginRight: theme.spacing(0.5),
    },
    buttonAction: {
      margin: theme.spacing(1),
    },
    gridItem: {
      margin: theme.spacing(1, 0),
    },
    name: {
      letterSpacing: 1.5,
    },
    errorText: {
      color: theme.palette.error.main,
    },
    halfWidth: {
      width: '50%',
    },
    fullWidth: {
      width: '100%',
    },
    defaultPointer: {
      pointer: 'default',
    },
    header: {
      maxWidth: 'calc(100% - 76px)',
    },
    editContainer: {
      width: '76px',
      marginRight: theme.spacing(1),
    },
  }),
);

interface PaymentRequestIntegrationSettingsProps {
  networkBusy: boolean;
  viewerAppRole: AppRole | undefined;
  updateIntegrationSettings: (
    manualChecked: boolean,
    processUnsentEmailsChecked: boolean,
    previewChecked: boolean,
    previewEmail: string,
  ) => void;
  integrationSettingsRequestInFlight: boolean;
  integrationSettingsStatus?: UpdateIntegrationSettingsStatus;
  clearIntegrationSettingsStatus: () => void;
}

const PaymentRequestIntegrationSettings: React.FC<PaymentRequestIntegrationSettingsProps> = props => {
  const classes = useStyles();
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.down('xs'));
  const {
    viewerAppRole,
    updateIntegrationSettings,
    networkBusy,
    integrationSettingsRequestInFlight,
    integrationSettingsStatus,
    clearIntegrationSettingsStatus,
  } = props;

  const tenantAccount = useSelector(selectTenantAccount);
  const { settings } = tenantAccount || {};
  const { integrationSettings } = settings || {};
  const { mode, processUnsentCommunications, previewSettings } = integrationSettings || {};
  const { enabled: previewEnabled, email: previewEmail } = previewSettings || {};
  const isManualSelectedByDefault = mode === IntegrationMode.Manual;
  const canUserEdit = viewerAppRole === AppRole.Admin;

  const [manualChecked, setManualChecked] = useState<boolean>(isManualSelectedByDefault);
  const [modifyIntegrationMode, setModifyIntegrationMode] = useState<boolean>(false);
  const [processUnsentEmailsChecked, setProcessUnsentEmailsChecked] = useState<boolean>(!!processUnsentCommunications);
  const [previewChecked, setPreviewChecked] = useState<boolean>(previewEnabled || false);
  const [emailPreview, setEmailPreview] = useState<string>(previewEmail || '');
  const [isValidPreviewEmail, setIsValidPreviewEmail] = useState<boolean>(true);

  const validateEmail = (email: string) => {
    if (!email) return false;

    const emailFormat = RegExp(/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/);
    return !!emailFormat.test(email);
  };

  const resetValues = () => {
    setManualChecked(isManualSelectedByDefault);
    setProcessUnsentEmailsChecked(!!processUnsentCommunications);
    setModifyIntegrationMode(false);
    setPreviewChecked(previewEnabled || false);
    setEmailPreview(previewEmail || '');
    setIsValidPreviewEmail(validateEmail(previewEmail || ''));
  };

  useEffect(() => {
    if (integrationSettingsStatus?.code === MutationStatusCode.Success) {
      clearIntegrationSettingsStatus();
      setModifyIntegrationMode(false);
    }
  }, [integrationSettingsStatus]);

  useEffect(() => {
    resetValues();
  }, [tenantAccount]);

  const onPreviewChange = (e: ChangeEvent<HTMLInputElement>) => setPreviewChecked(e.target.checked);
  const onModeChange = (e: ChangeEvent<HTMLInputElement>) => setManualChecked(e.target.checked);
  const onProcessEmailsChange = (e: ChangeEvent<HTMLInputElement>) => setProcessUnsentEmailsChecked(e.target.checked);
  const openIntegrationModeDialog = () => setModifyIntegrationMode(true);

  const handleSaveIntegrationSettings = () => {
    const isValidEmail = validateEmail(emailPreview);
    if (isValidEmail) {
      updateIntegrationSettings(manualChecked, processUnsentEmailsChecked, previewChecked, emailPreview);
    }
  };

  const inLoadingState = integrationSettingsRequestInFlight || networkBusy;
  const isSaveDisabled =
    inLoadingState ||
    !isValidPreviewEmail ||
    (processUnsentCommunications === processUnsentEmailsChecked &&
      manualChecked === isManualSelectedByDefault &&
      emailPreview === previewEmail &&
      previewChecked === previewEnabled);

  const handlePreviewTextChange = (event: ChangeEvent<HTMLInputElement>) => {
    const email = event.target.value.trim();
    setEmailPreview(email);
    setIsValidPreviewEmail(validateEmail(email));
  };

  const getFeatureChip = (enabled: boolean) =>
    enabled ? (
      <>
        <DoneIcon className={classes.statusIcon} fontSize="small" color="success" />
        <Typography variant="body1">Enabled</Typography>
      </>
    ) : (
      <>
        <CloseIcon className={classes.statusIcon} fontSize="small" color="error" />
        <Typography variant="body1">Disabled</Typography>
      </>
    );

  const settingsPreview = () => {
    let emailVal = previewEmail || 'Please Add Preview Email.';
    emailVal = !previewEmail && !canUserEdit ? 'Please ask Admin User to Add Preview Email.' : emailVal;

    return (
      <Grid container item xs={12} md={10} lg={9} tabIndex={0}>
        {/* mode */}
        <Grid container item xs={12} className={classes.gridItem} justifyContent="center">
          <Grid item xs={12} sm={6} lg={4}>
            <Typography variant="button" className={classes.name}>
              Send Requests Manually
            </Typography>
          </Grid>
          <Grid item container xs={12} sm={6} lg={8}>
            <Grid className={classes.chipContainer} item xs={12}>
              {getFeatureChip(manualChecked)}
            </Grid>
          </Grid>
        </Grid>

        {/* preview enabled */}
        <Grid container item xs={12} className={classes.gridItem} justifyContent="center">
          <Grid item xs={12} sm={6} lg={4}>
            <Typography variant="button" className={classes.name}>
              Preview Payment Request
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6} lg={8}>
            <Grid className={classes.chipContainer} item xs={12}>
              {getFeatureChip(!!previewEnabled)}
            </Grid>
          </Grid>
        </Grid>

        {/* preview email */}
        <Grid container item xs={12} className={classes.gridItem} justifyContent="center">
          <Grid item xs={12} sm={6} lg={4}>
            <Typography variant="button" className={classes.name}>
              Preview Email Address
            </Typography>
          </Grid>
          <Grid container item xs={12} sm={6} lg={8}>
            <Grid item xs={12} className={!previewEmail ? classes.errorText : undefined}>
              <Typography color="primary" variant="body1">
                {emailVal}
              </Typography>
            </Grid>
          </Grid>
        </Grid>

        {/* send email option when turning off flags */}
        <Grid container item xs={12} className={classes.gridItem} justifyContent="center">
          <Grid item xs={12} sm={6} lg={4}>
            <Typography variant="button" className={classes.name}>
              Send Unsent Communications
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6} lg={8}>
            <Grid className={classes.chipContainer} item xs={12}>
              {getFeatureChip(!!processUnsentCommunications)}
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    );
  };

  const settingsEdit = () => {
    return (
      <Grid container item xs={12}>
        <Grid container item xs={12} md={10} lg={9}>
          {/* mode */}
          <Grid container item xs={12} className={classes.gridItem} justifyContent="center">
            <Grid item xs={12} sm={6} lg={4}>
              <Typography variant="button" className={classes.name}>
                Send Requests Manually
              </Typography>
            </Grid>
            <Grid container item xs={12} sm={6} lg={8}>
              <Grid className={classes.switchContainer} item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      color="primary"
                      onChange={onModeChange}
                      checked={manualChecked}
                      disabled={inLoadingState}
                      size="small"
                      inputProps={{ 'aria-label': 'Payment request integration mode switch' }}
                      autoFocus
                    />
                  }
                  label={<Typography variant="body1">Enabled</Typography>}
                />
              </Grid>
            </Grid>
          </Grid>
          {/* preview enabled */}
          <Grid container item xs={12} className={classes.gridItem} justifyContent="center">
            <Grid item xs={12} sm={6} lg={4}>
              <Typography variant="button" className={classes.name}>
                Preview Payment Request
              </Typography>
            </Grid>
            <Grid container item xs={12} sm={6} lg={8}>
              <Grid className={classes.switchContainer} item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      color="primary"
                      onChange={onPreviewChange}
                      checked={previewChecked}
                      disabled={inLoadingState}
                      size="small"
                      inputProps={{ 'aria-label': 'Preview switch' }}
                    />
                  }
                  label={<Typography variant="body1">Enabled</Typography>}
                />
              </Grid>
            </Grid>
          </Grid>

          {/* preview email */}
          <Grid container item xs={12} className={classes.gridItem} justifyContent="center">
            <Grid item xs={12} sm={6} lg={4}>
              <Typography variant="button" className={classes.name}>
                Preview Email Address
              </Typography>
            </Grid>
            <Grid container item xs={12} sm={6} lg={8}>
              <TextField
                size="small"
                type="email"
                variant="outlined"
                fullWidth
                value={emailPreview}
                onChange={handlePreviewTextChange}
                error={!isValidPreviewEmail}
                disabled={inLoadingState}
                className={matches ? classes.fullWidth : classes.halfWidth}
                helperText={
                  !isValidPreviewEmail && (
                    <Typography color="error" variant="caption" data-cy="error-message">
                      {!emailPreview ? 'This field cannot be left blank.' : 'Invalid email.'}
                    </Typography>
                  )
                }
                inputProps={{
                  'aria-label': 'preview email address',
                  'aria-describedby': `${isValidPreviewEmail ? undefined : 'preview-email-helpertext-id'}`,
                }}
                FormHelperTextProps={{ id: 'preview-email-helpertext-id' }}
                data-cy="preview-email-input"
              />
            </Grid>
          </Grid>

          {/* send email option when turning off flags */}
          <Grid container item xs={12} className={classes.gridItem} justifyContent="center">
            <Grid item xs={12} sm={6} lg={4}>
              <Typography variant="button" className={classes.name}>
                Send Unsent Communications
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} lg={8}>
              <Grid className={classes.switchContainer} item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      color="primary"
                      onChange={onProcessEmailsChange}
                      checked={processUnsentEmailsChecked}
                      disabled={inLoadingState}
                      size="small"
                      inputProps={{
                        'aria-label': 'Send unsent Payment Request emails when disabling either Manual or Preview modes switch',
                      }}
                    />
                  }
                  label={<Typography variant="body1">Enabled</Typography>}
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        {/* edit option */}
        <Grid container item xs={12} justifyContent="flex-end">
          <Button size="small" className={classes.buttonAction} color="primary" onClick={resetValues} disabled={inLoadingState}>
            Cancel
          </Button>
          <Button
            size="small"
            className={classes.buttonAction}
            disabled={isSaveDisabled}
            color="primary"
            variant="contained"
            onClick={handleSaveIntegrationSettings}
          >
            Save
          </Button>
        </Grid>
      </Grid>
    );
  };

  return (
    <Grid
      container
      className={classes.root}
      data-cy="payment-request-integration-settings"
      aria-label="Payment Request Integration settings"
      role="region"
    >
      <Grid
        container
        item
        xs={12}
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        className={classes.headerContainer}
      >
        <Typography variant="subtitle" className={classes.header}>
          Payment Request Integration Settings
        </Typography>
        {canUserEdit && !modifyIntegrationMode && (
          <div className={classes.editContainer}>
            <Button
              startIcon={<EditIcon />}
              onClick={openIntegrationModeDialog}
              disabled={inLoadingState}
              size="small"
              color="primary"
              variant="outlined"
              aria-label="Edit payment request integration settings"
            >
              EDIT
            </Button>
          </div>
        )}
        <Grid item className={classes.helperText} xs={12}>
          <Typography variant="body1">
            Decide when payment request communications are sent to payers. When Send Requests Manually is enabled, payment request
            communications are not sent to payers automatically. When Preview Payment Request is enabled, payment request emails will
            be sent to your preview email address. When disabling either mode, Send Unsent Communications will send all outstanding
            communications.
          </Typography>
        </Grid>
      </Grid>
      <Grid container>{modifyIntegrationMode ? settingsEdit() : settingsPreview()}</Grid>
    </Grid>
  );
};

export default PaymentRequestIntegrationSettings;
