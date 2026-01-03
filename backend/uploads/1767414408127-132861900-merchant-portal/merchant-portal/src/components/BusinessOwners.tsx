import React from 'react';
import { Grid, Typography, Theme, Divider, Chip } from '@mui/material';
import { createStyles, makeStyles } from '@mui/styles';
import CheckIcon from '@mui/icons-material/Check';
import ScheduleIcon from '@mui/icons-material/Schedule';
import ErrorIcon from '@mui/icons-material/Error';
import { Person, AccountPersonalVerificationStatus } from '../gql-types.generated';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    header: {
      marginBottom: theme.spacing(2),
    },
    businessOwner: {
      margin: theme.spacing(1, 0),
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

interface BusinessOwnersProps {
  additionalReps: Person[] | null | undefined;
}

const BusinessOwners: React.FC<BusinessOwnersProps> = props => {
  const classes = useStyles();
  const { additionalReps } = props;

  const getChip = (rep: Person) => {
    const status = rep.verification ? rep.verification.status : AccountPersonalVerificationStatus.Unspecified;
    //If status is bad, return the bad chip
    if (status === AccountPersonalVerificationStatus.Unverified) {
      return <Chip className={classes.badChip} label="Not Enabled" icon={<ErrorIcon className={classes.badChip} />} />;
    }
    //If status is pending, return the pending chip.
    if (status === AccountPersonalVerificationStatus.Pending) {
      return <Chip className={classes.pendingChip} label="Pending" icon={<ScheduleIcon />} />;
    }
    //If status is unknown or unspecified, return the pending chip.
    //If statement is kept here in case we want to show a different chip for the unknown/unspecified statuses.
    if (status === AccountPersonalVerificationStatus.Unspecified) {
      return <Chip className={classes.pendingChip} label="Pending" icon={<ScheduleIcon />} />;
    }
    //Return the verified chip
    return <Chip className={classes.goodChip} label="Verified" icon={<CheckIcon className={classes.goodChip} />} />;
  };

  const renderBusinessOwners = (
    reps: Person[] | null | undefined,
    classes: Record<'header' | 'businessOwner' | 'divider', string>,
  ) => {
    if (!reps) return <></>;

    const nonNullReps = reps.filter(r => !!r) as Person[];

    return nonNullReps.map((rep: Person, index: number, arr: Person[]) => {
      const keyFirstName = rep.firstName ? rep.firstName : index;
      const keyComplete = rep.lastName ? keyFirstName + rep.lastName : keyFirstName;

      if (index < arr.length - 1) {
        return (
          <Grid container key={index} tabIndex={0}>
            <Grid key={keyComplete} container item className={classes.businessOwner}>
              <Grid item xs={12} lg={4}>
                <Typography variant="body1">{`${rep?.firstName} ${rep?.lastName}`}</Typography>
              </Grid>
              <Grid item xs={12} lg={8}>
                {getChip(rep)}
              </Grid>
            </Grid>
            <Divider className={classes.divider} />
          </Grid>
        );
      }

      return (
        <Grid container key={index} tabIndex={0}>
          <Grid key={keyComplete} container item className={classes.businessOwner}>
            <Grid item xs={12} sm={6} lg={4}>
              <Typography variant="body1">{`${rep?.firstName} ${rep?.lastName}`}</Typography>
            </Grid>
            <Grid item xs={12} sm={6} lg={8}>
              {getChip(rep)}
            </Grid>
          </Grid>
        </Grid>
      );
    });
  };

  return (
    <Grid container role="region" aria-label="Business Owners">
      <Grid container item xs={12} className={classes.header}>
        <Grid container item xs={6}>
          <Typography variant="subtitle">Business Owners</Typography>
        </Grid>
      </Grid>
      {renderBusinessOwners(additionalReps, classes)}
    </Grid>
  );
};

export default BusinessOwners;
