import { Box, Grid, TextField, Typography, Tooltip, InputAdornment } from '@mui/material';
import { Theme } from '@mui/material/styles';
import { createStyles, makeStyles } from '@mui/styles';
import React from 'react';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

interface OnboardMerchantAccountProps {
  handleMerchantNameInput: (name: string) => void;
  handleMerchantDescriptionInput: (description: string) => void;
  handleMerchantStatementInput: (statement: string) => void;
  handleRefundPolicyInput: (refundPolicy: string) => void;
  handleSupportEmailInput: (email: string) => void;
  merchantName?: string;
  merchantDescription?: string;
  merchantStatement?: string;
  refundPolicy?: string;
  isNameFieldEmpty: boolean;
  isDescriptionFieldEmpty: boolean;
  isStatementFieldEmpty: boolean;
  supportEmail?: string;
  isSupportEmailValid: boolean;
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    grid: {
      marginBottom: theme.spacing(1),
    },
    tooltip: {
      cursor: 'pointer',
    },
  }),
);

const OnboardMerchantAccount: React.FC<OnboardMerchantAccountProps> = props => {
  const classes = useStyles();
  const {
    handleMerchantNameInput,
    handleMerchantDescriptionInput,
    handleMerchantStatementInput,
    handleRefundPolicyInput,
    handleSupportEmailInput,
    merchantName,
    merchantDescription,
    merchantStatement,
    refundPolicy,
    isNameFieldEmpty,
    isDescriptionFieldEmpty,
    isStatementFieldEmpty,
    supportEmail,
    isSupportEmailValid,
  } = props;

  return (
    <Box px={4} py={2}>
      <Box mb={3}>
        <Typography variant="h6">Create a Merchant Account</Typography>
      </Box>
      <Grid className={classes.grid} container spacing={2}>
        <Grid item xs={4}>
          <TextField
            variant="outlined"
            label="Account Name"
            inputProps={{ 'aria-label': 'account name' }}
            data-cy="account-name"
            value={merchantName}
            fullWidth
            required
            error={isNameFieldEmpty}
            onChange={event => handleMerchantNameInput(event.target.value)}
            helperText={isNameFieldEmpty ? 'Please fill in the required field' : ''}
          />
        </Grid>
        <Grid item xs={8}>
          <TextField
            variant="outlined"
            label="Description"
            inputProps={{ 'aria-label': 'description' }}
            data-cy="account-description"
            value={merchantDescription}
            fullWidth
            required
            error={isDescriptionFieldEmpty}
            onChange={event => handleMerchantDescriptionInput(event.target.value)}
            helperText={isDescriptionFieldEmpty ? 'Please fill in the required field' : ''}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            variant="outlined"
            label="Statement description"
            data-cy="account-statement-description"
            helperText="Write a clear, brief description that will show up on a payer's card/bank statement. 50 characters maximum"
            value={merchantStatement}
            inputProps={{
              maxLength: 50,
              'aria-label': 'statement description',
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <Tooltip title="Payer Statement and Receipt Description" className={classes.tooltip}>
                    <InfoOutlinedIcon htmlColor="grey" fontSize="small" />
                  </Tooltip>
                </InputAdornment>
              ),
            }}
            fullWidth
            required
            error={isStatementFieldEmpty}
            onChange={event => handleMerchantStatementInput(event.target.value)}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            variant="outlined"
            inputProps={{ 'aria-label': 'support email' }}
            label="Support email"
            value={supportEmail}
            fullWidth
            required
            error={isSupportEmailValid}
            onChange={event => handleSupportEmailInput(event.target.value)}
            helperText={isSupportEmailValid ? 'Please enter in a valid email address' : ''}
          />
        </Grid>
      </Grid>
      <Typography variant="h6">Add your refund policy</Typography>
      <Typography variant="subtitle1" gutterBottom>
        You can add this information later
      </Typography>
      <TextField
        multiline
        inputProps={{ 'aria-label': 'refund policy' }}
        variant="outlined"
        rows="15"
        data-cy="refund-policy"
        placeholder="Type or paste your policy"
        value={refundPolicy}
        fullWidth
        onChange={event => handleRefundPolicyInput(event.target.value)}
      />
    </Box>
  );
};

export default OnboardMerchantAccount;
