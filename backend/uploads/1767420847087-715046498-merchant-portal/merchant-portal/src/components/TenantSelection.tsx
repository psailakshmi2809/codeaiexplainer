import { Grid, Theme, Typography, Paper, useMediaQuery, useTheme, Card, CardActionArea } from '@mui/material';
import { createStyles, makeStyles } from '@mui/styles';
import React from 'react';
import { LoginContext, TenantAccount } from '../gql-types.generated';
import logoReplacement from '../logoReplacement.svg';
import { Helmet } from 'react-helmet';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    tenantSelectionPageWrap: {
      padding: theme.spacing(7, 12),
      alignContent: 'start',
    },
    tenantSelectionPageWrapSm: {
      padding: theme.spacing(5, 4),
      alignContent: 'start',
    },
    tenantSelection: {
      padding: theme.spacing(2, 0, 1, 0),
    },
    tenantCard: {
      width: '100%',
      height: '100%',
      textTransform: 'none',
    },
    tenantLogo: {
      maxHeight: 48,
    },
    containerHeight: {
      minHeight: 50,
      maxHeight: 50,
      alignContent: 'center',
      justifyContent: 'center',
    },
    merchantName: {
      fontSize: '1.5rem',
      fontWeight: 500,
      lineHeight: 1.334,
      letterSpacing: '0em',
    },
    merchantLogo: {
      maxHeight: 48,
      maxWidth: 96,
    },
    merchantTotalDue: {
      fontWeight: 300,
      fontSize: '2.125rem',
      lineHeight: 1.235,
      letterSpacing: '0.00735em',
    },
    merchantUnpaidInvoices: {
      fontWeight: 500,
      color: '#0000008A',
    },
    viewDetailsContainer: {
      paddingTop: theme.spacing(2),
    },
    viewDetailsText: {
      fontWeight: 500,
      fontSize: '0.875rem',
      color: '#276EF1',
      padding: 0,
      margin: 0,
      textAlign: 'center',
    },
    merchantGridCard: {
      minWidth: 390,
    },
    merchantCard: {
      padding: theme.spacing(2),
      textAlign: 'initial',
      border: '1px solid #CCCCCC',
      '&:hover': {
        border: '1px solid #276EF1',
      },
    },
    nameContainer: {
      width: 'calc(100% - 100px)',
      minHeight: 50,
      maxHeight: 50,
      alignContent: 'center',
    },
    logoContainer: {
      width: '96px',
    },
    balanceDue: {
      paddingTop: theme.spacing(2),
    },
    balanceDueText: {
      fontSize: '1.25rem',
      fontWeight: 500,
      lineHeight: 1.6,
      letterSpacing: '0.0075em',
    },
  }),
);

interface TenantSelectionProps {
  onSelectTenantAccount: (id: string) => void;
  loginContext: LoginContext;
}
const TenantSelection: React.FC<TenantSelectionProps> = props => {
  const { onSelectTenantAccount, loginContext } = props;
  const classes = useStyles();
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.down('lg'));
  const accounts = loginContext?.accounts;

  return (
    <Grid
      data-cy="company-card-select"
      aria-label="merchant"
      role="list"
      container
      className={matches ? classes.tenantSelectionPageWrapSm : classes.tenantSelectionPageWrap}
    >
      <Helmet>
        <meta name="ai:viewId" content="/"></meta>
        <meta name="ai:viewDescription" content="Aptean Pay Merchant Portal - Tenant Selection"></meta>
        <title>Aptean Pay Merchant Portal - Tenant Selection</title>
      </Helmet>
      <Grid item xs={12}>
        <Typography variant={'h5'}>Select a company to view</Typography>
      </Grid>
      <Grid container spacing={3} className={classes.tenantSelection}>
        {accounts &&
          accounts.map((account: TenantAccount, i) => {
            return (
              <Grid item lg={3} md={4} sm={6} xs={12} key={account?.id} role="listitem">
                <Card variant="outlined">
                  <CardActionArea
                    data-cy={`company-card-${i}`}
                    className={classes.tenantCard}
                    aria-label={`company card ${account?.businessProfile?.name || account?.company?.name || i}`}
                    onClick={() => {
                      onSelectTenantAccount(account?.owner?.tenantId);
                    }}
                    color={'inherit'}
                  >
                    <Paper className={classes.merchantCard}>
                      <Grid item container xs={12}>
                        <Grid item container className={classes.nameContainer}>
                          <Typography className={classes.merchantName} noWrap>
                            {account?.businessProfile?.name || account?.company?.name || ''}
                          </Typography>
                        </Grid>
                        <Grid item container justifyContent="flex-end" className={classes.logoContainer}>
                          <img
                            className={classes.merchantLogo}
                            alt={`company card ${i} logo`}
                            data-cy={`company-card-${i}-logo`}
                            src={account?.businessProfile?.logoUrl || logoReplacement}
                          />
                        </Grid>
                      </Grid>
                      {!!account?.settings?.supportedCapabilities.accountBalance && (
                        <>
                          <Grid item xs={12} className={classes.balanceDue}>
                            <Typography gutterBottom className={classes.balanceDueText}>
                              Total Account Balance
                            </Typography>
                          </Grid>
                          <Grid item container xs={12}>
                            <Grid item xs={11}>
                              <Typography className={classes.merchantTotalDue} noWrap gutterBottom>
                                {new Intl.NumberFormat('en', {
                                  style: 'currency',
                                  currency: account?.balances?.currentBalance?.currency || account?.defaultCurrency || 'USD',
                                  currencyDisplay: 'symbol',
                                  maximumFractionDigits: 0,
                                }).format((account?.balances?.currentBalance?.amount || 0) / 100)}
                              </Typography>
                            </Grid>
                          </Grid>
                        </>
                      )}
                      <Grid item container xs={12} className={classes.viewDetailsContainer}>
                        <Grid item container xs={7} alignContent="center">
                          <Typography variant="body2" className={classes.merchantUnpaidInvoices}>{`${
                            account?.merchantSummary?.paymentsDueToday || 0
                          } Payment(s) due today`}</Typography>
                        </Grid>
                        <Grid item container xs={5} justifyContent="flex-end">
                          <Typography className={classes.viewDetailsText}>VIEW DETAILS</Typography>
                        </Grid>
                      </Grid>
                    </Paper>
                  </CardActionArea>
                </Card>
              </Grid>
            );
          })}
      </Grid>
    </Grid>
  );
};

export default TenantSelection;
