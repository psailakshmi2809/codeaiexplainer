import React, { useCallback, useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  Box,
  Typography,
  Grid,
} from '@mui/material';
import ErrorIcon from '@mui/icons-material/Error';
import { allCountries } from '../util/Countries';
import LoadingMask from '../components/LoadingMask';
import { SelectChangeEvent } from '@mui/material/Select';
import NumberFormat from 'react-number-format';
import {
  checkIsEmailValid,
  checkIsPostalCodeValid,
  checkIsCountryCodeValid,
  checkIsPhoneNumberValid,
} from '../util/PaymentVirtualTerminalValidators';

interface AddBankDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: () => void;
  isSaving: boolean;
  error?: Error;
  formData: {
    email: string;
    country: string;
    postalCode: string;
    countryCode: string;
    phoneNumber: string;
  };
  onFormChange: (field: string, value: string) => void;
}
interface NumberFormatCustomProps {
  onChange: (event: { target: { value: string } }) => void;
}
const PhoneNumberFormat = (props: NumberFormatCustomProps) => {
  const { onChange, ...other } = props;

  return (
    <NumberFormat
      {...other}
      format="(###) ###-####"
      mask=" "
      onValueChange={values => {
        onChange({
          target: {
            value: values.value,
          },
        });
      }}
    />
  );
};
const AddBankDialog: React.FC<AddBankDialogProps> = ({ open, onClose, onSave, isSaving, error, formData, onFormChange }) => {
  const [isFormValid, setIsFormValid] = useState(false);
  const [touched, setTouched] = useState({
    email: false,
    country: false,
    postalCode: false,
    countryCode: false,
    phoneNumber: false,
  });

  const validateForm = useCallback(() => {
    // Validate SDK fields
    const isAccountNameValid = !!document.querySelector('#CollectJSInlinecheckname.CollectJSValid');
    const isAccountNumberValid = !!document.querySelector('#CollectJSInlinecheckaccount.CollectJSValid');
    const isRoutingNumberValid = !!document.querySelector('#CollectJSInlinecheckaba.CollectJSValid');

    // Validate form fields
    const isEmailValid = checkIsEmailValid(formData.email);
    const isCountryValid = !!formData.country;
    const isPostalValid = checkIsPostalCodeValid(formData.postalCode, formData.country);
    const isCountryCodeValid = checkIsCountryCodeValid(formData.countryCode);
    const isPhoneValid = checkIsPhoneNumberValid(formData.phoneNumber);

    const isSdkValid = isAccountNameValid && isAccountNumberValid && isRoutingNumberValid;
    const isFormValid = isEmailValid && isCountryValid && isPostalValid && isCountryCodeValid && isPhoneValid && isSdkValid;

    setIsFormValid(isFormValid);
  }, [formData]);

  useEffect(() => {
    const interval = setInterval(validateForm, 500);
    return () => clearInterval(interval);
  }, [validateForm]);

  // Validate when form data changes
  useEffect(() => {
    validateForm();
  }, [formData, validateForm]);

  const handleCountryChange = (e: SelectChangeEvent<string>) => {
    const countryAbbr = e.target.value;
    const country = allCountries.find(c => c.abbr === countryAbbr);
    if (country) {
      onFormChange('country', countryAbbr);
      onFormChange('countryCode', `+${country.code}`);
    }
  };

  return (
    <Dialog open={open} maxWidth="sm" fullWidth>
      <LoadingMask loading={isSaving} />
      <DialogContent>
        <Box mb={3}>
          <Typography variant="h6">Add Bank Account</Typography>
        </Box>

        <Box id="js_sdk_bank" sx={{ minHeight: 220 }} />
        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 500 }}>
          Billing Address
        </Typography>
        {error && (
          <Box display="flex" alignItems="center" color="error.main" mb={2}>
            <ErrorIcon fontSize="small" sx={{ mr: 1 }} />
            {error.message}
          </Box>
        )}

        <TextField
          fullWidth
          label="Email"
          value={formData.email}
          error={touched.email && !checkIsEmailValid(formData.email)}
          helperText={touched.email && !checkIsEmailValid(formData.email) && 'Invalid email'}
          onChange={e => onFormChange('email', e.target.value)}
          onBlur={() => setTouched(prev => ({ ...prev, email: true }))}
          sx={{ mb: 2 }}
        />

        <FormControl fullWidth sx={{ mb: 2 }} error={touched.country && !formData.country}>
          <InputLabel>Country</InputLabel>
          <Select
            native
            value={formData.country}
            label="Country"
            onChange={handleCountryChange}
            onBlur={() => setTouched(prev => ({ ...prev, country: true }))}
          >
            <option value=""></option>
            {allCountries.map(country => (
              <option key={country.abbr} value={country.abbr}>
                {country.name}
              </option>
            ))}
          </Select>
        </FormControl>

        <TextField
          fullWidth
          label="Postal Code"
          value={formData.postalCode}
          error={touched.postalCode && !checkIsPostalCodeValid(formData.postalCode, formData.country)}
          helperText={touched.postalCode && !checkIsPostalCodeValid(formData.postalCode, formData.country) && 'Invalid postal code'}
          onChange={e => onFormChange('postalCode', e.target.value)}
          onBlur={() => setTouched(prev => ({ ...prev, postalCode: true }))}
          sx={{ mb: 2 }}
        />

        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={4}>
            <TextField
              fullWidth
              label="Country Code"
              value={formData.countryCode}
              error={touched.countryCode && !checkIsCountryCodeValid(formData.countryCode)}
              helperText={touched.countryCode && !checkIsCountryCodeValid(formData.countryCode) && 'Invalid country code'}
              onChange={e => onFormChange('countryCode', e.target.value)}
              onBlur={() => setTouched(prev => ({ ...prev, countryCode: true }))}
            />
          </Grid>
          <Grid item xs={8}>
            <TextField
              fullWidth
              label="Phone Number"
              value={formData.phoneNumber}
              error={touched.phoneNumber && !checkIsPhoneNumberValid(formData.phoneNumber)}
              helperText={touched.phoneNumber && !checkIsPhoneNumberValid(formData.phoneNumber) && 'Invalid phone number'}
              onChange={e => onFormChange('phoneNumber', e.target.value)}
              onBlur={() => setTouched(prev => ({ ...prev, phoneNumber: true }))}
              InputProps={{
                inputComponent: PhoneNumberFormat as never,
              }}
              InputLabelProps={formData.phoneNumber ? { shrink: true } : {}}
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} disabled={isSaving}>
          Cancel
        </Button>
        <Button id="js_sdk_button" onClick={onSave} variant="contained" disabled={!isFormValid || isSaving}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddBankDialog;
