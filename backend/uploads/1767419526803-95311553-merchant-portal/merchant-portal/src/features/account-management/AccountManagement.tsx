import { Box, Divider, Grid, Paper, Theme, Typography } from '@mui/material';
import { createStyles, makeStyles } from '@mui/styles';
import WarningIcon from '@mui/icons-material/Warning';
import { FC, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import AccountStatus from '../../components/AccountStatus';
import BusinessInformation from '../../components/BusinessInformation';
import BusinessOwners from '../../components/BusinessOwners';
import { AccountRequirements } from '../../gql-types.generated';
import {
  selectFeeSchedule,
  selectTenantAccount,
  selectNetworkBusy,
  selectViewerUser,
  selectTenantId,
  selectTenantSupportedCapabilities,
} from '../app/AppSlice';
import { selectAccountRequirements } from '../home/HomeSlice';
import { fetchUserList } from '../user-management/UserManagementActions';
import { selectBusinessOwners, selectPrimaryAccountHolder } from '../user-management/UserManagementSlice';
import {
  uploadLogo,
  upsertBusinessUrl,
  upsertBusinessName,
  upsertPayerOptions,
  upsertRefundPolicy,
  upsertStatementDescription,
  upsertSupportEmail,
} from './AccountManagementActions';
import PayerOptions from '../../components/PayerOptions';
import { Helmet } from 'react-helmet';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
      flexFlow: 'column nowrap',
      flex: 1,
      height: '100%',
      minHeight: 350,
    },
    header: {
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      textAlign: 'start',
      padding: theme.spacing(2.5),
    },
    headerWarning: {
      color: theme.palette.error.main,
      display: 'flex',
      alignItems: 'flex-end',
    },
    headerWarningIcon: {
      marginRight: theme.spacing(2),
    },
    grid: {
      padding: theme.spacing(3),
    },
    item: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      border: `1px solid ${theme.palette.uxGrey.border}`,
      borderRadius: 10,
      minHeight: 100,
      padding: theme.spacing(3, 2),
      marginBottom: theme.spacing(3),
    },
  }),
);

const AccountManagement: FC = () => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const viewerUser = useSelector(selectViewerUser);
  const tenantAccount = useSelector(selectTenantAccount);
  const feeSchedule = useSelector(selectFeeSchedule);
  const accountRequirements = useSelector(selectAccountRequirements);
  const networkBusy = useSelector(selectNetworkBusy);

  const businessOwnersList = useSelector(selectBusinessOwners);
  const primaryAccountHolder = useSelector(selectPrimaryAccountHolder);
  const tenantId = useSelector(selectTenantId);

  const tenantSupportedCapabilities = useSelector(selectTenantSupportedCapabilities);
  const paymentsDisabled =
    (tenantAccount?.settings?.supportedCapabilities.refundPolicy && !tenantAccount.settings.cardPayments?.refundPolicy) ||
    (tenantAccount?.settings?.supportedCapabilities.website && !tenantAccount.businessProfile?.url);

  useEffect(() => {
    // Fetch the users to display business owner information.
    console.log('[0] retrieving user list for business owner info');
    dispatch(fetchUserList());
  }, [tenantAccount]);

  const handleNewRefundPolicy = (refundPolicy: string) => {
    dispatch(upsertRefundPolicy(refundPolicy));
  };
  const handleNewLogo = (logo: File, highResLogo?: File) => {
    dispatch(uploadLogo(logo, highResLogo));
  };
  const handleNewStatementDescription = (statementDescription: string) => {
    dispatch(upsertStatementDescription(statementDescription));
  };
  const handleNewBusinessUrl = (businessUrl: string) => {
    dispatch(upsertBusinessUrl(businessUrl));
  };
  const handleNewSupportEmail = (supportEmail: string) => {
    dispatch(upsertSupportEmail(supportEmail));
  };
  const handleNewBusinessName = (businessName: string) => {
    dispatch(upsertBusinessName(businessName));
  };

  const handleUpdatePartialReason = (partialReasonRequired: boolean) => {
    dispatch(upsertPayerOptions(partialReasonRequired));
  };

  const findRequiredSettings = (accountRequirements: AccountRequirements | undefined): string[] => {
    if (!accountRequirements) {
      return [];
    }
    const { currentlyDue, pastDue, pendingVerification } = accountRequirements;
    const needed = [] as string[];
    pastDue?.forEach(item => {
      if (!item.includes('verification') && !pendingVerification?.includes(item)) {
        needed.push(item);
      }
    });
    currentlyDue?.forEach(item => {
      if (!item.includes('verification') && !pendingVerification?.includes(item) && !needed.includes(item)) {
        needed.push(item);
      }
    });
    return needed;
  };
  const requiredSettings = findRequiredSettings(accountRequirements);
  return (
    <Paper className={classes.root} role="region" aria-label="Account Settings">
      <Helmet>
        <meta name="ai:viewId" content="account-management"></meta>
        <meta name="ai:viewDescription" content="Aptean Pay Merchant Portal - Account Management"></meta>
        <title>Aptean Pay Merchant Portal - Account Management</title>
      </Helmet>
      <Box>
        <Box className={classes.header}>
          <Typography variant="title">Account Settings</Typography>
          {(paymentsDisabled || requiredSettings.length > 0) && (
            <Typography variant="body1" className={classes.headerWarning}>
              <WarningIcon className={classes.headerWarningIcon} /> Please add all required data indicated in red to receive payments
            </Typography>
          )}
        </Box>
        <Divider />
        <Grid item className={classes.grid} container spacing={3}>
          <Grid item xs={12} lg={6}>
            <Box className={classes.item}>
              <BusinessInformation
                tenantAccount={tenantAccount}
                handleNewRefundPolicy={handleNewRefundPolicy}
                handleNewStatementDescription={handleNewStatementDescription}
                feeSchedule={feeSchedule}
                networkBusy={networkBusy}
                handleNewLogo={handleNewLogo}
                handleNewBusinessUrl={handleNewBusinessUrl}
                handleNewSupportEmail={handleNewSupportEmail}
                viewerAppRole={viewerUser?.relationship?.role}
                tenantId={tenantId}
                handleNewBusinessName={handleNewBusinessName}
                supportedCapabilities={tenantSupportedCapabilities}
              />
            </Box>
          </Grid>
          <Grid item xs={12} lg={6}>
            {tenantAccount?.settings?.features?.paymentRequests?.partialPayment && (
              <Box className={classes.item}>
                <PayerOptions
                  tenantAccount={tenantAccount}
                  updatingPayerOptions={networkBusy}
                  handleUpdatePartialReason={handleUpdatePartialReason}
                  viewerAppRole={viewerUser?.relationship?.role}
                />
              </Box>
            )}
            {!!tenantSupportedCapabilities?.accountStatus && (
              <Box className={classes.item}>
                <AccountStatus
                  tenantAccount={tenantAccount}
                  primaryAccountHolder={primaryAccountHolder}
                  additionalReps={businessOwnersList}
                />
              </Box>
            )}
            {!!tenantSupportedCapabilities?.businessOwners && businessOwnersList.length > 0 && (
              <Box className={classes.item}>
                <BusinessOwners additionalReps={businessOwnersList} />
              </Box>
            )}
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

export default AccountManagement;
