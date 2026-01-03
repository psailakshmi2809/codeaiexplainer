import { Grid, Theme, Typography, Button, Switch, FormControlLabel, TextField, Divider, FormLabel, Dialog } from '@mui/material';
import { createStyles, makeStyles } from '@mui/styles';
import React, { ChangeEvent, KeyboardEvent, useEffect, useState } from 'react';
import { AppRole, TenantAccount, UpdatePaymentReminderSettingsStatus } from '../gql-types.generated';
import EditIcon from '@mui/icons-material/Edit';
import DoneIcon from '@mui/icons-material/Done';
import CloseIcon from '@mui/icons-material/Close';
import PaymentReminderEmailPreview from './PaymentReminderEmailPreview';

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
      marginBottom: theme.spacing(2),
      marginTop: theme.spacing(1),
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
    dayLabel: {
      paddingLeft: theme.spacing(0.5),
      lineHeight: 2.5,
    },
    previewButton: {
      marginLeft: -16,
    },
    previewDialog: {
      borderRadius: 0,
    },
    wrappedText: {
      wordBreak: 'break-word',
    },
  }),
);

interface PaymentReminderPreferencesProps {
  networkBusy: boolean;
  viewerAppRole: AppRole | undefined;
  updatePaymentReminderSettings: (
    sendDueDateReminder: boolean,
    sendOverdueReminder: boolean,
    dueDateReminderDays?: number,
    overdueReminderDays?: number,
    reminderMessage?: string,
    overdueReminderMessage?: string,
  ) => void;
  tenantAccount: TenantAccount;
  merchantName?: string;
  logoUrl?: string;
  paymentReminderSettingsRequestInFlight: boolean;
  paymentReminderSettingsStatus?: UpdatePaymentReminderSettingsStatus;
  clearPaymentReminderSettingsStatus: () => void;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
const MAX_DAYS_LIMIT = 99;
// eslint-disable-next-line @typescript-eslint/naming-convention
const MAX_MESSAGE_LIMIT = 500;

const PaymentReminderPreferences: React.FC<PaymentReminderPreferencesProps> = props => {
  const classes = useStyles();
  const {
    viewerAppRole,
    updatePaymentReminderSettings,
    networkBusy,
    logoUrl,
    merchantName,
    tenantAccount,
    paymentReminderSettingsRequestInFlight,
    paymentReminderSettingsStatus,
    clearPaymentReminderSettingsStatus,
  } = props;
  const { settings } = tenantAccount || {};
  const { paymentReminders } = settings || {};
  const {
    dueDateReminderDays,
    overdueReminderDays,
    reminderMessage,
    overdueReminderMessage,
    sendDueDateReminder,
    sendOverdueReminder,
  } = paymentReminders || {};
  const canUserEdit = viewerAppRole === AppRole.Admin;
  const inLoadingState = paymentReminderSettingsRequestInFlight || networkBusy;
  const [modifyPaymentReminderSettings, setModifyPaymentReminderSettings] = useState<boolean>(false);
  const [editedSendDueDateReminder, setEditedSendDueDateReminder] = useState<boolean>(!!sendDueDateReminder);
  const [editedSendOverdueReminder, setEditedSendOverdueReminder] = useState<boolean>(!!sendOverdueReminder);
  const [editedDueDateReminderDays, setEditedDueDateReminderDays] = useState<number | undefined>(dueDateReminderDays || undefined);
  const [editedOverdueDateReminderDays, setEditedOverdueDateReminderDays] = useState<number | undefined>(
    overdueReminderDays || undefined,
  );
  const [editedReminderMessage, setEditedReminderMessage] = useState<string | undefined>(reminderMessage || undefined);
  const [editedOverdueReminderMessage, setEditedOverdueReminderMessage] = useState<string | undefined>(
    overdueReminderMessage || undefined,
  );

  const [isDueDateReminderDaysValid, setIsDueDateReminderDaysValid] = useState<boolean>(true);
  const [isOverdueDateReminderDaysValid, setIsOverdueDateReminderDaysValid] = useState<boolean>(true);
  const isSaveDisabled = inLoadingState || !isDueDateReminderDaysValid || !isOverdueDateReminderDaysValid;
  const [previewOpen, setPreviewOpen] = useState<boolean>(false);
  const [overduePreviewOpen, setOverduePreviewOpen] = useState<boolean>(false);

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => ['e', 'E', '+', '-'].includes(e.key) && e.preventDefault();

  const handleModifyClick = () => {
    if (canUserEdit) {
      setModifyPaymentReminderSettings(!modifyPaymentReminderSettings);
    }
  };
  useEffect(() => {
    if (!paymentReminderSettingsStatus?.error) {
      clearPaymentReminderSettingsStatus();
      setModifyPaymentReminderSettings(false);
    }
  }, [paymentReminderSettingsStatus]);

  const checkAreDaysValid = (days?: number) => {
    if (days !== undefined && days > 0 && days <= MAX_DAYS_LIMIT) return true;
    return false;
  };

  const resetValues = () => {
    setModifyPaymentReminderSettings(false);
    setEditedSendDueDateReminder(!!sendDueDateReminder);
    setEditedSendOverdueReminder(!!sendOverdueReminder);
    setEditedDueDateReminderDays(dueDateReminderDays || undefined);
    setEditedOverdueDateReminderDays(overdueReminderDays || undefined);
    setEditedReminderMessage(reminderMessage || undefined);
    setEditedOverdueReminderMessage(overdueReminderMessage || undefined);
    setIsDueDateReminderDaysValid(true);
    setIsOverdueDateReminderDaysValid(true);
  };
  useEffect(() => {
    resetValues();
  }, [tenantAccount]);

  const handleSavePaymentReminderSettings = () => {
    const validDueDays = editedSendDueDateReminder ? checkAreDaysValid(editedDueDateReminderDays || 0) : true;
    const validOverDueDays = editedSendOverdueReminder ? checkAreDaysValid(editedOverdueDateReminderDays || 0) : true;

    if (validDueDays && validOverDueDays) {
      updatePaymentReminderSettings(
        !!editedSendDueDateReminder,
        !!editedSendOverdueReminder,
        editedDueDateReminderDays || 0,
        editedOverdueDateReminderDays || 0,
        editedReminderMessage?.trim() || '',
        editedOverdueReminderMessage?.trim() || '',
      );
    } else {
      setIsDueDateReminderDaysValid(validDueDays);
      setIsOverdueDateReminderDaysValid(validOverDueDays);
    }
  };
  const closePreview = () => {
    setOverduePreviewOpen(false);
    setPreviewOpen(false);
  };

  const handleOverdueReminderMessageChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEditedOverdueReminderMessage(e.target.value);
  };
  const handleOverdueReminderDaysChange = (e: ChangeEvent<HTMLInputElement>) => {
    const days = e.target.value ? parseInt(e.target.value) : undefined;
    setEditedOverdueDateReminderDays(days);
    setIsOverdueDateReminderDaysValid(checkAreDaysValid(days));
  };
  const handleSendOverdueReminderChange = (e: ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    setEditedSendOverdueReminder(isChecked);
    if (!isChecked && !isOverdueDateReminderDaysValid) {
      setEditedOverdueDateReminderDays(overdueReminderDays || undefined);
      setIsOverdueDateReminderDaysValid(true);
    }
  };
  const handleReminderMessageChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEditedReminderMessage(e.target.value);
  };
  const handleReminderDaysChange = (e: ChangeEvent<HTMLInputElement>) => {
    const days = e.target.value ? parseInt(e.target.value) : undefined;
    setEditedDueDateReminderDays(days);
    setIsDueDateReminderDaysValid(checkAreDaysValid(days));
  };
  const onSendDueDateReminderChange = (e: ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    setEditedSendDueDateReminder(isChecked);
    if (!isChecked && !isDueDateReminderDaysValid) {
      setEditedDueDateReminderDays(dueDateReminderDays || undefined);
      setIsDueDateReminderDaysValid(true);
    }
  };
  const openPreviewReminderEmail = () => {
    setPreviewOpen(!previewOpen);
  };
  const openPreviewOverdueReminderEmail = () => {
    setOverduePreviewOpen(!overduePreviewOpen);
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
    return (
      <Grid container item xs={12} tabIndex={0}>
        <Grid container item xs={12} md={10} lg={9}>
          <Grid container item xs={12} className={classes.gridItem} justifyContent="center">
            <Grid item xs={12} sm={6} lg={4}>
              <Typography variant="button" className={classes.name}>
                Send Due Date Reminder
              </Typography>
            </Grid>
            <Grid item container xs={12} sm={6} lg={8}>
              <Grid className={classes.chipContainer} item xs={12}>
                {getFeatureChip(!!sendDueDateReminder)}
              </Grid>
            </Grid>
          </Grid>
          {sendDueDateReminder && (
            <>
              <Grid container item xs={12} className={classes.gridItem} justifyContent="center">
                <Grid item xs={12} sm={6} lg={4}>
                  <Typography variant="button" className={classes.name}>
                    Send Reminder
                  </Typography>
                </Grid>
                <Grid container item xs={12} sm={6} lg={8}>
                  <Grid item xs={12}>
                    <Typography color={!dueDateReminderDays ? 'primary' : ''} variant="body1">
                      {dueDateReminderDays ? `${dueDateReminderDays} day(s) before due date.` : 'Please set days before to remind.'}
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
              <Grid container item xs={12} className={classes.gridItem} justifyContent="center">
                <Grid item xs={12} sm={6} lg={4}>
                  <Typography variant="button" className={classes.name}>
                    Reminder Message
                  </Typography>
                </Grid>
                <Grid container item xs={12} sm={6} lg={8}>
                  <Grid item xs={12}>
                    <Typography color={!reminderMessage ? 'primary' : ''} variant="body1" className={classes.wrappedText}>
                      {reminderMessage || 'Please set reminder message.'}
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
              <Grid container item xs={12} className={classes.gridItem} justifyContent="center" alignContent="end">
                <Grid item xs={12} sm={6} lg={4}>
                  <Typography variant="button" className={classes.name}></Typography>
                </Grid>
                <Grid item xs={12} sm={6} lg={8}>
                  <Button
                    onClick={openPreviewReminderEmail}
                    disabled={inLoadingState}
                    size="small"
                    color="primary"
                    variant="text"
                    aria-label="preview reminder email"
                    className={classes.previewButton}
                  >
                    Preview Email
                  </Button>
                </Grid>
              </Grid>
            </>
          )}
        </Grid>
        <Divider className={classes.divider} orientation="horizontal" />
        <Grid container item xs={12} md={10} lg={9}>
          <Grid container item xs={12} className={classes.gridItem} justifyContent="center">
            <Grid item xs={12} sm={6} lg={4}>
              <Typography variant="button" className={classes.name}>
                Send Overdue Reminder
              </Typography>
            </Grid>
            <Grid item container xs={12} sm={6} lg={8}>
              <Grid className={classes.chipContainer} item xs={12}>
                {getFeatureChip(!!sendOverdueReminder)}
              </Grid>
            </Grid>
          </Grid>
          {/* preview email */}
          {sendOverdueReminder && (
            <>
              <Grid container item xs={12} className={classes.gridItem} justifyContent="center">
                <Grid item xs={12} sm={6} lg={4}>
                  <Typography variant="button" className={classes.name}>
                    Send Reminder
                  </Typography>
                </Grid>
                <Grid container item xs={12} sm={6} lg={8}>
                  <Grid item xs={12}>
                    <Typography color={!overdueReminderDays ? 'primary' : ''} variant="body1">
                      {overdueReminderDays ? `${overdueReminderDays} day(s) after due date.` : 'Please set days after to remind.'}
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
              {/* send email option when turning off flags */}
              <Grid container item xs={12} className={classes.gridItem} justifyContent="center">
                <Grid item xs={12} sm={6} lg={4}>
                  <Typography variant="button" className={classes.name}>
                    Reminder Message
                  </Typography>
                </Grid>
                <Grid container item xs={12} sm={6} lg={8}>
                  <Grid item xs={12}>
                    <Typography color={!overdueReminderMessage ? 'primary' : ''} variant="body1" className={classes.wrappedText}>
                      {overdueReminderMessage || 'Please set overdue reminder message.'}
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
              <Grid container item xs={12} className={classes.gridItem} justifyContent="center" alignContent="end">
                <Grid item xs={12} sm={6} lg={4}>
                  <Typography variant="button" className={classes.name}></Typography>
                </Grid>
                <Grid item xs={12} sm={6} lg={8}>
                  <Button
                    onClick={openPreviewOverdueReminderEmail}
                    disabled={inLoadingState}
                    size="small"
                    color="primary"
                    variant="text"
                    aria-label="preview overdue reminder email"
                    className={classes.previewButton}
                  >
                    Preview Email
                  </Button>
                </Grid>
              </Grid>
            </>
          )}
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
                Send Due Date Reminder
              </Typography>
            </Grid>
            <Grid container item xs={12} sm={6} lg={8}>
              <Grid className={classes.switchContainer} item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      color="primary"
                      onChange={onSendDueDateReminderChange}
                      checked={editedSendDueDateReminder}
                      disabled={inLoadingState}
                      size="small"
                      inputProps={{ 'aria-label': 'Payment request send reminder switch' }}
                      autoFocus
                    />
                  }
                  label={<Typography variant="body1">Enabled</Typography>}
                />
              </Grid>
            </Grid>
          </Grid>
          {editedSendDueDateReminder && (
            <>
              <Grid container item xs={12} className={classes.gridItem} justifyContent="center">
                <Grid item xs={12} sm={6} lg={4}>
                  <Typography variant="button" className={classes.name}>
                    Send Reminder
                  </Typography>
                </Grid>
                <Grid container item xs={12} sm={6} lg={8}>
                  <TextField
                    size="small"
                    type="number"
                    variant="outlined"
                    value={editedDueDateReminderDays}
                    onChange={handleReminderDaysChange}
                    disabled={inLoadingState || !editedSendDueDateReminder}
                    onKeyDown={onKeyDown}
                    error={!isDueDateReminderDaysValid}
                    helperText={!isDueDateReminderDaysValid ? 'Please enter value between 1-99' : undefined}
                    inputProps={{
                      'aria-label': 'reminder days',
                      'aria-describedby': `${
                        editedDueDateReminderDays === undefined && editedSendDueDateReminder
                          ? undefined
                          : 'due-reminder-days-helpertext-id'
                      }`,
                      min: 1,
                      max: MAX_DAYS_LIMIT,
                    }}
                    FormHelperTextProps={{ id: 'due-reminder-days-helpertext-id' }}
                    data-cy="due-reminder-days-input"
                  />
                  <FormLabel className={classes.dayLabel}>day(s) before due date.</FormLabel>
                </Grid>
              </Grid>
              <Grid container item xs={12} className={classes.gridItem} justifyContent="center">
                <Grid item xs={12} sm={6} lg={4}>
                  <Typography variant="button" className={classes.name}>
                    Reminder Message
                  </Typography>
                </Grid>
                <Grid container item xs={12} sm={6} lg={8}>
                  <TextField
                    size="small"
                    multiline
                    rows={4}
                    variant="outlined"
                    fullWidth
                    value={editedReminderMessage}
                    onChange={handleReminderMessageChange}
                    disabled={inLoadingState || !editedSendDueDateReminder}
                    className={classes.fullWidth}
                    inputProps={{
                      'aria-label': 'due reminder message',
                      'aria-describedby': `${editedReminderMessage ? undefined : 'due-reminder-message-helpertext-id'}`,
                      maxLength: MAX_MESSAGE_LIMIT,
                    }}
                    FormHelperTextProps={{ id: 'due-reminder-message-helpertext-id' }}
                    data-cy="due-reminder-message-input"
                  />
                </Grid>
                <Grid container item xs={12} className={classes.gridItem} justifyContent="center" alignContent="end">
                  <Grid item xs={12} sm={6} lg={4}>
                    <Typography variant="button" className={classes.name}></Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} lg={8}>
                    <Button
                      onClick={openPreviewReminderEmail}
                      disabled={inLoadingState}
                      size="small"
                      color="primary"
                      variant="text"
                      aria-label="Preview reminder email"
                      className={classes.previewButton}
                    >
                      Preview Email
                    </Button>
                  </Grid>
                </Grid>
              </Grid>
            </>
          )}
        </Grid>
        <Divider className={classes.divider} orientation="horizontal" />
        <Grid container item xs={12} md={10} lg={9}>
          <Grid container item xs={12} className={classes.gridItem} justifyContent="center">
            <Grid item xs={12} sm={6} lg={4}>
              <Typography variant="button" className={classes.name}>
                Send Overdue Reminder
              </Typography>
            </Grid>
            <Grid container item xs={12} sm={6} lg={8}>
              <Grid className={classes.switchContainer} item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      color="primary"
                      onChange={handleSendOverdueReminderChange}
                      checked={editedSendOverdueReminder}
                      disabled={inLoadingState}
                      size="small"
                      inputProps={{ 'aria-label': 'Payment request send overdue reminder switch' }}
                      autoFocus
                    />
                  }
                  label={<Typography variant="body1">Enabled</Typography>}
                />
              </Grid>
            </Grid>
          </Grid>
          {editedSendOverdueReminder && (
            <>
              <Grid container item xs={12} className={classes.gridItem} justifyContent="center">
                <Grid item xs={12} sm={6} lg={4}>
                  <Typography variant="button" className={classes.name}>
                    Send Reminder
                  </Typography>
                </Grid>
                <Grid container item xs={12} sm={6} lg={8}>
                  <TextField
                    size="small"
                    type="number"
                    variant="outlined"
                    value={editedOverdueDateReminderDays}
                    onChange={handleOverdueReminderDaysChange}
                    disabled={inLoadingState || !editedSendOverdueReminder}
                    onKeyDown={onKeyDown}
                    error={!isOverdueDateReminderDaysValid}
                    helperText={!isOverdueDateReminderDaysValid ? 'Please enter value between 1-99' : undefined}
                    inputProps={{
                      'aria-label': 'overdue reminder days',
                      'aria-describedby': `${
                        editedOverdueDateReminderDays === undefined && editedSendOverdueReminder
                          ? undefined
                          : 'overdue-reminder-days-helpertext-id'
                      }`,
                      min: 1,
                      max: MAX_DAYS_LIMIT,
                    }}
                    FormHelperTextProps={{ id: 'overdue-reminder-days-helpertext-id' }}
                    data-cy="overdue-reminder-days-input"
                  />
                  <FormLabel className={classes.dayLabel}>day(s) after due date.</FormLabel>
                </Grid>
              </Grid>
              <Grid container item xs={12} className={classes.gridItem} justifyContent="center">
                <Grid item xs={12} sm={6} lg={4}>
                  <Typography variant="button" className={classes.name}>
                    Reminder Message
                  </Typography>
                </Grid>
                <Grid container item xs={12} sm={6} lg={8}>
                  <TextField
                    size="small"
                    multiline
                    rows={4}
                    variant="outlined"
                    fullWidth
                    value={editedOverdueReminderMessage}
                    onChange={handleOverdueReminderMessageChange}
                    disabled={inLoadingState || !editedSendOverdueReminder}
                    className={classes.fullWidth}
                    inputProps={{
                      'aria-label': 'overdue reminder message input',
                      'aria-describedby': `${editedOverdueReminderMessage ? undefined : 'overdue-reminder-message-helpertext-id'}`,
                      maxLength: MAX_MESSAGE_LIMIT,
                    }}
                    FormHelperTextProps={{ id: 'overdue-reminder-message-helpertext-id' }}
                    data-cy="overdue-reminder-message-input"
                  />
                </Grid>
              </Grid>
              <Grid container item xs={12} className={classes.gridItem} justifyContent="center" alignContent="end">
                <Grid item xs={12} sm={6} lg={4}>
                  <Typography variant="button" className={classes.name}></Typography>
                </Grid>
                <Grid item xs={12} sm={6} lg={8}>
                  <Button
                    onClick={openPreviewOverdueReminderEmail}
                    disabled={inLoadingState}
                    size="small"
                    color="primary"
                    variant="text"
                    className={classes.previewButton}
                    aria-label="Preview overdue reminder email"
                  >
                    Preview Email
                  </Button>
                </Grid>
              </Grid>
            </>
          )}
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
            onClick={handleSavePaymentReminderSettings}
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
          Payment Due Reminders
        </Typography>
        {canUserEdit && !modifyPaymentReminderSettings && (
          <div className={classes.editContainer}>
            <Button
              startIcon={<EditIcon />}
              onClick={handleModifyClick}
              disabled={inLoadingState}
              size="small"
              color="primary"
              variant="outlined"
              aria-label="Edit payment reminder settings"
            >
              EDIT
            </Button>
          </div>
        )}
        <Grid item className={classes.helperText} xs={12}>
          <Typography variant="body1">
            Send payers an email reminder for upcoming and overdue payments. Choose when emails are sent and add custom text to all
            payers.
          </Typography>
        </Grid>
      </Grid>
      <Dialog PaperProps={{ className: classes.previewDialog }} maxWidth={'xs'} open={previewOpen || overduePreviewOpen}>
        <PaymentReminderEmailPreview
          merchantName={merchantName}
          message={overduePreviewOpen ? editedOverdueReminderMessage : editedReminderMessage}
          logoUrl={logoUrl}
          overdue={overduePreviewOpen}
          close={closePreview}
        />
      </Dialog>
      <Grid container>{modifyPaymentReminderSettings ? settingsEdit() : settingsPreview()}</Grid>
    </Grid>
  );
};

export default PaymentReminderPreferences;
