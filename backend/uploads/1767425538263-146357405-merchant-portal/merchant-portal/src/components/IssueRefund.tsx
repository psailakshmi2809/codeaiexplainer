import {
  Box,
  IconButton,
  Button,
  DialogContent,
  FormControlLabel,
  Grid,
  InputAdornment,
  Radio,
  RadioGroup,
  TextField,
  Typography,
  Theme,
  Divider,
  Link,
  DialogTitle,
  Dialog,
} from '@mui/material';
import { createStyles, makeStyles } from '@mui/styles';
import ErrorIcon from '@mui/icons-material/Error';
import React, { useEffect, useState } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import { PaymentRequest, MutationStatusCode, PaymentRequestStatus, CurrencyType, Payment } from '../gql-types.generated';
import CurrencyFormat from 'react-currency-format';
import { paymentStatusDisplay } from '../util/PaymentStatus';
import theme from '../Theme';
const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    dialogContextError: {
      borderBottom: `1px solid ${theme.palette.uxGrey.border}`,
      padding: theme.spacing(1, 3),
      backgroundColor: theme.palette.error.light,
      color: theme.palette.error.main,
      fontWeight: 500,
      display: 'flex',
      width: '100%',
    },
    dialogContextErrorIcon: {
      marginRight: 4,
      color: theme.palette.error.main,
    },
    dialogContextTitle: {
      padding: theme.spacing(2, 0, 1, 2),
      borderBottom: `1px solid ${theme.palette.uxGrey.border}`,
      marginBottom: 0,
    },
    dialogContent: {
      padding: 0,
    },
    dialogContextErrorHidden: {
      display: 'none',
    },
    dialogButtons: {
      width: '100%',
    },
    gridItemsVertical: {
      margin: 0,
      padding: theme.spacing(2),
    },
    inlineBox: {
      display: 'flex',
    },
    textfield: {
      display: 'flex',
      margin: theme.spacing(1.5),
      '&.textfieldError .MuiOutlinedInput-notchedOutline': {
        border: `1px solid ${theme.palette.error.main}`,
      },
    },
    radios: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
    },
    closeButton: {
      position: 'absolute',
      right: theme.spacing(1),
      top: 2,
      color: theme.palette.uxGrey.main,
    },
    currencySymbol: {
      fontSize: '1.1rem',
      fontWeight: 'bold',
    },
    detailsText: {
      fontWeight: 'bold',
      fontSize: '1.1rem',
    },
    detailsTextContainer: {
      margin: 0,
      padding: theme.spacing(1, 0, 0, 2),
    },
    creditRefundText: {
      paddingBottom: theme.spacing(1.5),
      color: theme.palette.uxGrey.main,
    },
  }),
);

interface ErrorObj {
  class: string;
  message: string;
}

interface IssueRefundDialogProps {
  refundStatus?: string;
  paymentRequestRecord?: PaymentRequest;
  paymentRecord?: Payment;
  paymentRecordId?: string;
  defaultCurrency?: string | null;
  close: () => void;
  sendRefund: (paymentId: string, refundReason: string, amount: number | null, paymentRequestId?: string) => void;
  clearRefundStateStatus: () => void;
  submit: () => void;
  refundError?: Error;
  clearRefundError?: () => void;
  openRequestModal: (paymentRequest: PaymentRequest | undefined) => void;
  openPaymentModalFromRefund: (paymentRecord?: Payment) => void;
  isCreditMemoEnabled: boolean;
}

const IssueRefund: React.FC<IssueRefundDialogProps> = (props: IssueRefundDialogProps) => {
  const classes = useStyles();
  const {
    close,
    paymentRequestRecord,
    paymentRecordId,
    refundStatus,
    defaultCurrency,
    sendRefund,
    clearRefundStateStatus,
    submit,
    refundError,
    clearRefundError,
    openRequestModal,
    openPaymentModalFromRefund,
    isCreditMemoEnabled,
    paymentRecord,
  } = props;

  const paymentSnapshot = paymentRequestRecord?.payments.find(p => p?.id === paymentRecordId);

  const getMaxRefundAmount = () => {
    // Calculate the maximum amount allowed for this refund using the payment amount minus the refunded amount.
    // This information is on the payment snapshot, so have to find the first completed payment.
    // The result is in cents.
    let remainingPaymentAmount = 0;
    if (!paymentRequestRecord?.payments || !paymentRequestRecord.payments.length) {
      console.log('No payments associated with payment request');
      return null;
    }
    const payment = paymentRequestRecord.payments.filter(p => p?.id === paymentRecordId)?.[0];
    if (payment) {
      remainingPaymentAmount = (payment.amount ?? 0) - (payment.amountRefunded ?? 0);
    } else {
      console.log('No completed payments associated with payment request');
      return null;
    }
    return remainingPaymentAmount;
  };
  const [userEnteredAmount, setUserEnteredAmount] = useState(() => {
    const remainingPaymentAmount = getMaxRefundAmount();
    return typeof remainingPaymentAmount === 'number' ? (remainingPaymentAmount / 100).toString() : '';
  });
  const [fullRefund, setFullRefund] = useState(paymentSnapshot?.amountRefunded === 0 ? 'full' : 'partial');
  const [userEnteredReason, setUserEnteredReason] = useState('');
  // added totalRefunded check as well because we maintain the partially_paid status in case of refund with partially_paid request
  const [disableAmountField, setDisableAmountField] = useState(
    paymentRequestRecord?.status !== PaymentRequestStatus.PartiallyRefunded && !((paymentRequestRecord?.totalRefunded || 0) > 0),
  );
  const [disableRequestSelection] = useState(
    paymentRequestRecord?.status === PaymentRequestStatus.PartiallyRefunded || (paymentRequestRecord?.totalRefunded || 0) > 0,
  );
  const [disableRefundButton, setDisableRefundButton] = useState(false);
  const [errorState, setErrorState] = useState<ErrorObj | undefined>();
  const [hasAmountError, setHasAmountError] = useState(false);
  const [hasReasonError, setHasReasonError] = useState(false);
  const handleUserEnteredAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUserEnteredAmount(event.target.value);
  };
  const handleUserEnteredReasonChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUserEnteredReason(event.target.value);
  };
  const handleRefundTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target as HTMLInputElement;
    setFullRefund(value);
    if (value === 'full') {
      // set userAmount to amount
      // diable amount textbox
      setDisableAmountField(true);
      if (paymentSnapshot?.amount) {
        setUserEnteredAmount((paymentSnapshot.amount / 100).toString());
      }
    } else {
      // enable amount textbox
      setDisableAmountField(false);
    }
  };
  const handleCancelClick = () => {
    setDisableAmountField(true);
    setDisableRefundButton(false);
    if (paymentSnapshot?.amount) {
      setUserEnteredAmount((paymentSnapshot.amount / 100).toString());
    }
    setFullRefund('full');
    setUserEnteredReason('');
    close();
  };
  const handleSubmitClick = () => {
    setDisableAmountField(true);
    setDisableRefundButton(false);
    if (paymentSnapshot?.amount) {
      setUserEnteredAmount((paymentSnapshot.amount / 100).toString());
    }
    setFullRefund('full');
    setUserEnteredReason('');
    submit();
  };
  useEffect(() => {
    if (refundStatus === MutationStatusCode.Pending || refundStatus === MutationStatusCode.Success) {
      clearRefundStateStatus();
      handleSubmitClick();
    }
  }, [refundStatus]);

  const setError = (errorMessage: string) => {
    setErrorState({
      class: classes.dialogContextError,
      message: errorMessage,
    });
  };
  const removeError = () => {
    setErrorState({
      class: classes.dialogContextErrorHidden,
      message: '',
    });
    if (hasAmountError) {
      setHasAmountError(false);
    }
    if (hasReasonError) {
      setHasReasonError(false);
    }
    if (refundError && clearRefundError) {
      clearRefundError();
    }
  };

  useEffect(() => {
    if (refundError) {
      setError(refundError.message);
      setDisableRefundButton(false);
    }
  }, [refundError]);

  const checkFieldsForSubmit = (): boolean => {
    let ret = true;
    let errorText = '';
    if (userEnteredReason.trim() === '') {
      ret = false;
      errorText = 'Must include reason for refund.';
      //Add Error highlight
      if (!hasReasonError) setHasReasonError(true);
    }
    if (paymentSnapshot?.amount) {
      const maxRefundAmount = getMaxRefundAmount() ?? 0;
      if (fullRefund !== 'full') {
        if (userEnteredAmount !== '' && userEnteredAmount !== '.') {
          const submitAmount = Math.round(parseFloat(userEnteredAmount) * 100);
          if (submitAmount > maxRefundAmount) {
            ret = false;
            if (maxRefundAmount < paymentSnapshot?.amount) {
              errorText =
                errorText === '' ? 'Cannot refund more than the amount remaining' : 'Please fill in all fields with valid data.';
            } else {
              errorText = errorText === '' ? 'Cannot refund more than the amount paid' : 'Please fill in all fields with valid data.';
            }
            //Add Error highlight
            if (!hasAmountError) setHasAmountError(true);
          }
          if (submitAmount < 100) {
            ret = false;
            errorText = errorText === '' ? 'You may not refund less than one dollar' : 'Please fill in all fields with valid data.';
            //Add Error highlight
            if (!hasAmountError) setHasAmountError(true);
          }
        } else {
          ret = false;
          errorText = errorText === '' ? 'Must include amount to refund' : 'Please fill in all fields with valid data.';
          //Add Error highlight
          if (!hasAmountError) setHasAmountError(true);
        }
      } else if (paymentSnapshot?.amount < 100) {
        ret = false;
        errorText = errorText === '' ? 'You may not refund less than one dollar' : 'Please fill in all fields with valid data.';
        //Add Error highlight
        if (!hasAmountError) setHasAmountError(true);
      }
    }
    if (errorText !== '') {
      setError(errorText);
    }
    return ret;
  };
  const submitFullRefund = () => {
    if (paymentRequestRecord?.id) {
      setDisableRefundButton(true);
      // For robustness, find the first completed payment in the payment request and refund that.
      if (!paymentRequestRecord.payments || !paymentRequestRecord.payments.length) {
        console.log('No payments associated with payment request');
        return;
      }
      const payment = paymentRequestRecord.payments.filter(p => p?.id === paymentRecordId)?.[0];
      const paymentAmount = payment?.amount || null;
      if (payment) {
        sendRefund(payment.id, userEnteredReason.trim(), paymentAmount, paymentRequestRecord?.id);
      } else {
        console.log('No completed payments associated with payment request');
      }
    }
  };
  const submitPartialRefund = () => {
    if (paymentRequestRecord?.id) {
      setDisableRefundButton(true);
      // For robustness, find the first completed payment in the payment request and refund that.
      if (!paymentRequestRecord.payments || !paymentRequestRecord.payments.length) {
        console.log('No payments associated with payment request');
        return;
      }
      const payment = paymentRequestRecord.payments.filter(p => p?.id === paymentRecordId)?.[0];
      if (payment) {
        sendRefund(payment.id, userEnteredReason.trim(), Math.round(parseFloat(userEnteredAmount) * 100), paymentRequestRecord?.id);
      } else {
        console.log('No completed payments associated with payment request');
      }
    }
  };
  const handleRefundClick = () => {
    removeError();
    const fieldCheckPassed = checkFieldsForSubmit();
    if (fieldCheckPassed) {
      if (fullRefund === 'full') {
        submitFullRefund();
      } else {
        submitPartialRefund();
      }
    }
  };
  if (paymentRequestRecord) {
    let display;
    if (paymentRequestRecord?.communications[0]) {
      display =
        paymentRequestRecord.communications[0].communicationType === 'SMS'
          ? paymentRequestRecord.communications[0].phoneNumber
          : paymentRequestRecord.communications[0].email;
    }
    return (
      <Dialog open>
        <DialogTitle className={classes.dialogContextTitle}>
          <Typography variant="subtitle2" id="modal-title" data-cy="refund-dialog-title">
            ISSUE A REFUND
          </Typography>
          <Typography variant="h6" id="modal-description">
            Confirm Refund Amount And Reason
          </Typography>
          <IconButton
            aria-label="close"
            title="close"
            className={classes.closeButton}
            onClick={handleCancelClick}
            data-cy="refund-modal-close"
            size="large"
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        {errorState && (
          <Grid container padding={1} alignContent={'center'}>
            {errorState.message && (
              <Typography variant={'body1'} className={errorState.class} data-cy="refund-error-message">
                <ErrorIcon className={classes.dialogContextErrorIcon} />
                {errorState.message}
              </Typography>
            )}
          </Grid>
        )}
        <DialogContent className={classes.dialogContent}>
          <Grid container className={classes.inlineBox}>
            <Grid item xs={12} className={classes.detailsTextContainer}>
              <Typography className={classes.detailsText}>Request Details</Typography>
            </Grid>
            <Grid container spacing={1} item xs={12} direction="row" alignItems="stretch" className={classes.gridItemsVertical}>
              <Grid item xs={4}>
                <Typography color={theme.palette.uxGrey.main} variant={'body1'}>
                  Reference #
                </Typography>
              </Grid>
              <Grid item xs={8}>
                <Typography variant={'body1'}>
                  <Link
                    underline={'hover'}
                    href="#"
                    onClick={() => openRequestModal(paymentRequestRecord)}
                    aria-label={`open payment request details reference ending with ${paymentRequestRecord.referenceNumber
                      ?.trim()
                      ?.slice(-4)}`}
                  >
                    {paymentRequestRecord.referenceNumber?.trim()}
                  </Link>
                </Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography color={theme.palette.uxGrey.main} variant={'body1'}>
                  Payment ID
                </Typography>
              </Grid>
              <Grid item xs={8}>
                <Typography variant={'body1'}>
                  <Link
                    underline={'hover'}
                    href="#"
                    onClick={() => {
                      if (paymentRecord) openPaymentModalFromRefund(paymentRecord);
                    }}
                    aria-label={`open payment details id ending with ${paymentRecordId?.slice(-4)}`}
                  >{`***${paymentRecordId?.slice(-9)}`}</Link>
                </Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography color={theme.palette.uxGrey.main} variant={'body1'}>
                  Payer Contact
                </Typography>
              </Grid>
              <Grid item xs={8}>
                <Typography variant={'body1'}>{display}</Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography color={theme.palette.uxGrey.main} variant={'body1'}>
                  Completed On
                </Typography>
              </Grid>
              <Grid item xs={8}>
                <Typography variant={'body1'}>
                  {new Date(paymentSnapshot?.attemptTimestamp || (paymentSnapshot?.createdAt as string)).toLocaleDateString()}
                </Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography color={theme.palette.uxGrey.main} variant={'body1'}>
                  Amount
                </Typography>
              </Grid>
              <Grid item xs={8}>
                <Typography variant={'body1'} data-cy="requested-amount">
                  {typeof paymentSnapshot?.amount === 'number'
                    ? new Intl.NumberFormat('en', {
                        style: 'currency',
                        currency: defaultCurrency || 'USD',
                        currencyDisplay: 'symbol',
                      }).format(paymentSnapshot.amount / 100)
                    : ''}
                </Typography>
              </Grid>
              {paymentSnapshot?.amountRefunded ? (
                <>
                  <Grid item xs={4}>
                    <Typography color={theme.palette.uxGrey.main} variant={'body1'}>
                      Refundable Amount
                    </Typography>
                  </Grid>
                  <Grid item xs={8}>
                    <Typography variant={'body1'} data-cy="requested-amount">
                      {new Intl.NumberFormat('en', {
                        style: 'currency',
                        currency: defaultCurrency || 'USD',
                        currencyDisplay: 'symbol',
                      }).format(((paymentSnapshot?.amount || 0) - (paymentSnapshot?.amountRefunded || 0)) / 100)}
                      {` (Already refunded ${new Intl.NumberFormat('en', {
                        style: 'currency',
                        currency: defaultCurrency || 'USD',
                        currencyDisplay: 'symbol',
                      }).format((paymentSnapshot?.amountRefunded || 0) / 100)})`}
                    </Typography>
                  </Grid>
                </>
              ) : null}
              <Grid item xs={4}>
                <Typography color={theme.palette.uxGrey.main} variant={'body1'}>
                  Status
                </Typography>
              </Grid>
              <Grid item xs={8}>
                <Typography variant={'body1'}>
                  {paymentRequestRecord.status &&
                    paymentStatusDisplay.find(item => {
                      return item.name === paymentRequestRecord.status;
                    })?.display}
                </Typography>
              </Grid>
            </Grid>
            <Grid item xs={12}>
              <Divider orientation={'horizontal'} />
            </Grid>
            <Grid item xs={12} className={classes.gridItemsVertical}>
              <RadioGroup
                aria-label="request type"
                name="requestSelection"
                className={classes.radios}
                value={fullRefund}
                onChange={handleRefundTypeChange}
              >
                <FormControlLabel
                  value="full"
                  control={<Radio color="primary" data-cy="full-refund" />}
                  label="Full refund"
                  disabled={disableRequestSelection}
                />
                <FormControlLabel
                  value="partial"
                  control={<Radio color="primary" data-cy="partial-refund" />}
                  label="Partial refund"
                  disabled={disableRequestSelection}
                />
              </RadioGroup>
              {isCreditMemoEnabled && (
                <Box className={classes.creditRefundText}>
                  Refunds can be applied to card or bank account payments, but not to credit memo payments.
                </Box>
              )}
              <Box>
                <CurrencyFormat
                  displayType="input"
                  customInput={TextField}
                  decimalScale={2}
                  allowNegative={false}
                  variant="outlined"
                  margin="none"
                  label="Amount"
                  inputProps={{ 'aria-label': 'amount' }}
                  className={classes.textfield}
                  value={userEnteredAmount}
                  onChange={handleUserEnteredAmountChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Typography className={classes.currencySymbol}>{`${
                          defaultCurrency === CurrencyType.Cad ? 'CA' : ''
                        }$`}</Typography>
                      </InputAdornment>
                    ),
                  }}
                  disabled={disableAmountField}
                  error={hasAmountError}
                  data-cy="refund-amount"
                />
                <TextField
                  inputProps={{ 'aria-label': 'refund reason' }}
                  variant="outlined"
                  label="Refund Reason"
                  className={classes.textfield}
                  value={userEnteredReason}
                  onChange={handleUserEnteredReasonChange}
                  error={hasReasonError}
                  data-cy="refund-reason"
                ></TextField>
              </Box>
              <Grid container spacing={1} justifyContent="flex-end">
                <Grid item xs={3}>
                  <Button
                    className={classes.dialogButtons}
                    color="primary"
                    onClick={() => {
                      if (paymentRecord) {
                        openPaymentModalFromRefund(paymentRecord);
                      } else {
                        handleCancelClick();
                      }
                    }}
                    data-cy="cancel-refund"
                  >
                    Cancel
                  </Button>
                </Grid>
                <Grid item xs={3}>
                  <Button
                    className={classes.dialogButtons}
                    color="primary"
                    variant="contained"
                    onClick={handleRefundClick}
                    disabled={disableRefundButton}
                    data-cy="process-refund"
                  >
                    Refund
                  </Button>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </DialogContent>
      </Dialog>
    );
  }
  return null;
};

export default IssueRefund;
