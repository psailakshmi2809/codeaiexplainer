import {
  Grid,
  Theme,
  Typography,
  Button,
  Switch,
  FormControlLabel,
  TextField,
  Select,
  SelectChangeEvent,
  IconButton,
  InputAdornment,
  Divider,
  Popover,
} from '@mui/material';
import { createStyles, makeStyles } from '@mui/styles';
import React, { MouseEvent, ChangeEvent, useEffect, useState } from 'react';
import DoneIcon from '@mui/icons-material/Done';
import CloseIcon from '@mui/icons-material/Close';
import {
  AppRole,
  MutationStatusCode,
  SecurityType,
  SendTestEmailStatus,
  TenantAccount,
  TenantAccountEmailSettingsProfile,
  TenantAccountEmailSettingsProfileInput,
  UpdateTenantAccountEmailSettingsStatus,
} from '../gql-types.generated';
import EditIcon from '@mui/icons-material/Edit';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { validateFromEmail, validateIsEmptyString, validatePort } from '../util/TenantAccountEmailPreferencesValidators';
import { checkIsEmailValid } from '../util/PaymentVirtualTerminalValidators';
import LoadingMask from './LoadingMask';
import ErrorIcon from '@mui/icons-material/Error';

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
    defaultTextField: {
      marginTop: theme.spacing(1),
    },
    sendTextContainer: {
      marginBottom: theme.spacing(1),
    },
    statusIcon: {
      marginRight: theme.spacing(0.5),
    },
    buttonAction: {
      margin: theme.spacing(1),
    },
    name: {
      letterSpacing: 1.5,
    },
    fullWidth: {
      width: '100%',
    },
    header: {
      maxWidth: 'calc(100% - 76px)',
    },
    editContainer: {
      width: '76px',
      marginRight: theme.spacing(1),
    },
    divider: {
      width: '100%',
      marginBottom: theme.spacing(2),
      marginTop: theme.spacing(1),
    },
    containerGrid: {
      minWidth: 300,
      maxWidth: 400,
      overflowY: 'hidden',
      padding: theme.spacing(2),
      position: 'relative',
    },
    cancelButton: {
      marginRight: theme.spacing(1),
    },
    textMargin: {
      marginBottom: theme.spacing(1),
    },
    dialogContextError: {
      backgroundColor: theme.palette.error.light,
      color: theme.palette.error.main,
      fontWeight: 500,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: theme.spacing(0, 0, 0.5, 0),
      margin: theme.spacing(0, -2),
      width: 'calc(100% + 32px)',
      fontSize: '12px',
    },
    errorIcon: {
      marginRight: 4,
      fontSize: '20px',
    },
  }),
);

interface TenantAccountEmailPreferencesProps {
  networkBusy: boolean;
  viewerAppRole: AppRole | undefined;
  update: (enabled?: boolean, profile?: TenantAccountEmailSettingsProfileInput, paymentRequestDefaultText?: string) => void;
  tenantAccount: TenantAccount;
  merchantName?: string;
  logoUrl?: string;
  requestInFlight: boolean;
  status?: UpdateTenantAccountEmailSettingsStatus;
  clearStatus: () => void;
  sendTestEmailInFlight: boolean;
  sendTestEmailError?: Error;
  sendTestEmailStatus?: SendTestEmailStatus;
  handleSendTestEmail: (email: string) => void;
  clearSendTestEmailStatusAndError: () => void;
}

const TenantAccountEmailPreferences: React.FC<TenantAccountEmailPreferencesProps> = props => {
  const classes = useStyles();
  const {
    viewerAppRole,
    update,
    networkBusy,
    tenantAccount,
    requestInFlight,
    status,
    clearStatus,
    sendTestEmailInFlight,
    sendTestEmailError,
    sendTestEmailStatus,
    handleSendTestEmail,
    clearSendTestEmailStatusAndError,
  } = props;
  const { settings } = tenantAccount || {};
  const canUserEdit = viewerAppRole === AppRole.Admin;
  const canUserSend = canUserEdit || viewerAppRole === AppRole.Editor;
  const inLoadingState = requestInFlight || networkBusy;
  const [editEnabled, setEditEnabled] = useState<boolean>(false);
  const [editDefaultTextEnabled, setEditDefaultTextEnabled] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [enabled, setEnabled] = useState<boolean>(!!settings?.customEmailSettings?.enabled);
  const [from, setFrom] = useState<string | undefined>(settings?.customEmailSettings?.profile?.from);
  const [host, setHost] = useState<string | undefined>(settings?.customEmailSettings?.profile?.host);
  const [port, setPort] = useState<number | undefined>(settings?.customEmailSettings?.profile?.port);
  const [username, setUsername] = useState<string | undefined>(settings?.customEmailSettings?.profile?.username);
  // Password is not stored server side, but a value of * will be provied.
  const [password, setPassword] = useState<string>(settings?.customEmailSettings?.profile?.password || '');
  const [securityType, setSecurityType] = useState<string>(settings?.customEmailSettings?.profile?.securityType || '');
  const [paymentRequestDefaultText, setPaymentRequestDefaultText] = useState<string>(
    settings?.customEmailSettings?.paymentRequestDefaultText || '',
  );
  const [isFromInvalid, setIsFromInvalid] = useState<boolean>(false);
  const [isHostInvalid, setIsHostInvalid] = useState<boolean>(false);
  const [isPortInvalid, setIsPortInvalid] = useState<boolean>(false);
  const [isUsernameInvalid, setIsUsernameInvalid] = useState<boolean>(false);
  const [isPasswordInvalid, setIsPasswordInvalid] = useState<boolean>(false);
  const [isSecurityTypeInvalid, setIsSecurityTypeInvalid] = useState<boolean>(false);
  const [sendEmailAnchorEl, setSendEmailAnchorEl] = useState<HTMLButtonElement | null>();
  const [sendEmailValue, setSendEmailValue] = useState<string>('');
  const [sendEmailValid, setSendEmailValid] = useState<boolean>(true);
  const [isSaveDefaultTextDisabled, setIsSaveDefaultTextDisabled] = useState(true);
  const isSaveDisabled =
    enabled &&
    (inLoadingState ||
      isPortInvalid ||
      isHostInvalid ||
      isFromInvalid ||
      isUsernameInvalid ||
      isPasswordInvalid ||
      isSecurityTypeInvalid);

  const clearEmptyStates = () => {
    setIsFromInvalid(false);
    setIsPortInvalid(false);
    setIsHostInvalid(false);
    setIsUsernameInvalid(false);
    setIsPasswordInvalid(false);
    setIsSecurityTypeInvalid(false);
    setSendEmailAnchorEl(null);
    setSendEmailValid(true);
    setSendEmailValue('');
    clearSendTestEmailStatusAndError();
  };

  const onEnableChange = () => {
    setEnabled(!enabled);
  };

  const handleModifyClick = () => {
    if (canUserEdit) {
      if (!editEnabled) {
        // Clear password if user wants to edit.
        setPassword('');
      }
      setEditEnabled(!editEnabled);
      clearEmptyStates();
    }
  };

  const handleModifyDefaultTextClick = () => {
    if (canUserEdit) {
      setEditDefaultTextEnabled(!editDefaultTextEnabled);
    }
  };

  const handleMouseDownInput = (event: MouseEvent) => {
    event.preventDefault();
  };

  const handleFromChange = (e: ChangeEvent<HTMLInputElement>) => {
    const emailValue = e.target.value.trim();
    setIsFromInvalid(validateFromEmail(emailValue));
    setFrom(emailValue);
  };

  const handleHostChange = (e: ChangeEvent<HTMLInputElement>) => {
    const hostValue = e.target.value.trim();
    setIsHostInvalid(validateIsEmptyString(hostValue));
    setHost(hostValue);
  };

  const handlePortChange = (e: ChangeEvent<HTMLInputElement>) => {
    const portValue = parseInt(e.target.value);
    setIsPortInvalid(validatePort(portValue));
    setPort(portValue);
  };

  const handleUsernameChange = (e: ChangeEvent<HTMLInputElement>) => {
    const usernameValue = e.target.value;
    setIsUsernameInvalid(validateIsEmptyString(usernameValue));
    setUsername(usernameValue);
  };

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    const passwordValue = e.target.value;
    setIsPasswordInvalid(validateIsEmptyString(passwordValue));
    setPassword(passwordValue);
  };

  const handleSecurityTypeChange = (e: SelectChangeEvent<SecurityType>) => {
    const securityValue = e.target.value;
    setIsSecurityTypeInvalid(validateIsEmptyString(securityValue));
    setSecurityType(securityValue as SecurityType);
  };

  const handleDefaultTextChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setIsSaveDefaultTextDisabled(value === settings?.customEmailSettings?.paymentRequestDefaultText);
    setPaymentRequestDefaultText(value);
  };
  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const resetValues = () => {
    // Set values to their saved state
    setEnabled(!!settings?.customEmailSettings?.enabled);
    setFrom(settings?.customEmailSettings?.profile?.from);
    setHost(settings?.customEmailSettings?.profile?.host);
    setPort(settings?.customEmailSettings?.profile?.port);
    setUsername(settings?.customEmailSettings?.profile?.username);
    setPassword(settings?.customEmailSettings?.profile?.password || '');
    setSecurityType(settings?.customEmailSettings?.profile?.securityType || '');
    setPaymentRequestDefaultText(settings?.customEmailSettings?.paymentRequestDefaultText || '');
    setShowPassword(false);
    clearStatus();
    setEditEnabled(false);
    setEditDefaultTextEnabled(false);
  };

  const cancelDefaultTextEdit = () => {
    // Set values to their saved state
    setPaymentRequestDefaultText(settings?.customEmailSettings?.paymentRequestDefaultText || '');
    setEditDefaultTextEnabled(false);
    setIsSaveDefaultTextDisabled(true);
  };

  const handleSave = () => {
    if (isSaveDisabled) {
      return;
    }

    const fromValue = from || '';
    const hostValue = host || '';
    let portValue = port || 0;
    const usernameValue = username || '';

    const isInvalidFrom = validateFromEmail(fromValue);
    const isInvalidHost = validateIsEmptyString(hostValue);
    const isInvalidPort = validatePort(portValue);
    if (isInvalidPort) portValue = 0;
    const isInvalidUsername = validateIsEmptyString(usernameValue);
    const isInvalidPassword = validateIsEmptyString(password);
    const isInvalidSecurityType = validateIsEmptyString(securityType);

    const saveDisabled =
      enabled &&
      (inLoadingState ||
        isInvalidFrom ||
        isInvalidHost ||
        isInvalidPort ||
        isInvalidUsername ||
        isInvalidPassword ||
        isInvalidSecurityType);

    if (!saveDisabled) {
      const profileInput = {
        port: portValue,
        host: hostValue,
        from: fromValue,
        username: usernameValue,
        password,
        securityType: securityType as SecurityType,
      } as TenantAccountEmailSettingsProfile;
      update(enabled, profileInput);
    } else {
      setIsFromInvalid(isInvalidFrom);
      setIsHostInvalid(isInvalidHost);
      setIsPortInvalid(isInvalidPort);
      setIsUsernameInvalid(isInvalidUsername);
      setIsPasswordInvalid(isInvalidPassword);
      setIsSecurityTypeInvalid(isInvalidSecurityType);
    }
  };

  const handleDefaultTextSave = () => {
    update(undefined, undefined, paymentRequestDefaultText);
  };

  const getFeatureChip = (isEnabled: boolean) =>
    isEnabled ? (
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

  useEffect(() => {
    if (!status?.error) {
      clearStatus();
      setEditEnabled(false);
    }
  }, [status]);

  useEffect(() => {
    setEditDefaultTextEnabled(false);
    setIsSaveDefaultTextDisabled(true);
  }, [settings?.customEmailSettings?.paymentRequestDefaultText]);

  useEffect(() => {
    resetValues();
  }, [tenantAccount]);

  useEffect(() => {
    resetValues();
    clearEmptyStates();
  }, []);

  const handleSendEmailOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (event?.currentTarget) {
      setSendEmailAnchorEl(event?.currentTarget);
    }
  };

  const handleSendEmailClose = () => {
    if (!sendTestEmailInFlight) {
      setSendEmailAnchorEl(null);
      setSendEmailValue('');
      setSendEmailValid(true);
      clearSendTestEmailStatusAndError();
    }
  };

  useEffect(() => {
    if (sendTestEmailStatus && sendTestEmailStatus.code !== MutationStatusCode.Error) {
      handleSendEmailClose();
    }
  }, [sendTestEmailInFlight]);

  const handleSendEmailValueChange = (event: ChangeEvent<HTMLInputElement>) => {
    const emailValue = event.target.value.trim();
    setSendEmailValid(checkIsEmailValid(emailValue));
    setSendEmailValue(emailValue);
  };

  const handleSendEmail = () => {
    const validSendEmail = checkIsEmailValid(sendEmailValue);
    if (validSendEmail) {
      handleSendTestEmail(sendEmailValue);
    } else {
      setSendEmailValid(false);
    }
  };

  return (
    <Grid
      container
      className={classes.root}
      data-cy="tenant-account-email-settings"
      aria-label="Tenant Account Email Settings"
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
          Custom Email Settings
        </Typography>
        {canUserEdit && !editEnabled && (
          <div className={classes.editContainer}>
            <Button
              startIcon={<EditIcon />}
              onClick={handleModifyClick}
              disabled={inLoadingState}
              size="small"
              color="primary"
              variant="outlined"
              aria-label="Edit tenant account email settings"
            >
              EDIT
            </Button>
          </div>
        )}
        <Grid item className={classes.helperText} xs={12}>
          <Typography variant="body1">
            {
              'To customize the email address your Payment Request and Receipts are sent from, enable the feature and fill out all SMTP settings below.'
            }
          </Typography>
        </Grid>
      </Grid>
      <Grid container item xs={12} md={10} lg={9} spacing={2} justifyContent="center">
        {/* Enabled Disable SMTP Settings */}
        <Grid item xs={12} sm={6} lg={4}>
          <Typography variant="button" className={classes.name}>
            SMTP Email Setup
          </Typography>
        </Grid>
        <Grid container item xs={12} sm={6} lg={8}>
          <Grid className={classes.switchContainer} item xs={12}>
            {!editEnabled && (
              <Grid className={classes.chipContainer} item xs={12}>
                {getFeatureChip(!!settings?.customEmailSettings?.enabled)}
              </Grid>
            )}
            {editEnabled && (
              <FormControlLabel
                control={
                  <Switch
                    color="primary"
                    onChange={onEnableChange}
                    checked={enabled}
                    disabled={inLoadingState}
                    size="small"
                    inputProps={{ 'aria-label': 'SMTP email settings enabled switch' }}
                    autoFocus
                  />
                }
                label={<Typography variant="body1">Enabled</Typography>}
              />
            )}
          </Grid>
        </Grid>
        {/* From Email "Sender email address" */}
        {enabled && (
          <>
            <Grid item xs={12} sm={6} lg={4}>
              <Typography variant="button" className={classes.name}>
                Sender Email Address
              </Typography>
            </Grid>
            <Grid container item xs={12} sm={6} lg={8}>
              <Grid className={classes.switchContainer} item xs={12}>
                {!editEnabled && <Typography variant="body1">{settings?.customEmailSettings?.profile?.from}</Typography>}
                {editEnabled && (
                  <TextField
                    size="small"
                    variant="outlined"
                    fullWidth
                    required
                    error={enabled && editEnabled && isFromInvalid}
                    value={from}
                    onChange={handleFromChange}
                    disabled={inLoadingState || !enabled}
                    className={classes.fullWidth}
                    inputProps={{
                      'aria-label': 'sender email address',
                    }}
                    helperText={enabled && editEnabled && isFromInvalid ? '*Please enter a valid Email Id.' : undefined}
                    FormHelperTextProps={{ id: 'sender-email-helpertext-id' }}
                    data-cy="sender-email-address-input"
                  />
                )}
              </Grid>
            </Grid>
            {/* Host STMP setting */}
            <Grid item xs={12} sm={6} lg={4}>
              <Typography variant="button" className={classes.name}>
                Host
              </Typography>
            </Grid>
            <Grid container item xs={12} sm={6} lg={8}>
              <Grid className={classes.switchContainer} item xs={12}>
                {!editEnabled && <Typography variant="body1">{settings?.customEmailSettings?.profile?.host}</Typography>}
                {editEnabled && (
                  <TextField
                    size="small"
                    variant="outlined"
                    fullWidth
                    required
                    error={enabled && editEnabled && isHostInvalid}
                    value={host}
                    onChange={handleHostChange}
                    disabled={inLoadingState || !enabled}
                    className={classes.fullWidth}
                    inputProps={{
                      'aria-label': 'smtp host',
                    }}
                    helperText={enabled && editEnabled && isHostInvalid ? '*Please enter a valid host name.' : undefined}
                    FormHelperTextProps={{ id: 'host-helpertext-id' }}
                    data-cy="smtp-host-input"
                  />
                )}
              </Grid>
            </Grid>
            {/* Port */}
            <Grid item xs={12} sm={6} lg={4}>
              <Typography variant="button" className={classes.name}>
                Port
              </Typography>
            </Grid>
            <Grid container item xs={12} sm={6} lg={8}>
              <Grid className={classes.switchContainer} item xs={12}>
                {!editEnabled && <Typography variant="body1">{settings?.customEmailSettings?.profile?.port}</Typography>}
                {editEnabled && (
                  <TextField
                    size="small"
                    variant="outlined"
                    fullWidth
                    type={'number'}
                    value={port}
                    required
                    error={enabled && editEnabled && isPortInvalid}
                    onChange={handlePortChange}
                    disabled={inLoadingState || !enabled}
                    className={classes.fullWidth}
                    inputProps={{
                      'aria-label': 'smtp port',
                    }}
                    helperText={enabled && editEnabled && isPortInvalid ? '*Please enter port value in range 1 - 65535.' : undefined}
                    FormHelperTextProps={{ id: 'port-helpertext-id' }}
                    data-cy="smtp-port-input"
                  />
                )}
              </Grid>
            </Grid>
            {/* Username */}
            <Grid item xs={12} sm={6} lg={4}>
              <Typography variant="button" className={classes.name}>
                Username
              </Typography>
            </Grid>
            <Grid container item xs={12} sm={6} lg={8}>
              <Grid className={classes.switchContainer} item xs={12}>
                {!editEnabled && <Typography variant="body1">{settings?.customEmailSettings?.profile?.username}</Typography>}
                {editEnabled && (
                  <TextField
                    size="small"
                    variant="outlined"
                    fullWidth
                    required
                    error={enabled && editEnabled && isUsernameInvalid}
                    value={username}
                    onChange={handleUsernameChange}
                    disabled={inLoadingState || !enabled}
                    className={classes.fullWidth}
                    inputProps={{
                      'aria-label': 'smtp username',
                    }}
                    helperText={enabled && editEnabled && isUsernameInvalid ? '*Please enter a valid username.' : undefined}
                    FormHelperTextProps={{ id: 'username-helpertext-id' }}
                    data-cy="smtp-username-input"
                  />
                )}
              </Grid>
            </Grid>
            {/* Password */}
            <Grid item xs={12} sm={6} lg={4}>
              <Typography variant="button" className={classes.name}>
                Password
              </Typography>
            </Grid>
            <Grid container item xs={12} sm={6} lg={8}>
              <Grid className={classes.switchContainer} item xs={12}>
                {!editEnabled && (
                  <Typography variant="body1">{settings?.customEmailSettings?.profile?.username ? '********' : ''}</Typography>
                )}
                {editEnabled && (
                  <TextField
                    size="small"
                    variant="outlined"
                    fullWidth
                    required
                    error={enabled && editEnabled && isPasswordInvalid}
                    value={password}
                    onChange={handlePasswordChange}
                    disabled={inLoadingState || !enabled}
                    className={classes.fullWidth}
                    type={showPassword ? 'text' : 'password'}
                    InputProps={{
                      'aria-label': 'smtp password',
                      endAdornment: enabled ? (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={handleClickShowPassword}
                            onMouseDown={handleMouseDownInput}
                            size="large"
                          >
                            {showPassword ? <Visibility /> : <VisibilityOff />}
                          </IconButton>
                        </InputAdornment>
                      ) : undefined,
                    }}
                    helperText={enabled && editEnabled && isPasswordInvalid ? '*Please enter a valid password.' : undefined}
                    FormHelperTextProps={{ id: 'password-helpertext-id' }}
                    data-cy="smtp-password-input"
                  />
                )}
              </Grid>
            </Grid>
            {/* Security Type */}
            <Grid item xs={12} sm={6} lg={4}>
              <Typography variant="button" className={classes.name}>
                Security Type
              </Typography>
            </Grid>
            <Grid container item xs={12} sm={6} lg={8}>
              <Grid className={classes.switchContainer} item xs={12}>
                {!editEnabled && <Typography variant="body1">{settings?.customEmailSettings?.profile?.securityType}</Typography>}
                {editEnabled && (
                  <Select
                    native
                    size="small"
                    variant="outlined"
                    fullWidth
                    required
                    error={enabled && editEnabled && isSecurityTypeInvalid}
                    value={securityType as SecurityType}
                    displayEmpty={true}
                    onChange={handleSecurityTypeChange}
                    disabled={inLoadingState || !enabled}
                    className={classes.fullWidth}
                    inputProps={{
                      'aria-label': 'smtp security type',
                    }}
                    data-cy="smtp-security-type-input"
                  >
                    <option key={0} value=""></option>
                    <option key={SecurityType.Tls} value={SecurityType.Tls}>
                      {SecurityType.Tls as string}
                    </option>
                    <option key={SecurityType.Ssl} value={SecurityType.Ssl}>
                      {SecurityType.Ssl as string}
                    </option>
                  </Select>
                )}
              </Grid>
            </Grid>
          </>
        )}
      </Grid>
      {/* Save / Cancel */}
      {editEnabled && (
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
            onClick={handleSave}
          >
            Save
          </Button>
        </Grid>
      )}
      {canUserSend && (
        <>
          <Divider className={classes.divider} orientation="horizontal" />
          <Grid item className={classes.sendTextContainer} container xs={12}>
            <Typography variant="subtitle" className={classes.textMargin}>
              Test Email Settings
            </Typography>
            <Typography variant="subtitle1" className={classes.textMargin}>
              Enter an email address to test whether the settings entered are correct. If the settings entered are correct, the email
              address entered will receive a test email from the outgoing email address. If the settings are not entered correctly, no
              email will be sent.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              size="small"
              onClick={event => {
                handleSendEmailOpen(event);
              }}
              disabled={editEnabled}
              data-cy="send-test-email"
            >
              Send Test Email
            </Button>
          </Grid>
          <Popover
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'left',
            }}
            transformOrigin={{
              vertical: 'bottom',
              horizontal: 'left',
            }}
            open={Boolean(sendEmailAnchorEl)}
            anchorEl={sendEmailAnchorEl}
            onClose={handleSendEmailClose}
          >
            <Grid container spacing={1} className={classes.containerGrid}>
              <LoadingMask loading={sendTestEmailInFlight} />
              {sendTestEmailError && (
                <Grid item className={classes.dialogContextError}>
                  <ErrorIcon className={classes.errorIcon} />
                  {sendTestEmailError?.message || 'Unable to send test email.'}
                </Grid>
              )}
              <Grid item xs={12}>
                <TextField
                  variant="outlined"
                  size="small"
                  label="Email"
                  fullWidth
                  value={sendEmailValue}
                  onChange={handleSendEmailValueChange}
                  error={!sendEmailValid}
                  helperText={!sendEmailValid ? 'Please enter a Valid Email.' : undefined}
                  autoFocus
                  inputProps={{
                    'aria-label': 'email',
                    'aria-describedby': `${sendEmailValid ? undefined : 'email-helpertext-id'}`,
                  }}
                  FormHelperTextProps={{ id: 'email-helpertext-id' }}
                  data-cy="email-input"
                />
              </Grid>
              <Grid container item xs={12} justifyContent="flex-end">
                <Button
                  variant="text"
                  size="small"
                  color="primary"
                  onClick={handleSendEmailClose}
                  disabled={sendTestEmailInFlight}
                  className={classes.cancelButton}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  size="small"
                  color="primary"
                  disabled={!sendEmailValid || sendTestEmailInFlight}
                  onClick={handleSendEmail}
                >
                  Send
                </Button>
              </Grid>
            </Grid>
          </Popover>
        </>
      )}
      {canUserEdit && (
        <>
          <Divider className={classes.divider} orientation="horizontal" />
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
              Custom Payment Request Settings
            </Typography>
            {canUserEdit && !editDefaultTextEnabled && (
              <div className={classes.editContainer}>
                <Button
                  startIcon={<EditIcon />}
                  onClick={handleModifyDefaultTextClick}
                  disabled={inLoadingState}
                  size="small"
                  color="primary"
                  variant="outlined"
                  aria-label="Edit payment request default text"
                  data-cy="edit-default-text"
                >
                  EDIT
                </Button>
              </div>
            )}
            <Grid item className={classes.helperText} xs={12}>
              <Typography variant="body1">
                {`Add custom text to all Payment Requests. This can be edited per individual Payment Request within the Payment Request's screen.`}
              </Typography>
            </Grid>
            <Grid item className={classes.defaultTextField} xs={12}>
              <TextField
                multiline
                rows={3}
                size="small"
                variant="outlined"
                fullWidth
                value={paymentRequestDefaultText}
                onChange={handleDefaultTextChange}
                disabled={inLoadingState || !editDefaultTextEnabled}
                className={classes.fullWidth}
                inputProps={{
                  'aria-label': 'payment request default text',
                  maxLength: 400,
                }}
                data-cy="payment-request-default-text"
              />
            </Grid>
          </Grid>
          {/* Save / Cancel */}
          {editDefaultTextEnabled && (
            <Grid container item xs={12} justifyContent="flex-end">
              <Button
                size="small"
                className={classes.buttonAction}
                color="primary"
                onClick={cancelDefaultTextEdit}
                disabled={inLoadingState}
                data-cy="cancel-edit-default-text"
              >
                Cancel
              </Button>
              <Button
                size="small"
                className={classes.buttonAction}
                disabled={isSaveDefaultTextDisabled}
                color="primary"
                variant="contained"
                onClick={handleDefaultTextSave}
                data-cy="save-default-text"
              >
                Save
              </Button>
            </Grid>
          )}
        </>
      )}
    </Grid>
  );
};

export default TenantAccountEmailPreferences;
