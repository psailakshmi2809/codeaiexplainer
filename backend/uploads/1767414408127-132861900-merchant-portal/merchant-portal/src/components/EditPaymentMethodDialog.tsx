import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  CircularProgress,
  Theme,
  Typography,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import React, { useState, useEffect } from 'react';
import { PaymentMethod, PaymentMethodType } from '../gql-types.generated';
import NumberFormat from 'react-number-format';

const useStyles = makeStyles((theme: Theme) => ({
  editDialogPaper: {
    width: 470,
    maxWidth: '90vw',
    height: 400,
    maxHeight: '90vh',
  },
  editDialogTitle: {
    paddingBottom: 0,
    position: 'relative',
  },
  editDialogIcon: {
    position: 'absolute',
    right: 20,
    top: 80,
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1.5),
  },
  editMethodDetails: {
    marginBottom: theme.spacing(3),
    '& > p': {
      marginBottom: 0,
    },
  },
  columnFlexContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
  },
  cancelButton: {
    marginRight: theme.spacing(1),
  },
}));

interface EditPaymentMethodDialogProps {
  method?: PaymentMethod;
  open: boolean;
  onClose: () => void;
  onSave: (email: string, phone: string, countryCode: string) => void;
  isUpdating: boolean;
  updateError?: Error;
  getPaymentMethodIcon: (
    paymentMethod: PaymentMethod | undefined,
    isDisabled: boolean,
    length: number,
    isCard?: boolean,
  ) => JSX.Element;
  checkIsEmailValid: (email: string) => boolean;
  checkIsPhoneNumberValid: (phone: string) => boolean;
  checkIsCountryCodeValid: (code: string) => boolean;
}

const EditPaymentMethodDialog: React.FC<EditPaymentMethodDialogProps> = ({
  method,
  open,
  onClose,
  onSave,
  isUpdating,
  updateError,
  getPaymentMethodIcon,
  checkIsEmailValid,
  checkIsPhoneNumberValid,
  checkIsCountryCodeValid,
}) => {
  const classes = useStyles();
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('');
  const [errors, setErrors] = useState({
    email: false,
    phone: false,
    countryCode: false,
  });
  useEffect(() => {
    if (method) {
      let rawPhone = '';
      let newCountryCode = '+1';
      let newEmail = '';

      if (method.type === PaymentMethodType.CreditCard && method.creditCard) {
        rawPhone = method.creditCard.cardHolder?.phone?.number?.replace(/\D/g, '') || '';
        newCountryCode = method.creditCard.cardHolder?.phone?.countryCode || '+1';
        newEmail = method.creditCard.cardHolder?.email || '';
      } else if (method.type === PaymentMethodType.PaymentBankUs && method.paymentBank) {
        rawPhone = method.paymentBank.accountHolder?.phone?.number?.replace(/\D/g, '') || '';
        newCountryCode = method.paymentBank.accountHolder?.phone?.countryCode || '+1';
        newEmail = method.paymentBank.accountHolder?.email || '';
      }

      setEmail(newEmail);
      setPhone(rawPhone);
      setCountryCode(newCountryCode);

      setErrors({
        email: !checkIsEmailValid(newEmail),
        phone: !checkIsPhoneNumberValid(rawPhone),
        countryCode: !checkIsCountryCodeValid(newCountryCode),
      });
    }
  }, [method]);

  const prevIsUpdating = React.useRef(isUpdating);

  useEffect(() => {
    // Only close when update completes successfully
    if (prevIsUpdating.current === true && isUpdating === false && !updateError) {
      onClose();
    }
    prevIsUpdating.current = isUpdating;
  }, [isUpdating, updateError, onClose]);

  const handleEmailChange = (value: string) => {
    setEmail(value);
    setErrors(prev => ({ ...prev, email: !checkIsEmailValid(value) }));
  };

  const handlePhoneChange = (values: { value: string }) => {
    setPhone(values.value);
    setErrors(prev => ({ ...prev, phone: !checkIsPhoneNumberValid(values.value) }));
  };

  const handleCountryCodeChange = (value: string) => {
    setCountryCode(value);
    setErrors(prev => ({ ...prev, countryCode: !checkIsCountryCodeValid(value) }));
  };

  const handleSave = () => {
    if (!errors.email && !errors.phone && !errors.countryCode) {
      onSave(email, phone, countryCode);
    }
  };

  return (
    <Dialog open={open} PaperProps={{ className: classes.editDialogPaper }} aria-labelledby="edit-method-dialog-title">
      <DialogTitle className={classes.editDialogTitle} id="edit-method-dialog-title">
        Edit Payment Method
        <Box className={classes.editDialogIcon}>{method && getPaymentMethodIcon(method, false, 64, true)}</Box>
      </DialogTitle>

      <DialogContent>
        {updateError && (
          <Box color="error.main" py={1}>
            Error: {updateError.message}
          </Box>
        )}
        <Box className={classes.editMethodDetails}>
          <Typography variant="subtitle1" aria-label="Card brand">
            {method?.creditCard?.cardBrand || 'Bank Account'}
          </Typography>
          <Typography variant="subtitle2" aria-label="Card number">
            **** **** **** {method?.creditCard?.lastFour || method?.paymentBank?.lastFour}
          </Typography>
          <Typography variant="subtitle2" aria-label="Cardholder name">
            {method?.creditCard?.cardHolder?.holderName || method?.paymentBank?.accountHolder?.holderName}
          </Typography>
        </Box>
        <Box className={classes.columnFlexContainer}>
          <TextField
            label="Email Address"
            value={email}
            onChange={e => handleEmailChange(e.target.value)}
            error={errors.email}
            helperText={errors.email ? 'Invalid email address' : ''}
            fullWidth
          />

          <Grid container spacing={2}>
            <Grid item xs={4}>
              <TextField
                label="Country Code"
                value={countryCode}
                onChange={e => handleCountryCodeChange(e.target.value)}
                error={errors.countryCode}
                helperText={errors.countryCode ? 'Invalid country code' : ''}
                fullWidth
              />
            </Grid>
            <Grid item xs={8}>
              <TextField
                label="Phone Number"
                value={phone}
                error={errors.phone}
                helperText={errors.phone ? 'Invalid phone number' : ''}
                fullWidth
                InputProps={{
                  inputComponent: NumberFormat as never,
                  inputProps: {
                    format: '(###) ###-####',
                    mask: ' ',
                    onValueChange: handlePhoneChange,
                  },
                }}
                InputLabelProps={{
                  shrink: !!phone,
                }}
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} className={classes.cancelButton}>
          CANCEL
        </Button>
        <Button onClick={handleSave} variant="contained" disabled={isUpdating || errors.email || errors.phone || errors.countryCode}>
          {isUpdating ? (
            <CircularProgress
              size={24}
              sx={{
                color: theme => theme.palette.grey[500],
                margin: '0 auto',
              }}
            />
          ) : (
            'SAVE'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditPaymentMethodDialog;
