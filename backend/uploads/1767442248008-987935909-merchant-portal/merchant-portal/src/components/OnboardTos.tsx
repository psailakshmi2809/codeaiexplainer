import { Box, TextField, Typography, Link } from '@mui/material';
import React from 'react';
import { CountryCode } from '../gql-types.generated';

interface OnboardTosProps {
  handleNameInput: (name: string) => void;
  isSignerFieldEmpty: boolean;
  tenantAccountCountry: CountryCode;
}

const OnboardTos: React.FC<OnboardTosProps> = props => {
  const { handleNameInput, isSignerFieldEmpty, tenantAccountCountry } = props;
  const handleNewName = (event: { target: { value: string } }) => {
    handleNameInput(event.target.value);
  };
  const tosLink = 'https://legal.aptean.com/#contract-h1xrqqklv';

  return (
    <Box mx={4} my={2}>
      <Typography variant="body1" gutterBottom>
        By typing your name and clicking Finish, you have read and agree to our
        <Link underline={'hover'} href={tosLink} target="_blank">
          {' terms of service '}
        </Link>
        and
        {tenantAccountCountry && (
          <Link
            underline={'hover'}
            href={
              tenantAccountCountry === CountryCode.Us
                ? `${process.env.REACT_APP_MERCHANT_PORTAL_BASE_URL}/fee-schedules/fee-schedule-us.pdf`
                : `${process.env.REACT_APP_MERCHANT_PORTAL_BASE_URL}/fee-schedules/fee-schedule-ca.pdf`
            }
            target="_blank"
          >
            {' fee schedule'}
          </Link>
        )}
        .
      </Typography>
      <Box mt={4} width={266}>
        <TextField
          label="Name"
          inputProps={{ 'aria-label': 'name' }}
          variant="outlined"
          data-cy="tos-name"
          required
          error={isSignerFieldEmpty}
          onChange={handleNewName}
          fullWidth
          helperText={isSignerFieldEmpty ? 'Please fill in the required field' : ''}
        />
      </Box>
    </Box>
  );
};

export default OnboardTos;
