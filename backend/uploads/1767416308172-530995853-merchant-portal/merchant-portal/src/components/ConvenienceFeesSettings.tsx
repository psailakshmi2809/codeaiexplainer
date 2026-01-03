import { Grid, Theme, Typography, Button, TextField, InputAdornment } from '@mui/material';
import { makeStyles, createStyles } from '@mui/styles';
import React, { ChangeEvent, KeyboardEvent, useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { AppRole, MutationStatusCode, UpdateConvenienceFeesInput } from '../gql-types.generated';
import { selectTenantAccount } from '../features/app/AppSlice';
import {
  selectConvenienceFeesRequestInFlight,
  selectUpdateConvenienceFeesStatus,
} from '../features/account-preferences/AccountPreferencesSlice';

import EditIcon from '@material-ui/icons/Edit';

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
    helperText: {
      marginTop: theme.spacing(1),
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
    inputRoot: {
      '& .MuiOutlinedInput-root': {
        paddingRight: 0,
        width: 120,
      },
      '& .MuiFormHelperText-root': {
        marginLeft: 0,
      },
    },
    adornment: {
      marginLeft: 0,
      padding: '20px 14px',
      background: theme.palette.uxGrey.hover,
    },
    adornedInput: {
      borderRight: `1px solid ${theme.palette.uxGrey.border}`,
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

// eslint-disable-next-line @typescript-eslint/naming-convention
export const CONVENIENCE_FEE_VALUE_MAX_LENGTH = 4;

interface ConvenienceFeesSettingsProps {
  networkBusy: boolean;
  viewerAppRole: AppRole | undefined;
  creditCardRate: number;
  debitCardRate: number;
  maxCreditConvenienceFee: number;
  maxDebitConvenienceFee: number;
  updateConvenienceFees: (input: UpdateConvenienceFeesInput) => void;
  isCustomerEnabled?: boolean;
}

export const ConvenienceFeesSettings: React.FC<ConvenienceFeesSettingsProps> = props => {
  const classes = useStyles();
  const {
    viewerAppRole,
    updateConvenienceFees,
    networkBusy,
    creditCardRate,
    debitCardRate,
    maxCreditConvenienceFee,
    maxDebitConvenienceFee,
    isCustomerEnabled = false,
  } = props;

  const tenantAccount = useSelector(selectTenantAccount);
  const convenienceFeesUpdateStatus = useSelector(selectUpdateConvenienceFeesStatus);
  const convenienceFeesRequestInFlight = useSelector(selectConvenienceFeesRequestInFlight);
  const convertedCreditFee = (creditCardRate / 100).toString();
  const convertedDebitFee = (debitCardRate / 100).toString();
  const canUserEdit = viewerAppRole === AppRole.Admin;

  const [debitCardFee, setDebitCardFee] = useState<string>(convertedDebitFee);
  const [creditCardFee, setCreditCardFee] = useState<string>(convertedCreditFee);
  const [isEditingMode, setEditingMode] = useState<boolean>(false);
  const [isDebitFeeValid, setDebitFeeValid] = useState<boolean>(true);
  const [isCreditFeeValid, setCreditFeeValid] = useState<boolean>(true);

  const resetValues = () => {
    setDebitCardFee(convertedDebitFee);
    setCreditCardFee(convertedCreditFee);
    setDebitFeeValid(true);
    setCreditFeeValid(true);
    setEditingMode(false);
  };

  const openConvenienceFeesDialog = (): void => setEditingMode(true);

  const saveChanges = (): void => {
    const convertedInput: UpdateConvenienceFeesInput = {
      creditCardRateBps: Math.round(parseFloat(creditCardFee) * 100),
      debitCardRateBps: Math.round(parseFloat(debitCardFee) * 100),
    };
    updateConvenienceFees(convertedInput);
    resetValues();
  };

  useEffect(() => {
    if (convenienceFeesUpdateStatus?.code === MutationStatusCode.Success) {
      setEditingMode(false);
    }
  }, [convenienceFeesUpdateStatus]);

  useEffect(() => {
    resetValues();

    setDebitFeeValid(debitCardRate <= Math.round(maxDebitConvenienceFee * 100));
    setCreditFeeValid(creditCardRate <= Math.round(maxCreditConvenienceFee * 100));
  }, [tenantAccount]);

  const inLoadingState = networkBusy || convenienceFeesRequestInFlight;
  const isSaveDisabled =
    inLoadingState ||
    !isDebitFeeValid ||
    !isCreditFeeValid ||
    (convertedCreditFee === creditCardFee && convertedDebitFee === debitCardFee);

  const validateInput = (input: string, maxConvenienceFee: number): boolean => {
    if (!input || !input.trim().length) return false;
    const numberValue = parseFloat(input);
    if (Number.isNaN(numberValue) || numberValue < 0 || numberValue > maxConvenienceFee) return false;
    return true;
  };

  const changeDebitCardFee = (event: ChangeEvent<HTMLInputElement>): void => {
    const value = event.target.value.trim();
    if (value.length > CONVENIENCE_FEE_VALUE_MAX_LENGTH) return;

    setDebitCardFee(value);
    setDebitFeeValid(validateInput(value, maxDebitConvenienceFee));
  };

  const changeCreditCardFee = (event: ChangeEvent<HTMLInputElement>): void => {
    const value = event.target.value.trim();
    if (value.length > CONVENIENCE_FEE_VALUE_MAX_LENGTH) return;

    setCreditCardFee(value);
    setCreditFeeValid(validateInput(value, maxCreditConvenienceFee));
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => ['e', 'E', '+', '-'].includes(e.key) && e.preventDefault();

  const creditHelperText = (
    <Typography color="error" variant="caption" data-cy="error-message">
      Please enter a value between 0-{maxCreditConvenienceFee}%.
    </Typography>
  );

  const debitHelperText = (
    <Typography color="error" variant="caption" data-cy="error-message">
      Please enter a value between 0-{maxDebitConvenienceFee}%.
    </Typography>
  );

  const endAdornment = (
    <InputAdornment className={classes.adornment} position="end">
      %
    </InputAdornment>
  );

  return (
    <Grid container spacing={0} className={classes.root} data-cy="convenience-fees" aria-label="Convenience Fees" role="region">
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
          Convenience Fees
        </Typography>
        {canUserEdit && !isEditingMode && (
          <div className={classes.editContainer}>
            <Button
              startIcon={<EditIcon />}
              onClick={openConvenienceFeesDialog}
              disabled={inLoadingState}
              size="small"
              color="primary"
              variant="outlined"
              aria-label="Edit convenience fees"
            >
              EDIT
            </Button>
          </div>
        )}
        <Grid item className={classes.helperText} xs={12}>
          <Typography variant="body1">
            {`Add convenience fees to card payments made within the Payer Portal. Charge a maximum of ${maxCreditConvenienceFee}% for
            credit cards, and ${maxDebitConvenienceFee}% for debit cards for payment made.${
              isCustomerEnabled ? ' Convenience fees can be overridden per customer using the Manage Customer screen.' : ''
            }`}
          </Typography>
        </Grid>
      </Grid>
      <Grid container spacing={0}>
        <Grid container spacing={0} item xs={12} md={10} lg={9} tabIndex={0}>
          {/* debit card fee */}
          <Grid container spacing={0} item xs={12} className={classes.gridItem} justifyContent="center">
            <Grid item xs={12} sm={6} lg={4}>
              <Typography variant="button" className={classes.name}>
                DEBIT CARD TRANSACTIONS
              </Typography>
            </Grid>
            <Grid item container xs={12} sm={6} lg={8}>
              <Grid item xs={12}>
                {isEditingMode ? (
                  <TextField
                    type="number"
                    size="small"
                    variant="outlined"
                    className={classes.inputRoot}
                    value={debitCardFee}
                    onChange={changeDebitCardFee}
                    onKeyDown={onKeyDown}
                    error={!isDebitFeeValid}
                    disabled={inLoadingState}
                    helperText={!isDebitFeeValid && debitHelperText}
                    InputProps={{ endAdornment }}
                    inputProps={{
                      'aria-label': 'convenience fee for debit card transactions',
                      'aria-describedby': `${isDebitFeeValid ? undefined : 'debit-card-helpertext'}`,
                      step: 0.01,
                      min: 0,
                      max: maxDebitConvenienceFee,
                      className: classes.adornedInput,
                    }}
                    FormHelperTextProps={{ id: 'debit-card-helpertext' }}
                    data-cy="debit-card-fee-input"
                  />
                ) : (
                  <Typography variant="body1">{debitCardFee}%</Typography>
                )}
              </Grid>
            </Grid>
          </Grid>

          {/* credit card fee */}
          <Grid container spacing={0} item xs={12} className={classes.gridItem} justifyContent="center">
            <Grid item xs={12} sm={6} lg={4}>
              <Typography variant="button" className={classes.name}>
                CREDIT CARD TRANSACTIONS
              </Typography>
            </Grid>
            <Grid item container xs={12} sm={6} lg={8}>
              <Grid item xs={12}>
                {isEditingMode ? (
                  <TextField
                    type="number"
                    size="small"
                    variant="outlined"
                    className={classes.inputRoot}
                    value={creditCardFee}
                    onChange={changeCreditCardFee}
                    onKeyDown={onKeyDown}
                    error={!isCreditFeeValid}
                    disabled={inLoadingState}
                    helperText={!isCreditFeeValid && creditHelperText}
                    InputProps={{ endAdornment }}
                    inputProps={{
                      'aria-label': 'convenience fee for credit card transactions',
                      'aria-describedby': `${isCreditFeeValid ? undefined : 'credit-card-helpertext'}`,
                      step: 0.01,
                      min: 0,
                      max: maxCreditConvenienceFee,
                      className: classes.adornedInput,
                    }}
                    FormHelperTextProps={{ id: 'credit-card-helpertext' }}
                    data-cy="credit-card-fee-input"
                  />
                ) : (
                  <Typography variant="body1">{creditCardFee}%</Typography>
                )}
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        {/* action buttons */}
        {isEditingMode && (
          <Grid container spacing={0} item xs={12} justifyContent="flex-end">
            <Button size="small" className={classes.buttonAction} color="primary" onClick={resetValues} disabled={inLoadingState}>
              Cancel
            </Button>
            <Button
              size="small"
              className={classes.buttonAction}
              disabled={isSaveDisabled}
              color="primary"
              variant="contained"
              onClick={saveChanges}
            >
              Save
            </Button>
          </Grid>
        )}
      </Grid>
    </Grid>
  );
};
