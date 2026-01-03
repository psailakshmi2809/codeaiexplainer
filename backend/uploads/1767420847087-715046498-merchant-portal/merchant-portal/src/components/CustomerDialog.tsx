import { ChangeEvent, KeyboardEvent, useEffect, useState, SyntheticEvent } from 'react';
import {
  Box,
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  FormGroup,
  Grid,
  IconButton,
  InputAdornment,
  TextField,
  Theme,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { createStyles, makeStyles } from '@mui/styles';
import { Customer, CustomerRole, CustomerUser, UpsertCustomerInput } from '../gql-types.generated';
import { KeyboardArrowUp } from '@mui/icons-material';
import { Autocomplete, AutocompleteChangeReason, AutocompleteGetTagProps, AutocompleteRenderInputParams } from '@mui/material';
import { useSelector } from 'react-redux';
import { selectTenantConvenienceFees } from '../features/app/AppSlice';
import ErrorIcon from '@mui/icons-material/Error';
import CloseIcon from '@mui/icons-material/Close';
import LoadingMask from './LoadingMask';
import { CONVENIENCE_FEE_VALUE_MAX_LENGTH } from './ConvenienceFeesSettings';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      minWidth: 400,
      [theme.breakpoints.down('md')]: {
        minWidth: 300,
      },
      overflow: 'visible',
    },
    dialogTitle: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    formFieldsContainer: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-around',
      alignItems: 'center',
    },
    emailLabel: {
      marginRight: 0,
    },
    textField: {
      marginBottom: theme.spacing(1),
    },
    adminUsersSection: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing(1),
    },
    chipBox: {
      marginBottom: theme.spacing(2),
    },
    chip: {
      borderRadius: 5,
      borderColor: theme.palette.uxBlue.activated,
      backgroundColor: theme.palette.background.default,
      margin: theme.spacing(0, 0.5, 0.5, 0),
    },
    expanded: {
      transform: 'rotate(180deg)',
    },
    tagsContainer: {
      width: '100%',
      display: 'flex',
      flexWrap: 'wrap',
      maxHeight: 110,
      overflowY: 'auto',
    },
    dialogActionsContainer: {
      padding: theme.spacing(2.5),
    },
    headerErrorIcon: {
      lineHeight: 1,
      paddingRight: 8,
    },
    errorHeader: {
      padding: theme.spacing(1.5, 3),
      marginBottom: theme.spacing(3),
      display: 'flex',
      alignItems: 'center',
      backgroundColor: theme.palette.error.light,
    },
    errorHeaderText: {
      height: '100%',
      maxWidth: '85%',
      color: theme.palette.error.main,
    },
    settingErrorIcon: {
      fontSize: '1.5rem',
      color: theme.palette.error.main,
    },
    errorIcon: {
      fontSize: '2rem',
      color: theme.palette.error.main,
    },
    inputRoot: {
      flex: 1,

      '& .MuiOutlinedInput-root': {
        paddingRight: 0,
      },
      '& .MuiFormHelperText-root': {
        marginLeft: 0,
      },
    },
    adornment: {
      marginLeft: 0,
      padding: '20px 14px',
    },
    closeIcon: {
      color: theme.palette.uxGrey.disabled,
    },
  }),
);

interface CustomerDialogProps {
  open: boolean;
  customer: Customer | null;
  closeDialog: () => void;
  onSave: (options: UpsertCustomerInput) => void;
  requestInProgress: boolean;
  requestSucceeded: boolean;
  error?: string;
  clearError: () => void;
  hasDuplicateEmailsError: boolean;
  convenienceFeesEnabled: boolean;
  canModifyConvenienceFees: boolean;
}

export const CustomerDialog: React.FC<CustomerDialogProps> = props => {
  const {
    open,
    customer,
    closeDialog,
    onSave,
    requestInProgress,
    requestSucceeded,
    error,
    clearError,
    hasDuplicateEmailsError,
    convenienceFeesEnabled,
    canModifyConvenienceFees,
  } = props;

  const theme = useTheme();
  const matchesMdDown = useMediaQuery(theme.breakpoints.down('md'));
  const styles = useStyles();

  const tenantConvenienceFees = useSelector(selectTenantConvenienceFees);
  const { creditCardRateBps, debitCardRateBps, maxCreditConvenienceFee, maxDebitConvenienceFee } = tenantConvenienceFees || {};
  const convertedCreditFee = ((creditCardRateBps || 0) / 100).toString();
  const convertedDebitFee = ((debitCardRateBps || 0) / 100).toString();
  const convertedMaxCreditConvenienceFee = (maxCreditConvenienceFee || 0) / 100;
  const convertedMaxDebitConvenienceFee = (maxDebitConvenienceFee || 0) / 100;

  const [customerName, setCustomerName] = useState<string>('');
  const [customerNumber, setCustomerNumber] = useState<string>('');
  const [newAdmin, setAdminEmail] = useState<string>('');
  const [adminEmailIds, setAdminEmailIds] = useState<string[]>([]);
  const [existingAdmins, setExistingAdmins] = useState<string[]>([]);
  const [expanded, setExpanded] = useState<boolean>(true);
  const [helperText, setHelperText] = useState<string>('');
  const [sendEmail, setSendEmail] = useState<boolean>(true);

  const [customerDebitFee, setCustomerDebitFee] = useState<string>(convertedDebitFee);
  const [customerCreditFee, setCustomerCreditFee] = useState<string>(convertedCreditFee);
  const [overrideConvenienceFees, setOverrideConvenienceFees] = useState<boolean>(false);

  const [isCustomerNameValid, setCustomerNameValid] = useState<boolean>(true);
  const [isCustomerNumberValid, setCustomerNumberValid] = useState<boolean>(true);
  const [isAdminEmailValid, setAdminEmailValid] = useState<boolean>(true);
  const [isDebitFeeValid, setDebitFeeValid] = useState<boolean>(true);
  const [isCreditFeeValid, setCreditFeeValid] = useState<boolean>(true);

  const [customerNameErrorMessage, setCustomerNameErrorMessage] = useState<string>('');
  const [customerNumberErrorMessage, setCustomerNumberErrorMessage] = useState<string>('');
  const [adminEmailErrorMessage, setAdminEmailErrorMessage] = useState<string>('');

  const emailFormat = /^\w+([+.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;

  useEffect(() => {
    if (open) {
      // reset all values on dialog open
      setCustomerName('');
      setCustomerNameValid(true);
      setCustomerNameErrorMessage('');

      setCustomerNumber('');
      setCustomerNumberValid(true);
      setCustomerNumberErrorMessage('');

      setAdminEmail('');
      setAdminEmailValid(true);
      setAdminEmailErrorMessage('');
      setSendEmail(true);

      setExistingAdmins([]);
      setAdminEmailIds([]);
      setExpanded(true);

      setCustomerDebitFee(convertedDebitFee);
      setCustomerCreditFee(convertedCreditFee);
      setOverrideConvenienceFees(false);

      setDebitFeeValid(true);
      setCreditFeeValid(true);

      clearError();
    }
  }, [open]);

  useEffect(() => {
    if (open && !!customer) {
      const { name, customerNumber, customerUsers } = customer;
      const { convenienceFees } = customer;

      setCustomerNumber(customerNumber);

      if (name) {
        setCustomerName(name);
      }

      if (customerUsers) {
        const adminUsers = (customerUsers as CustomerUser[])
          .filter(user => user.role === CustomerRole.CustomerAdmin)
          .map(user => user.email as string);

        setExistingAdmins(adminUsers);
      }

      if (convenienceFees) {
        const {
          overrideConvenienceFees,
          creditCardRateBps: customerCreditCardFee,
          debitCardRateBps: customerDebitCardFee,
        } = convenienceFees;

        if (typeof customerCreditCardFee === 'number' && typeof customerDebitCardFee === 'number') {
          const convertedDebitFee = (customerDebitCardFee / 100).toString();
          const convertedCreditFee = (customerCreditCardFee / 100).toString();

          setOverrideConvenienceFees(overrideConvenienceFees);

          if (overrideConvenienceFees) {
            setCustomerDebitFee(convertedDebitFee);
            setCustomerCreditFee(convertedCreditFee);

            if (typeof maxCreditConvenienceFee === 'number') {
              setCreditFeeValid(customerCreditCardFee <= maxCreditConvenienceFee);
            }
            if (typeof maxDebitConvenienceFee === 'number') {
              setDebitFeeValid(customerDebitCardFee <= maxDebitConvenienceFee);
            }
          }
        }
      }
    }
  }, [customer, open]);

  useEffect(() => {
    if (hasDuplicateEmailsError) {
      setAdminEmailValid(false);
    }
  }, [hasDuplicateEmailsError]);

  const switchExpanded = () => setExpanded(!expanded);

  // onChange handlers
  const onCustomerNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!isCustomerNameValid) {
      setCustomerNameValid(true);
      setCustomerNameErrorMessage('');
    }

    setCustomerName(e.target.value);
  };

  const onCustomerNumberChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!isCustomerNumberValid) {
      setCustomerNumberValid(true);
      setCustomerNumberErrorMessage('');
    }

    setCustomerNumber(e.target.value);
  };

  const onAdminEmailChange = (e: SyntheticEvent<Element, Event>, value: string) => {
    if (!isAdminEmailValid) {
      setAdminEmailValid(true);
      setAdminEmailErrorMessage('');
      setHelperText('Press enter or space to add multiple email addresses');
    }

    setAdminEmail(value.trim());
  };

  const validateInput = (input: string, maxConvenienceFee: number): boolean => {
    if (!input || !input.trim().length) return false;
    const numberValue = parseFloat(input);
    if (Number.isNaN(numberValue) || numberValue < 0 || numberValue > maxConvenienceFee) return false;
    return true;
  };

  const changeDebitCardFee = (event: ChangeEvent<HTMLInputElement>): void => {
    const value = event.target.value.trim();

    if (value.length > CONVENIENCE_FEE_VALUE_MAX_LENGTH) return;

    setCustomerDebitFee(value);
    setDebitFeeValid(validateInput(value, convertedMaxDebitConvenienceFee));
  };

  const changeCreditCardFee = (event: ChangeEvent<HTMLInputElement>): void => {
    const value = event.target.value.trim();

    if (value.length > CONVENIENCE_FEE_VALUE_MAX_LENGTH) return;

    setCustomerCreditFee(value);
    setCreditFeeValid(validateInput(value, convertedMaxCreditConvenienceFee));
  };

  // validators
  const validateCustomerName = () => {
    if (!customerName || !customerName.trim().length) {
      setCustomerNameValid(false);
      setCustomerNameErrorMessage('This field cannot be blank.');
      return false;
    }
    const specials = new RegExp('[!@#$%^&*(),.?\'":{}|<>]');
    if (specials.test(customerName)) {
      setCustomerNameValid(false);
      setCustomerNameErrorMessage('Customer Name cannot contain special characters.');
      return false;
    }

    setCustomerNameValid(true);
    setCustomerNameErrorMessage('');
    setCustomerName(customerName.trim());
    return true;
  };

  const validateCustomerNumber = () => {
    if (!customerNumber.length) {
      setCustomerNumberValid(false);
      setCustomerNumberErrorMessage('This field cannot be blank.');
      return false;
    }
    if (!customerNumber.trim().length) {
      setCustomerNumberValid(false);
      setCustomerNumberErrorMessage('Customer Number cannot contain only spaces.');
      return false;
    }
    const specials = new RegExp('[!@#$%^&*(),.?\'":{}|<>]');
    if (specials.test(customerNumber)) {
      setCustomerNumberValid(false);
      setCustomerNumberErrorMessage('Customer Number cannot contain special characters.');
      return false;
    }

    setCustomerNumberValid(true);
    setCustomerNumberErrorMessage('');
    setCustomerNumber(customerNumber.trim());
    return true;
  };

  const validateAdminEmail = (isKeyPressed?: boolean) => {
    setHelperText('');

    if (!customer && !adminEmailIds.length && !newAdmin.length) {
      setAdminEmailValid(false);
      setAdminEmailErrorMessage('This field cannot be blank.');
      return false;
    }

    if (isKeyPressed && !newAdmin.trim().length) {
      setAdminEmailValid(false);
      setAdminEmailErrorMessage('New admin user email cannot be blank.');
      return false;
    }

    if (newAdmin.length && !emailFormat.test(newAdmin)) {
      setAdminEmailValid(false);
      setAdminEmailErrorMessage('The email address entered is invalid. Please try again.');
      return false;
    }

    if (adminEmailIds.includes(newAdmin) || existingAdmins.includes(newAdmin)) {
      setAdminEmailValid(false);
      setAdminEmailErrorMessage('This email address already exists.');
      return false;
    }

    setAdminEmailValid(true);
    setAdminEmailErrorMessage('');
    return true;
  };

  const onAdminListChange = (_: SyntheticEvent<Element, Event>, newValue: string[], reason: AutocompleteChangeReason) => {
    if (validateAdminEmail()) {
      setAdminEmailIds(newValue);
    } else if (reason === 'removeOption') {
      const invalidOptionIndex = newValue.indexOf(newAdmin);
      if (invalidOptionIndex > -1) {
        const updatedValue = [...newValue.slice(0, invalidOptionIndex), ...newValue.slice(invalidOptionIndex + 1)];
        setAdminEmailIds(updatedValue);
      } else {
        setAdminEmailIds(newValue);
      }
    }
  };

  const onSendEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSendEmail(event.target.checked);
  };

  const onOverrideConvenienceFees = (event: React.ChangeEvent<HTMLInputElement>) => {
    setOverrideConvenienceFees(event.target.checked);
  };

  const renderTags = (tags: string[], getTagProps: AutocompleteGetTagProps) => (
    <Grid item className={styles.tagsContainer}>
      {tags.map((email, index) => (
        // eslint-disable-next-line react/jsx-key
        <Chip {...getTagProps({ index })} tabIndex={0} label={email} size="small" variant="outlined" className={styles.chip} />
      ))}
    </Grid>
  );

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case 'Enter':
      case ' ':
      case 'Spacebar':
      case 'NumpadEnter':
        e.preventDefault();
        e.stopPropagation();
        if (validateAdminEmail(true)) {
          setAdminEmailIds(prev => [...prev, newAdmin]);
          setAdminEmail('');
        }
        break;
      default:
        break;
    }
  };

  const onCloseDialog = () => {
    closeDialog();
  };

  useEffect(() => {
    if (requestSucceeded) {
      onCloseDialog();
    }
  }, [requestSucceeded]);

  const saveCustomer = () => {
    const adminEmails = [...existingAdmins, ...adminEmailIds];
    const isValidName = validateCustomerName();
    const isValidNumber = validateCustomerNumber();
    const isValidEmail = validateAdminEmail();

    if (newAdmin.length) {
      if (isValidEmail) {
        adminEmails.push(newAdmin);
      } else {
        setAdminEmailValid(false);
        return;
      }
    }

    if (isValidName && isValidNumber && isValidEmail && isCreditFeeValid && isDebitFeeValid) {
      let creditCardFeeInput = Math.round(parseFloat(overrideConvenienceFees ? customerCreditFee : convertedCreditFee) * 100);
      let debitCardFeeInput = Math.round(parseFloat(overrideConvenienceFees ? customerDebitFee : convertedDebitFee) * 100);

      if (customer) {
        const { convenienceFees } = customer;
        const { creditCardRateBps, debitCardRateBps } = convenienceFees || {};

        if (!overrideConvenienceFees) {
          creditCardFeeInput = creditCardRateBps || Math.round(parseFloat(convertedCreditFee) * 100);
          debitCardFeeInput = debitCardRateBps || Math.round(parseFloat(convertedDebitFee) * 100);
        }
      }

      const customerInputData: UpsertCustomerInput = {
        name: customerName.trim(),
        customerNumber: customerNumber.trim(),
        adminEmailIds: adminEmails,
        id: customer ? customer.id : undefined,
        sendEmail,
        convenienceFees: convenienceFeesEnabled
          ? {
              overrideConvenienceFees,
              creditCardRateBps: creditCardFeeInput,
              debitCardRateBps: debitCardFeeInput,
            }
          : undefined,
      };

      onSave(customerInputData);
    }
  };

  const onFocus = () => {
    setAdminEmailValid(true);
    setHelperText('Press enter or space to add multiple email addresses');
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => ['e', 'E', '+', '-'].includes(e.key) && e.preventDefault();

  const renderInput = (params: AutocompleteRenderInputParams) => {
    return (
      <TextField
        {...params}
        error={!isAdminEmailValid}
        helperText={helperText || adminEmailErrorMessage}
        type="email"
        label="Enter Admin User email"
        onBlur={() => {
          validateAdminEmail();
        }}
        onKeyDown={handleKeyDown}
        onFocus={onFocus}
        variant="outlined"
        id="admin-users-list"
      />
    );
  };

  const heading = `${customer ? 'Edit' : 'New'} Customer`;

  const creditConvenienceFeesHelperText = (
    <Typography color="error" variant="caption" data-cy="error-message">
      Enter a value between 0-{convertedMaxCreditConvenienceFee}%.
    </Typography>
  );

  const debitConvenienceFeesHelperText = (
    <Typography color="error" variant="caption" data-cy="error-message">
      Enter a value between 0-{convertedMaxDebitConvenienceFee}%.
    </Typography>
  );

  const endAdornment = (
    <InputAdornment className={styles.adornment} position="end">
      %
    </InputAdornment>
  );

  const existingAdminsList = existingAdmins.map(
    admin => admin && <Chip variant="outlined" size="small" key={admin} label={admin} className={styles.chip} />,
  );

  return (
    <Dialog
      open={open}
      onClose={onCloseDialog}
      disableEscapeKeyDown={requestInProgress}
      maxWidth={convenienceFeesEnabled ? 'lg' : 'xs'}
      aria-labelledby="dialog-title"
    >
      <LoadingMask loading={requestInProgress} />

      <DialogTitle className={styles.dialogTitle} id="dialog-title">
        <Typography variant="title">{heading}</Typography>
        <IconButton aria-label="Close Dialog" onClick={onCloseDialog} size="small">
          <CloseIcon className={styles.closeIcon} />
        </IconButton>
      </DialogTitle>

      {error && (
        <Box className={styles.errorHeader}>
          <Box className={styles.headerErrorIcon}>
            <ErrorIcon className={styles.settingErrorIcon} />
          </Box>
          <Box className={styles.errorHeaderText} data-cy="upsert-customer-error">
            <Typography>{error}</Typography>
          </Box>
        </Box>
      )}

      <DialogContent className={styles.root}>
        <Grid
          container
          flexWrap="nowrap"
          rowGap={{ sm: 2, md: 0 }}
          columnGap={{ sm: 0, md: 2 }}
          direction={matchesMdDown ? 'column' : 'row'}
        >
          <Grid container direction="column" flexWrap="nowrap" minWidth={matchesMdDown ? 'auto' : 350} maxWidth={450} flex={1}>
            <Typography id="customer-details" variant="subtitle1" gutterBottom>
              Customer Details
            </Typography>
            <Grid item className={styles.formFieldsContainer}>
              <TextField
                variant="outlined"
                className={styles.textField}
                fullWidth
                error={!isCustomerNameValid}
                helperText={customerNameErrorMessage}
                inputProps={{
                  minLength: 1,
                  maxLength: 50,
                }}
                label="Customer Name"
                id="customer-name"
                value={customerName}
                onChange={onCustomerNameChange}
                onBlur={validateCustomerName}
              />
              <TextField
                variant="outlined"
                className={styles.textField}
                fullWidth
                error={!isCustomerNumberValid}
                helperText={customerNumberErrorMessage}
                inputProps={{
                  minLength: 1,
                  maxLength: 50,
                }}
                label="Customer Number"
                id="customer-number"
                value={customerNumber}
                disabled={!!customer}
                onChange={onCustomerNumberChange}
                onBlur={validateCustomerNumber}
              />
            </Grid>

            <Grid item>
              <Grid item className={styles.adminUsersSection}>
                <Typography id="admin-users" variant="subtitle1">
                  Admin Users
                </Typography>
                <Box hidden={!customer}>
                  <IconButton aria-label={`${expanded ? 'Hide' : 'Show'} admin list`} onClick={switchExpanded} size="large">
                    <KeyboardArrowUp className={expanded ? '' : styles.expanded} color="primary" />
                  </IconButton>
                </Box>
              </Grid>

              <Box hidden={!expanded} className={styles.chipBox}>
                {existingAdminsList}
              </Box>

              <Autocomplete
                multiple
                options={[]}
                value={adminEmailIds}
                disableClearable
                aria-labelledby="admin-users"
                onChange={onAdminListChange}
                renderTags={renderTags}
                fullWidth
                freeSolo
                inputValue={newAdmin}
                onInputChange={onAdminEmailChange}
                renderInput={renderInput}
              />
            </Grid>

            <Grid item>
              <FormGroup aria-label="Send a welcome email to new Admin Users">
                <FormControlLabel
                  control={<Checkbox checked={sendEmail} color="primary" onChange={onSendEmailChange} />}
                  label={
                    <Typography variant="body2" color="textSecondary">
                      Send a welcome email to new Admin Users
                    </Typography>
                  }
                  labelPlacement="end"
                  className={styles.emailLabel}
                />
              </FormGroup>
            </Grid>
          </Grid>
          {convenienceFeesEnabled && (
            <Grid container direction="column" flexWrap="nowrap" minWidth={matchesMdDown ? 'auto' : 350} maxWidth={450} flex={1}>
              <Typography id="convenience-fees" variant="title" gutterBottom>
                Convenience Fees
              </Typography>

              <Typography variant="body2" mb={2}>
                Fees applied to card payments made within the payer portal to cover card issuer charges. A maximum of{' '}
                {convertedMaxCreditConvenienceFee}% for credit cards, and {convertedMaxDebitConvenienceFee}% for debit cards can be
                applied as a convenience fee.
              </Typography>

              <Grid item width="80%" display="flex" justifyContent="space-between" mb={1.5}>
                <Typography variant="body2">Debit Card Transactions</Typography>
                <Typography variant="body2">{`${convertedDebitFee}%`}</Typography>
              </Grid>
              <Grid item width="80%" display="flex" justifyContent="space-between" mb={1.5}>
                <Typography variant="body2">Credit Card Transactions</Typography>
                <Typography variant="body2">{`${convertedCreditFee}%`}</Typography>
              </Grid>

              <Grid item mt={1} mb={0.5}>
                <FormGroup aria-label="Override the convenience fee for this customer">
                  <FormControlLabel
                    control={<Checkbox checked={overrideConvenienceFees} color="primary" onChange={onOverrideConvenienceFees} />}
                    label={
                      <Typography variant="body2" color="textSecondary">
                        Override the convenience fee for this customer
                      </Typography>
                    }
                    labelPlacement="end"
                    className={styles.emailLabel}
                    disabled={!canModifyConvenienceFees}
                  />
                </FormGroup>
              </Grid>

              <Box hidden={!overrideConvenienceFees}>
                <Grid container columnGap={2}>
                  <TextField
                    variant="outlined"
                    type="number"
                    className={styles.inputRoot}
                    value={customerDebitFee}
                    onChange={changeDebitCardFee}
                    onKeyDown={onKeyDown}
                    error={!isDebitFeeValid}
                    disabled={!canModifyConvenienceFees || requestInProgress}
                    helperText={!isDebitFeeValid && debitConvenienceFeesHelperText}
                    InputProps={{ endAdornment }}
                    inputProps={{
                      'aria-label': 'convenience fee for debit card transactions',
                      'aria-describedby': `${isDebitFeeValid ? undefined : 'debit-card-helpertext'}`,
                      step: 0.01,
                      min: 0,
                      max: convertedMaxDebitConvenienceFee,
                    }}
                    FormHelperTextProps={{ id: 'debit-card-helpertext' }}
                    data-cy="debit-card-fee-input"
                    label="Debit Card"
                  />

                  <TextField
                    variant="outlined"
                    type="number"
                    className={styles.inputRoot}
                    value={customerCreditFee}
                    onChange={changeCreditCardFee}
                    onKeyDown={onKeyDown}
                    error={!isCreditFeeValid}
                    disabled={!canModifyConvenienceFees || requestInProgress}
                    helperText={!isCreditFeeValid && creditConvenienceFeesHelperText}
                    InputProps={{ endAdornment }}
                    inputProps={{
                      'aria-label': 'convenience fee for credit card transactions',
                      'aria-describedby': `${isCreditFeeValid ? undefined : 'credit-card-helpertext'}`,
                      step: 0.01,
                      min: 0,
                      max: convertedMaxCreditConvenienceFee,
                    }}
                    FormHelperTextProps={{ id: 'credit-card-helpertext' }}
                    data-cy="credit-card-fee-input"
                    label="Credit Card"
                  />
                </Grid>
              </Box>
            </Grid>
          )}
        </Grid>
      </DialogContent>
      <DialogActions className={styles.dialogActionsContainer}>
        <Button color="primary" onClick={onCloseDialog}>
          Cancel
        </Button>
        <Button
          variant="contained"
          color="primary"
          disabled={
            !(isCustomerNameValid && isCustomerNumberValid && isAdminEmailValid && isCreditFeeValid && isDebitFeeValid) ||
            requestInProgress
          }
          onClick={saveCustomer}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};
