import { Theme, Grid, Typography, Divider, Chip } from '@mui/material';
import { createStyles, makeStyles } from '@mui/styles';
import CheckIcon from '@mui/icons-material/Check';
import ScheduleIcon from '@mui/icons-material/Schedule';
import ErrorIcon from '@mui/icons-material/Error';
import React from 'react';

import {
  TenantAccount,
  CompanyVerificationStatus,
  CapabilityStatus,
  Person,
  AccountPersonalVerificationStatus,
} from '../gql-types.generated';
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
    divider: {
      width: '100%',
    },
    goodChip: {
      '&.MuiChip-icon': {
        color: theme.palette.success.dark,
      },
      color: theme.palette.success.dark,
      backgroundColor: theme.palette.success.light,
    },
    badChip: {
      '&.MuiChip-icon': {
        color: theme.palette.error.main,
      },
      color: theme.palette.error.main,
      backgroundColor: theme.palette.error.light,
    },
    pendingChip: {
      '&.MuiChip-icon': {
        color: '#0000008A',
      },
      color: '#0000008A',
      backgroundColor: '#00000014',
    },
  }),
);

interface AccountStatusProps {
  tenantAccount: TenantAccount | undefined;
  primaryAccountHolder: Person | undefined;
  additionalReps: Person[];
}

const AccountStatus: React.FC<AccountStatusProps> = props => {
  const { tenantAccount, primaryAccountHolder, additionalReps } = props;
  const classes = useStyles();

  const getChip = (status: CompanyVerificationStatus | CapabilityStatus | AccountPersonalVerificationStatus) => {
    if (
      // If status is bad, return the bad chip
      status === CompanyVerificationStatus.Unverified ||
      status === CapabilityStatus.Inactive ||
      status === AccountPersonalVerificationStatus.Unverified
    ) {
      return <Chip className={classes.badChip} label="Not Enabled" icon={<ErrorIcon className={classes.badChip} />} />;
    }
    if (
      // If status is pending, return the pending chip.
      status === CompanyVerificationStatus.Pending ||
      status === CapabilityStatus.Pending ||
      status === AccountPersonalVerificationStatus.Pending
    ) {
      return <Chip className={classes.pendingChip} label="Pending" icon={<ScheduleIcon />} />;
    }
    if (
      // If status is unknown or unspecified, return the pending chip.
      // If statement is kept here in case we want to show a different chip for the unknown/unspecified statuses.
      status === CompanyVerificationStatus.Unspecified ||
      status === CapabilityStatus.Unknown ||
      status === AccountPersonalVerificationStatus.Unspecified
    ) {
      return <Chip className={classes.pendingChip} label="Pending" icon={<ScheduleIcon />} />;
    }
    // Return the verified chip
    return <Chip className={classes.goodChip} label="Verified" icon={<CheckIcon className={classes.goodChip} />} />;
  };

  const getAdditionalRepsChip = (additionalReps: Person[]) => {
    let numUnverified = 0;
    let numPending = 0;
    let numUnspecified = 0;
    additionalReps.forEach(rep => {
      const status = rep.verification ? rep.verification.status : AccountPersonalVerificationStatus.Unspecified;
      if (status === AccountPersonalVerificationStatus.Unverified) {
        numUnverified += 1;
      }
      if (status === AccountPersonalVerificationStatus.Pending) {
        numPending += 1;
      }
      if (status === AccountPersonalVerificationStatus.Unspecified) {
        numUnspecified += 1;
      }
    });

    // If we have any unverified business owners, send the bad chip
    if (numUnverified > 0) {
      return (
        <Chip className={classes.badChip} label={`${numUnverified} Not Verified`} icon={<ErrorIcon className={classes.badChip} />} />
      );
    }
    // If we have some owners that are pending, send the pending chip
    if (numPending > 0) {
      return <Chip className={classes.pendingChip} label="Pending" icon={<ScheduleIcon />} />;
    }
    // If we have some owners that are unspecified, send the pending chip
    // This code block is kept here in case we choose to show a different chip for unspecified owners.
    if (numUnspecified > 0) {
      return <Chip className={classes.pendingChip} label="Pending" icon={<ScheduleIcon />} />;
    }
    // Send the good chip if all the owners are verified
    return <Chip className={classes.goodChip} label="Verified" icon={<CheckIcon className={classes.goodChip} />} />;
  };

  const entityStatus =
    tenantAccount && tenantAccount?.company?.verification
      ? tenantAccount.company.verification.status
      : CompanyVerificationStatus.Pending;

  const cardPaymentsStatus =
    tenantAccount && tenantAccount.capabilities ? tenantAccount.capabilities?.cardPayments : CapabilityStatus.Unknown;

  const payoutsStatus =
    tenantAccount && tenantAccount.capabilities ? tenantAccount.capabilities.accountPayouts : CapabilityStatus.Unknown;

  const primaryAccountHolderStatus =
    primaryAccountHolder && primaryAccountHolder.verification
      ? primaryAccountHolder.verification.status
      : AccountPersonalVerificationStatus.Pending;

  const entityInfoChip = getChip(entityStatus);
  const cardPaymentsChip = getChip(cardPaymentsStatus);
  const payoutsChip = getChip(payoutsStatus);
  const primaryAccountHolderChip = getChip(primaryAccountHolderStatus);
  const additionalRepsChip = getAdditionalRepsChip(additionalReps);

  return (
    <Grid container className={classes.root} data-cy="account-status" role="region" aria-label="Account Status">
      <Typography className={classes.header} variant="subtitle">
        Account Status
      </Typography>
      <GridItem name={'ENTITY INFORMATION'} value={entityInfoChip} cy="entity-status-chip" />
      <Divider className={classes.divider} />
      <GridItem name={'PAYMENTS'} value={cardPaymentsChip} cy="payments-status-chip" />
      <Divider className={classes.divider} />
      <GridItem name={'PAYOUTS'} value={payoutsChip} cy="payouts-status-chip" />
      <Divider className={classes.divider} />
      <GridItem name={'PRIMARY ACCOUNT HOLDER'} value={primaryAccountHolderChip} cy="primary-account-holder-status-chip" />
      {additionalReps.length > 0 && (
        <>
          <Divider className={classes.divider} />
          <GridItem name={'PRIMARY BUSINESS OWNERS'} value={additionalRepsChip} />
        </>
      )}
    </Grid>
  );
};

export default AccountStatus;
