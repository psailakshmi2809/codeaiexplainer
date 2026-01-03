import CloseIcon from '@mui/icons-material/Close';
import { Button, Dialog, Grid, IconButton, TextField, Theme, Typography } from '@mui/material';
import { createStyles, makeStyles } from '@mui/styles';
import { GridRowModel } from '@mui/x-data-grid-pro';
import { DateTime } from 'luxon';
import React, { useState } from 'react';
import CurrencyFormat from 'react-currency-format';

import { CurrencyType } from '../gql-types.generated';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    infoSections: {
      padding: theme.spacing(2),
    },
    contentSection: {
      padding: theme.spacing(0, 2, 2, 2),
    },
    requestedAmountItem: {
      paddingBottom: theme.spacing(2),
    },
    closeButtonWrap: {
      marginLeft: 'auto',
    },
  }),
);

interface PartialPaymentEditProps {
  isOpen: boolean;
  close: () => void;
  row: GridRowModel;
  needReason: boolean;
  saveChanges: (amount: number, reason?: string) => void;
}

const PartialPaymentEdit: React.FC<PartialPaymentEditProps> = props => {
  const { isOpen, close, row, needReason, saveChanges } = props;
  const classes = useStyles();
  // eslint-disable-next-line no-underscore-dangle
  const paymentRequest = row._raw;
  const discountEndDate = DateTime.fromISO(paymentRequest?.discountEndDate);
  const total = paymentRequest?.totalDue || 0;
  const doesDiscountApply = discountEndDate.isValid && discountEndDate > DateTime.utc();
  const discountAmount = doesDiscountApply && paymentRequest?.discountAmount ? paymentRequest.discountAmount : 0;
  const [amount, setAmount] = useState<string>((row?.paymentToday / 100).toFixed(2).toString());
  const [isValidAmount, setIsValidAmount] = useState<boolean>(row?.paymentToday <= (total || 0));
  const [reason, setReason] = useState<string>(row?.partialReason || '');
  const [isValidReason, setIsValidReason] = useState<boolean>(true);

  const isAmountValid = (amount: number): boolean => {
    if (Number.isNaN(amount) || amount > (total || 0) - discountAmount || amount < 100) {
      return false;
    }
    return true;
  };

  const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.trim();
    setAmount(value);
    const amount = Math.round(parseFloat(value && value.length > 0 ? value : '0') * 100);
    const isValid = isAmountValid(amount);
    setIsValidAmount(isValid);
  };

  const handleAmountFormat = () => {
    if (isValidAmount) {
      setAmount((Math.round(parseFloat(amount && amount.length > 0 ? amount : '0') * 100) / 100).toFixed(2).toString());
    }
  };

  const isReasonValid = (value: string): boolean => {
    if (value.length === 0) return true;
    if (value.trim().length < 3) return false;
    return true;
  };

  const handleReasonChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setReason(value);
    const isValid = isReasonValid(value);
    setIsValidReason(isValid);
  };

  const handleClose = () => {
    close();
    setReason('');
  };

  const handleSave = () => {
    if (amount) {
      const partialReason = reason.trim().length === 0 ? undefined : reason;
      const partialAmount = Math.round(parseFloat(amount.length > 0 ? amount : '0') * 100);
      saveChanges(partialAmount, partialReason);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={(event, reason) => {
        if (reason !== 'backdropClick') {
          handleClose();
        }
      }}
      fullWidth
      maxWidth="xs"
      aria-labelledby="partial-modal-header"
      aria-describedby="partial-modal-description"
    >
      <Grid container className={classes.infoSections}>
        <Grid item>
          <Typography variant="subtitle2" id="partial-modal-header">
            EDIT PAYMENT
          </Typography>
          <Typography variant="subtitle" id="partial-modal-description">
            Provide Payment Amount and Reason
          </Typography>
        </Grid>
        <Grid item alignSelf={'end'} className={classes.closeButtonWrap}>
          <IconButton aria-label="close" title="close" onClick={handleClose} data-cy="payment-edit-close" size="large">
            <CloseIcon />
          </IconButton>
        </Grid>
      </Grid>
      <Grid container spacing={2} className={classes.contentSection}>
        <Grid item xs={12} className={classes.requestedAmountItem}>
          <Typography>Requested Amount</Typography>
          <Typography variant={'subtitle'}>
            {new Intl.NumberFormat('en', {
              style: 'currency',
              currency: paymentRequest.currency || 'USD',
              currencyDisplay: 'symbol',
            }).format((paymentRequest?.totalDue || 0) / 100)}
          </Typography>
        </Grid>
        <Grid item container xs={12}>
          <CurrencyFormat
            id="partial-payment-amount"
            displayType="input"
            customInput={TextField}
            decimalScale={2}
            allowNegative={false}
            variant="outlined"
            margin="none"
            fullWidth
            label={`Payment Amount (${paymentRequest.currency === CurrencyType.Cad ? 'CA' : ''}$)`}
            helperText={
              isValidAmount
                ? null
                : `Amount must be between ${paymentRequest.currency === CurrencyType.Cad ? 'CA' : ''}$1 and Remaining Amount`
            }
            error={!isValidAmount}
            value={amount}
            onChange={handleAmountChange}
            onBlur={handleAmountFormat}
            InputProps={{
              'aria-describedby': `${isValidAmount ? undefined : 'payment-amount-helpertext-id'}`,
            }}
            FormHelperTextProps={{ id: 'payment-amount-helpertext-id' }}
            data-cy="amount-edit"
          />
        </Grid>
        <Grid item container xs={12}>
          <TextField
            id="partial-payment-reason"
            variant="outlined"
            margin="none"
            fullWidth
            label={`Reason${needReason ? '' : ' (Optional)'}`}
            multiline={true}
            rows={4}
            maxRows={4}
            helperText={isValidReason ? null : 'Reason should have atleast 3 characters.'}
            error={!isValidReason}
            value={reason}
            onChange={handleReasonChange}
            inputProps={{
              maxLength: 200,
            }}
            InputProps={{
              'aria-describedby': `${isValidReason ? undefined : 'reason-helpertext-id'}`,
            }}
            FormHelperTextProps={{ id: 'reason-helpertext-id' }}
            data-cy="reason-edit"
          ></TextField>
        </Grid>
        <Grid item container xs={12} justifyContent="flex-end" spacing={1}>
          <Button variant="text" color="primary" size="small" onClick={handleClose} data-cy="cancel-edit">
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            size="small"
            disabled={
              !isValidAmount ||
              !isValidReason ||
              (Math.round(parseFloat(amount && amount.length > 0 ? amount : '0') * 100) === row.todayDue &&
                reason.trim() === (row.partialReason || '')) ||
              (needReason &&
                Math.round(parseFloat(amount && amount.length > 0 ? amount : '0') * 100) < (total || 0) - discountAmount &&
                reason.trim().length < 3)
            }
            onClick={handleSave}
            data-cy="save-edit"
          >
            Save
          </Button>
        </Grid>
      </Grid>
    </Dialog>
  );
};

export default PartialPaymentEdit;
