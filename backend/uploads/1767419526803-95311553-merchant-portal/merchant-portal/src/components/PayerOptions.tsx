import { Checkbox, Grid, Theme, Typography } from '@mui/material';
import { createStyles, makeStyles } from '@mui/styles';
import React, { useEffect, useState } from 'react';
import { AppRole, TenantAccount } from '../gql-types.generated';
import GridItem from './GridItem';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
    },
    header: {
      marginBottom: theme.spacing(2),
    },
  }),
);

interface PayerOptionsProps {
  tenantAccount: TenantAccount | undefined;
  updatingPayerOptions: boolean;
  handleUpdatePartialReason: (partialReasonRequired: boolean) => void;
  viewerAppRole?: AppRole;
}

const PayerOptions: React.FC<PayerOptionsProps> = props => {
  const { tenantAccount, updatingPayerOptions, handleUpdatePartialReason, viewerAppRole } = props;
  const classes = useStyles();

  const canEdit = viewerAppRole === AppRole.Admin || viewerAppRole === AppRole.Editor;

  const [isChecked, setIsChecked] = useState<boolean>(!!tenantAccount?.settings?.options?.payments?.requirePartialPaymentReason);

  useEffect(() => {
    setIsChecked(!!tenantAccount?.settings?.options?.payments?.requirePartialPaymentReason);
  }, [tenantAccount]);

  const handleCheckedChange = (value: boolean) => {
    setIsChecked(value);
    handleUpdatePartialReason(value);
  };

  return (
    <Grid container className={classes.root} data-cy="business-information-section" aria-label="Payer Options" role="region">
      <Typography className={classes.header} variant="subtitle">
        Payer Options
      </Typography>
      <GridItem
        name={'REQUIRE REASON FOR PARTIAL PAYMENTS'}
        value={
          <Checkbox
            color="primary"
            checked={isChecked}
            onChange={event => {
              handleCheckedChange(event.target.checked);
            }}
            disabled={updatingPayerOptions || !canEdit}
          />
        }
      />
    </Grid>
  );
};

export default PayerOptions;
