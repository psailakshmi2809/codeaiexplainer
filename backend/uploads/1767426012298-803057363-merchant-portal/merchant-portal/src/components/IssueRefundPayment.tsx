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
  Dialog,
  DialogTitle,
} from '@mui/material';
import { createStyles, makeStyles } from '@mui/styles';
import ErrorIcon from '@mui/icons-material/Error';
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import CloseIcon from '@mui/icons-material/Close';

import { Payment, MutationStatusCode, CurrencyType, PaymentRequest } from '../gql-types.generated';
import CurrencyFormat from 'react-currency-format';
import { selectRefundErrorMessage, fetchRefundErrorMessage } from '../features/home/HomeSlice';
import { PaymentStatusForDisplay } from '../util/PaymentStatusForDisplay';
import { paymentStatusDisplay } from '../util/PaymentStatus';
import LoadingMask from './LoadingMask';
import theme from '../Theme';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    dataValue: {
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
    dialogContent: {
      padding: 0,
    },
    dialogContextTitle: {
      padding: theme.spacing(2, 0, 1, 2),
      borderBottom: `1px solid ${theme.palette.uxGrey.border}`,
      marginBottom: 0,
    },
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
    dialogContextErrorHidden: {
      display: 'none',
    },
    dialogButtons: {
      width: '100%',
    },
    gridItemsHorizontal: {
      width: '50%',
      margin: 0,
      padding: theme.spacing(2, 3),
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
    paymentLink: {
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
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
    },
    continousDataValue: {
      wordBreak: 'break-word',
    },
  }),
);

interface ErrorObj {
  class: string;
  message: string;
}

interface IssueRefundPaymentDialogProps {
  refundStatus?: string;
  paymentRecord?: Payment;
  defaultCurrency?: string | null;
  close: () => void;
  sendRefund: (paymentId: string, refundReason: string, amount: number | null) => void;
  clearRefundStateStatus: () => void;
  submit: () => void;
  openPaymentDetails: (paymentRecord: Payment) => void;
  isPaymentRefunded: boolean;
  paymentRefundedAmount?: number;
  refundError?: Error;
  clearRefundError?: () => void;
  paymentRequestById?: PaymentRequest;
  paymentRequestByIdError?: Error;
  isFetchingPaymentRequestById: boolean;
  handleRequestClicked: (paymentRequestId: string) => void;
  openRequestModalFromRefund: () => void;
  isCreditMemoEnabled: boolean;
  isModalOpenedFromPayment: boolean;
}

const IssueRefundPayment: React.FC<IssueRefundPaymentDialogProps> = (props: IssueRefundPaymentDialogProps) => {
  const classes = useStyles();
  const {
    close,
    paymentRecord,
    refundStatus,
    defaultCurrency,
    sendRefund,
    clearRefundStateStatus,
    submit,
    openPaymentDetails,
    isPaymentRefunded,
    paymentRefundedAmount,
    refundError,
    clearRefundError,
    paymentRequestById,
    paymentRequestByIdError,
    isFetchingPaymentRequestById,
    handleRequestClicked,
    openRequestModalFromRefund,
    isCreditMemoEnabled,
    isModalOpenedFromPayment,
  } = props;
  const refundErrorMessage = useSelector(selectRefundErrorMessage);
  const dispatch = useDispatch();
  const getMaxRefundAmount = () => {
    // calculating what amount to use according to convenience fee
    const amountBeforeConvenienceFees =
      paymentRecord?.convenienceFee && paymentRecord?.amountBeforeFees ? paymentRecord?.amountBeforeFees : paymentRecord?.amount;
    // Calculate the maximum amount allowed for this refund using the payment amount minus the refunded amount.
    // The result is in cents.
    return amountBeforeConvenienceFees && isPaymentRefunded && paymentRefundedAmount
      ? amountBeforeConvenienceFees - paymentRefundedAmount
      : amountBeforeConvenienceFees;
  };
  const [userEnteredAmount, setUserEnteredAmount] = useState(() => {
    const remainingPaymentAmount = getMaxRefundAmount();
    return typeof remainingPaymentAmount === 'number' ? (remainingPaymentAmount / 100).toString() : '';
  });
  const [fullRefund, setFullRefund] = useState(isPaymentRefunded ? 'partial' : 'full');
  const [userEnteredReason, setUserEnteredReason] = useState('');
  const [disableAmountField, setDisableAmountField] = useState(
    //Sets this to true if the payment has not been partially refunded
    !isPaymentRefunded,
  );
  const [disableRequestSelection] = useState(
    //Sets this to true if the payment has been partially refunded
    isPaymentRefunded,
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
  const fillEnteredAmountToFullAmount = () => {
    if (paymentRecord && paymentRecord.amount) {
      const refundAmount = paymentRecord.amount - (paymentRecord.convenienceFee || 0);
      setUserEnteredAmount((refundAmount / 100).toString());
    }
  };
  const handleRefundTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target as HTMLInputElement;
    setFullRefund(value);
    if (value === 'full') {
      // set userAmount to amount
      // diable amount textbox
      setDisableAmountField(true);
      fillEnteredAmountToFullAmount();
    } else {
      // enable amount textbox
      setDisableAmountField(false);
    }
  };
  const handleSubmitClick = () => {
    setDisableAmountField(true);
    setDisableRefundButton(false);
    fillEnteredAmountToFullAmount();
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

    if (refundErrorMessage !== '') {
      dispatch(fetchRefundErrorMessage(''));
    }

    if (refundError && clearRefundError) {
      clearRefundError();
    }
  };

  useEffect(() => {
    if (paymentRequestById || paymentRequestByIdError) {
      openRequestModalFromRefund();
    }
  }, [paymentRequestById, paymentRequestByIdError]);

  useEffect(() => {
    if (refundErrorMessage && refundErrorMessage !== '') {
      setError(refundErrorMessage);
      setDisableRefundButton(false);
    } else if (refundError) {
      setError(refundError.message);
      setDisableRefundButton(false);
    }
  }, [refundErrorMessage, refundError]);

  const handleCancelClick = () => {
    setDisableAmountField(true);
    setDisableRefundButton(false);
    fillEnteredAmountToFullAmount();
    setFullRefund('full');
    setUserEnteredReason('');
    removeError();
    close();
  };
  const checkFieldsForSubmit = (): boolean => {
    let ret = true;
    let errorText = '';
    if (userEnteredReason.trim() === '') {
      ret = false;
      errorText = 'Must include reason for refund.';
      //Add Error highlight
      if (!hasReasonError) setHasReasonError(true);
    }
    if (paymentRecord?.amount) {
      const maxRefundAmount = getMaxRefundAmount() ?? 0;
      if (fullRefund !== 'full') {
        if (userEnteredAmount !== '' && userEnteredAmount !== '.') {
          const submitAmount = Math.round(parseFloat(userEnteredAmount) * 100);
          if (submitAmount > maxRefundAmount) {
            ret = false;
            if (maxRefundAmount < paymentRecord?.amount) {
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
      }
    }
    if (errorText !== '') {
      setError(errorText);
    }
    return ret;
  };
  const submitFullRefund = () => {
    if (paymentRecord?.id) {
      setDisableRefundButton(true);
      sendRefund(paymentRecord.id, userEnteredReason.trim(), null);
    }
  };
  const submitPartialRefund = () => {
    if (paymentRecord?.id) {
      setDisableRefundButton(true);
      sendRefund(paymentRecord.id, userEnteredReason.trim(), Math.round(parseFloat(userEnteredAmount) * 100));
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
  if (paymentRecord) {
    return (
      <Dialog open>
        <LoadingMask loading={isFetchingPaymentRequestById} />
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
            <Grid container item xs={12} direction="row" spacing={1} alignItems="stretch" className={classes.gridItemsVertical}>
              {paymentRecord.paymentRequestAllocation && paymentRecord.paymentRequestAllocation.length === 1 && (
                <>
                  <Grid item xs={4}>
                    <Typography color={theme.palette.uxGrey.main} variant={'body1'}>
                      Reference #
                    </Typography>
                  </Grid>
                  <Grid item xs={8}>
                    <Link
                      underline={'hover'}
                      href="#"
                      onClick={() => {
                        if (
                          paymentRecord?.paymentRequestAllocation &&
                          paymentRecord?.paymentRequestAllocation[0]?.paymentRequest?.id
                        ) {
                          handleRequestClicked(paymentRecord.paymentRequestAllocation[0].paymentRequest.id);
                        }
                      }}
                      aria-label={`open payment request details reference ending with ${paymentRecord.paymentRequestAllocation[0]?.paymentRequest?.referenceNumber
                        ?.trim()
                        ?.slice(-4)}`}
                    >
                      <Typography className={classes.paymentLink}>
                        {paymentRecord.paymentRequestAllocation[0]?.paymentRequest?.referenceNumber?.trim() || ''}
                      </Typography>
                    </Link>
                  </Grid>
                </>
              )}
              <Grid item xs={4}>
                <Typography color={theme.palette.uxGrey.main} variant={'body1'}>
                  Payment ID
                </Typography>
              </Grid>
              <Grid item xs={8}>
                <Link
                  underline={'hover'}
                  href="#"
                  onClick={() => {
                    openPaymentDetails(paymentRecord);
                  }}
                  aria-label={`open payment details id ending with ${paymentRecord.id?.slice(-4)}`}
                >
                  <Typography className={classes.paymentLink}>***{paymentRecord.id.slice(-9)}</Typography>
                </Link>
              </Grid>
              <Grid item xs={4}>
                <Typography color={theme.palette.uxGrey.main} variant={'body1'}>
                  Payer Contact
                </Typography>
              </Grid>
              <Grid item xs={8}>
                <Typography className={classes.dataValue} variant={'body1'}>
                  {paymentRecord.initiatedBy ?? '- -'}
                </Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography color={theme.palette.uxGrey.main} variant={'body1'}>
                  Completed On
                </Typography>
              </Grid>
              <Grid item xs={8}>
                <Typography className={classes.dataValue} variant={'body1'}>
                  {new Date(paymentRecord.completedTimestamp as string).toLocaleDateString()}
                </Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography color={theme.palette.uxGrey.main} variant={'body1'}>
                  Amount
                </Typography>
              </Grid>
              <Grid item xs={8}>
                <Typography className={classes.dataValue} variant={'body1'} data-cy="requested-amount">
                  {typeof paymentRecord.amount === 'number'
                    ? new Intl.NumberFormat('en', {
                        style: 'currency',
                        currency: defaultCurrency || 'USD',
                        currencyDisplay: 'symbol',
                      }).format(paymentRecord.amount / 100)
                    : ''}
                </Typography>
              </Grid>
              {paymentRecord?.convenienceFee ? (
                <>
                  <Grid item xs={4}>
                    <Typography color={theme.palette.uxGrey.main} variant={'body1'}>
                      Convenience Fee
                    </Typography>
                  </Grid>
                  <Grid item xs={8}>
                    <Typography className={classes.continousDataValue} variant={'body1'} data-cy="convenience-fee-amount">
                      {`${new Intl.NumberFormat('en', {
                        style: 'currency',
                        currency: defaultCurrency || 'USD',
                        currencyDisplay: 'symbol',
                      }).format((paymentRecord?.convenienceFee || 0) / 100)} (Non-refundable)`}
                    </Typography>
                  </Grid>
                </>
              ) : null}
              {paymentRecord?.convenienceFee || paymentRecord?.amountRefunded ? (
                <>
                  <Grid item xs={4}>
                    <Typography color={theme.palette.uxGrey.main} variant={'body1'}>
                      Refundable Amount
                    </Typography>
                  </Grid>
                  <Grid item xs={8}>
                    <Typography className={classes.continousDataValue} variant={'body1'} data-cy="requested-amount">
                      {new Intl.NumberFormat('en', {
                        style: 'currency',
                        currency: defaultCurrency || 'USD',
                        currencyDisplay: 'symbol',
                      }).format(
                        ((paymentRecord?.amountBeforeFees || (paymentRecord?.amount || 0) - (paymentRecord?.convenienceFee || 0)) -
                          (paymentRecord?.amountRefunded || 0)) /
                          100,
                      )}
                      {paymentRecord?.amountRefunded
                        ? ` (Already refunded ${new Intl.NumberFormat('en', {
                            style: 'currency',
                            currency: defaultCurrency || 'USD',
                            currencyDisplay: 'symbol',
                          }).format((paymentRecord?.amountRefunded || 0) / 100)})`
                        : ' '}
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
                <Typography className={classes.dataValue} variant={'body1'}>
                  {PaymentStatusForDisplay(
                    paymentStatusDisplay.find(item => {
                      return item.name === paymentRecord?.status;
                    })?.display,
                    paymentRecord?.amountBeforeFees || paymentRecord?.amount || 0,
                    paymentRecord?.refunds,
                    paymentRecord?.createdAt,
                  )}
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
                  inputProps={{ 'aria-label': 'amount' }}
                  label="Amount"
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
                  variant="outlined"
                  inputProps={{ 'aria-label': 'refund reason' }}
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
                      if (isModalOpenedFromPayment) {
                        openPaymentDetails(paymentRecord);
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
  submit();
  return null;
};

export default IssueRefundPayment;
