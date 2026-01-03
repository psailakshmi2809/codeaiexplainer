import 'core-js-pure/stable';
import 'regenerator-runtime/runtime';
import { Alert, Grid, Paper, Snackbar, Theme, Typography, useMediaQuery } from '@mui/material';
import { createStyles, makeStyles } from '@mui/styles';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Redirect, Route, Switch, useLocation } from 'react-router-dom';
import CheckIcon from '@mui/icons-material/Check';
import { ProtectedRoute } from '../../components/ProtectedRoute';
import PrimaryAppBar from '../../components/PrimaryAppBar';
import TenantSelection from '../../components/TenantSelection';
import AccountManagement from '../account-management/AccountManagement';
import Home from '../home/Home';
import UserManagement from '../user-management/UserManagement';
import { CustomerManagement } from '../customers-management/CustomerManagement';
import {
  AUTH_MODE,
  BYPASS_PTT_ONBOARDING,
  SLO_LOCALSTORAGE_ID,
  SLO_POSTLOGOUT_URL,
  SSO_SESSIONSTORAGE_ID,
} from '../../util/Constants';
import { fetchLoginContext, fetchTenantAccount, fetchViewerUserByEmail } from './AppActions';
import {
  fetchHasConnectivityIssue,
  fetchIsTenantMenuOpen,
  fetchKeycloakToken,
  fetchSelectedTenantId,
  fetchUserNoEmail,
  selectAppError,
  selectCurrentBalances,
  selectDefaultCurrency,
  selectHasConnectivityIssue,
  selectIsTenantMenuOpen,
  selectLoginContext,
  selectNetworkBusy,
  selectPaymentRequestSuccessMessage,
  selectQueryPersonErrors,
  selectQueryTenantErrors,
  selectSelectedTenantId,
  selectTenantAccount,
  selectTenantSupportedCapabilities,
  selectUserNoEmail,
  selectViewerUser,
} from './AppSlice';
import Help from '../help/Help';
import { AppRole, CompanyVerificationStatus, PayFac, Person } from '../../gql-types.generated';
import ConnectivityIssueDetails from '../../components/ConnectivityIssueDetails';
import { captureReloadAfterNameChange, selectReloadAfterNameChange } from '../account-management/AccountManagementSlice';
import PaymentRequest from '../payment-request/PaymentRequest';
import AccountPreferences from '../account-preferences/AccountPreferences';
import PaymentVirtualTerminal from '../virtual-terminal/PaymentVirtualTerminal';
import Breadcrumbs from '../../components/Breadcrumbs';
import { RoutePath } from '../../util/Routes';
import {
  selectGenerateStatementAccessUrl,
  selectGenerateStatementAccessUrlError,
  selectGenerateStatementAccessUrlInFlight,
  selectLastTabPath,
  selectPayoutReport,
  selectPayoutReportError,
  selectPayoutReportInFlight,
} from '../home/HomeSlice';
import TenantMenu from '../../components/TenantMenu';
import theme from '../../Theme';
import MerchantPttOnboarding from '../merchant-ptt-onboarding/MerchantPttOnboarding';
import { AuthMode, UserLogoutData } from '../../util/ApteanSSOProvider';
import { useAuth } from 'react-oidc-context';
import { isArray } from '@chakra-ui/utils';
import { b2cAuthProvider } from '../../util/AuthProvider';
import { Helmet } from 'react-helmet';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    paper: {
      padding: theme.spacing(2),
      textAlign: 'center',
      color: theme.palette.text.secondary,
    },
    root: {
      height: '100vh',
      maxHeight: '100vh',
      width: '100%',
      maxWidth: '100%',
      margin: 0,
      padding: 0,
      display: 'flex',
      flexDirection: 'column',
    },
    desktopWrap: {
      paddingTop: theme.spacing(3),
    },
    snackBar: {
      minWidth: '100%',
      justifyContent: 'center',
    },
    snackBarMobile: {
      minWidth: '100%',
      justifyContent: 'center',
      left: 0,
      right: 0,
      bottom: 0,
    },
    snackBarAlert: {
      minWidth: '100%',
      justifyContent: 'center',
      fontWeight: 500,
      color: theme.palette.success.main,
    },
    crumbsWidthWrap: {
      width: '85%',
      [theme.breakpoints.down(1076)]: {
        width: '90%',
      },
      [theme.breakpoints.down(956)]: {
        width: '100%',
      },
    },
    crumbsWidthWrapPayment: {
      width: '100%',
      [theme.breakpoints.down(1250)]: {
        marginLeft: 24,
      },
      [theme.breakpoints.down(600)]: {
        marginLeft: 0,
      },
    },
    crumbsWrap: {
      paddingLeft: theme.spacing(0),
      padding: theme.spacing(1),
      paddingBottom: theme.spacing(1),
    },
    withMenuOpen: {
      marginLeft: 374,
      transitionProperty: 'margin-left',
    },
    loadingGridItem: {
      width: 100,
      paddingTop: theme.spacing(2),
    },
    errorGridItem: {
      paddingTop: theme.spacing(2),
      width: 400,
    },
    canvas: {
      height: '100%',
    },
  }),
);

const App: React.FC = () => {
  const auth = useAuth();
  const classes = useStyles();
  const dispatch = useDispatch();
  const location = useLocation();
  const loginContext = useSelector(selectLoginContext);
  const selectedTenantId = useSelector(selectSelectedTenantId);
  const tenantAccount = useSelector(selectTenantAccount);
  // Do not allow onboarding to be shown just yet if no login context is gathered.
  const isOnboarded = !!tenantAccount?.tosAcceptance;
  const viewerUser = useSelector(selectViewerUser);
  const networkBusy = useSelector(selectNetworkBusy);
  const appError = useSelector(selectAppError);
  const userNoEmail = useSelector(selectUserNoEmail);
  const queryTenantErrors = useSelector(selectQueryTenantErrors);
  const queryPersonErrors = useSelector(selectQueryPersonErrors);
  const isTenantMenuOpen = useSelector(selectIsTenantMenuOpen);
  const currentBalances = useSelector(selectCurrentBalances);
  const defaultCurrency = useSelector(selectDefaultCurrency);
  const hasConnectivityIssue = useSelector(selectHasConnectivityIssue);
  const reloadAfterNameChange = useSelector(selectReloadAfterNameChange);
  const lastTabPath = useSelector(selectLastTabPath);
  const statementUrl = useSelector(selectGenerateStatementAccessUrl);
  const statementUrlError = useSelector(selectGenerateStatementAccessUrlError);
  const isFetchingStatementUrl = useSelector(selectGenerateStatementAccessUrlInFlight);
  const report = useSelector(selectPayoutReport);
  const reportError = useSelector(selectPayoutReportError);
  const isFetchingPayoutUrl = useSelector(selectPayoutReportInFlight);
  const paymentRequestSuccessMessage = useSelector(selectPaymentRequestSuccessMessage);
  const tenantSupportedCapabilities = useSelector(selectTenantSupportedCapabilities);
  const [displayPaymentRequestSuccessful, setDisplayPaymentRequestSuccessful] = useState(false);
  const matchesMdDown = useMediaQuery(theme.breakpoints.down('md'));
  const matchesLgUp = useMediaQuery(theme.breakpoints.up('lg'));
  const matchesSmDown = useMediaQuery(theme.breakpoints.down('sm'));
  const originalTenantId = selectedTenantId;
  const locationIsPayment = location.pathname === RoutePath.Payment;
  const locationIsHome = (location.pathname === '/' ||
    location.pathname === RoutePath.Home ||
    location.pathname === RoutePath.Payments ||
    location.pathname === RoutePath.Requests) as boolean;
  const anchorOrigin: { vertical: 'bottom' | 'top'; horizontal: 'center' | 'left' | 'right' } = {
    vertical: 'bottom',
    horizontal: 'center',
  };
  const handleOffline = () => {
    dispatch(fetchHasConnectivityIssue(true));
  };
  const handleOnline = () => {
    dispatch(fetchHasConnectivityIssue(false));
  };
  const checkConnection = async () => {
    if (!window.navigator.onLine) {
      if (!hasConnectivityIssue) handleOffline();
      return;
    }
    try {
      const res = await fetch('/pixel.png', { cache: 'no-store' });
      if (res && hasConnectivityIssue) handleOnline();
    } catch (e: unknown) {
      if (!hasConnectivityIssue) handleOffline();
    }
  };

  const logoutUserUsingFrontChannel = () => {
    window.addEventListener('storage', async event => {
      const ssoNewValue = event.newValue;
      if (event.key === SLO_LOCALSTORAGE_ID && ssoNewValue !== null) {
        const ssoData = JSON.parse(ssoNewValue) as UserLogoutData;
        // Get the session data from the session storage as the current auth client is already invalid by the time this event is triggered.
        const session = sessionStorage.getItem(SSO_SESSIONSTORAGE_ID);
        const sessionData = JSON.parse(session || '{}');
        const authData: UserLogoutData = { sid: sessionData?.profile?.sid || '', iss: sessionData?.profile?.iss || '' };
        if (ssoData.iss === authData.iss && ssoData.sid === authData.sid) {
          localStorage.removeItem(SLO_LOCALSTORAGE_ID);
          // clear session storage
          sessionStorage.removeItem(SSO_SESSIONSTORAGE_ID);
          window.location.href = window.location.origin + SLO_POSTLOGOUT_URL;
        }
      }
    });
  };
  useEffect(() => {
    logoutUserUsingFrontChannel();
  }, []);

  if (AUTH_MODE === AuthMode.B2C) {
    useEffect(() => {
      // fetch user info
      b2cAuthProvider?.getIdToken().then(val => {
        console.log('[0] fetching user');
        const potentialEmail = val.idToken.claims.emails ? val.idToken.claims.emails[0] : null;
        if (potentialEmail) {
          dispatch(fetchLoginContext());
        } else {
          dispatch(fetchUserNoEmail(true));
        }
      });
    }, []);
  } else {
    let totalPasses = 0;
    useEffect(() => {
      totalPasses += 1;
      console.log(`[0] App.tsx useEffect totalPasses: ${totalPasses}`);
      if (auth.isAuthenticated) {
        console.log('[0] fetching user');
        console.log(auth.user?.profile?.email);
        dispatch(fetchKeycloakToken(auth.user?.access_token));
        // eslint-disable-next-line no-nested-ternary
        const potentialEmail = auth.user?.profile?.email
          ? auth.user?.profile?.email
          : auth.user?.profile?.emails && isArray(auth.user?.profile?.emails) && auth.user?.profile?.emails.length > 0
          ? auth.user?.profile?.emails[0]
          : null;
        //const potentialEmail = 'abbey.gwayambadde@aptean.com';
        if (potentialEmail) {
          dispatch(fetchLoginContext());
        } else {
          dispatch(fetchUserNoEmail(true));
        }
      }
    }, [auth.isAuthenticated]);
  }

  useEffect(() => {
    // fetch user info
    if (loginContext && originalTenantId !== selectedTenantId) {
      if (loginContext?.email) {
        dispatch(fetchViewerUserByEmail(loginContext?.email));
      } else {
        dispatch(fetchUserNoEmail(true));
      }
    }
  }, []);

  useEffect(() => {
    // Fetch addition data.
    if (viewerUser && selectedTenantId) {
      dispatch(fetchTenantAccount());
    }
  }, [viewerUser]);

  useEffect(() => {
    dispatch(fetchIsTenantMenuOpen(matchesMdDown ? false : isOnboarded));
  }, [isOnboarded]);

  useEffect(() => {
    if (reloadAfterNameChange) {
      dispatch(captureReloadAfterNameChange(false));
    } else if (loginContext?.accounts) {
      if (loginContext?.accounts.length === 1) {
        dispatch(fetchSelectedTenantId(loginContext?.accounts[0].owner.tenantId));
        if (loginContext?.email) {
          dispatch(fetchViewerUserByEmail(loginContext?.email));
        } else {
          dispatch(fetchUserNoEmail(true));
        }
      }
      // If more than one account, no selectedTenantId will be set yet, forcing selection by user.
    }
  }, [loginContext]);

  useEffect(() => {
    if (paymentRequestSuccessMessage) {
      setDisplayPaymentRequestSuccessful(true);
    } else {
      setDisplayPaymentRequestSuccessful(false);
    }
  }, [paymentRequestSuccessMessage]);

  useEffect(() => {
    const connectionIntervalId = setInterval(checkConnection, 60000);

    return () => {
      clearInterval(connectionIntervalId);
    };
  }, []);

  const onSelectTenantAccount = (tenantId: string) => {
    if (tenantId) {
      dispatch(fetchSelectedTenantId(tenantId));
      if (loginContext?.email) {
        dispatch(fetchViewerUserByEmail(loginContext?.email));
      } else {
        dispatch(fetchUserNoEmail(true));
      }
    }
  };
  const handleTenantMenuClose = () => {
    dispatch(fetchIsTenantMenuOpen(false));
  };
  const toggleTenantMenuOpen = () => {
    dispatch(fetchIsTenantMenuOpen(!isTenantMenuOpen));
  };

  const getAppContent = () => {
    if (AUTH_MODE === AuthMode.AIM && !auth.isAuthenticated && !auth.isLoading && !auth.activeNavigator) {
      auth.signinRedirect();
    }

    if (userNoEmail === true) {
      return (
        <Grid container justifyContent={'center'}>
          <Grid item className={classes.errorGridItem}>
            <Paper className={classes.paper}>Email not found. Contact administration.</Paper>
          </Grid>
        </Grid>
      );
    }
    if (appError) {
      // User doesn't have a tenant account but has an authentication token.
      if (
        (!tenantAccount &&
          queryTenantErrors &&
          queryTenantErrors.filter(str => str.includes('Context creation failed: FORBIDDEN [3]: Call is forbidden')).length > 0) ||
        (!tenantAccount &&
          queryPersonErrors &&
          queryPersonErrors.filter(str => str.includes('Context creation failed: FORBIDDEN [4]: Call is forbidden')).length > 0) // The specific error message received is "Context creation failed: FORBIDDEN [x]: Call is forbidden" where is x is a number that differs depending on the query.
      ) {
        return (
          <Grid container justifyContent={'center'}>
            <Grid item className={classes.errorGridItem}>
              <Paper className={classes.paper}>
                <Typography color="textPrimary">{`Oops, looks like we couldn't find your details, please check the email you entered matches the email registered with Aptean Pay.`}</Typography>
              </Paper>
            </Grid>
          </Grid>
        );
      }
      // Error state.
      return (
        <Grid container justifyContent={'center'}>
          <Grid item className={classes.errorGridItem}>
            <Paper className={classes.paper}>
              <Typography color="textPrimary">
                {!tenantAccount
                  ? 'It looks like we had an issue connecting you to our servers. Either your network had a hiccup, or there was an issue on our end. Please try again. If you continue to get this message, contact customer service.'
                  : 'Error!'}
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      );
    }
    if ((!loginContext || !viewerUser || !isOnboarded) && networkBusy) {
      // If no viewerUser or merchant account and the network is busy, show loading.
      return (
        <Grid container justifyContent={'center'}>
          <Grid item className={classes.loadingGridItem}>
            <Paper className={classes.paper}>Loading!</Paper>
          </Grid>
        </Grid>
      );
    }

    if (AUTH_MODE === AuthMode.AIM && !auth?.isAuthenticated) {
      return (
        <Grid>
          <Paper sx={{ padding: theme.spacing(2) }}>
            <Typography variant="subtitle2">Authenticating your account</Typography>
            <Typography>Please wait while your account is being authenticated!</Typography>
          </Paper>
        </Grid>
      );
    }

    if (!tenantAccount && loginContext) {
      return <TenantSelection loginContext={loginContext} onSelectTenantAccount={onSelectTenantAccount} />;
    }

    const requiresPttOnboard =
      tenantAccount?.payFacType === PayFac.Ptt &&
      !tenantAccount?.tosAcceptance &&
      tenantAccount?.company?.verification?.status === CompanyVerificationStatus.Unspecified;

    // Temporary holding page for new ptt merchants that have submitted the onboarding form and are waiting for verification.
    // Also show this page if we are bypassing onboarding (DEV / TST / STG etc).
    if (
      (tenantAccount?.payFacType === PayFac.Ptt &&
        tenantAccount?.company?.verification?.status === CompanyVerificationStatus.Pending) ||
      (requiresPttOnboard && BYPASS_PTT_ONBOARDING === 'true')
    ) {
      return (
        <Grid>
          <Paper sx={{ padding: theme.spacing(2) }}>
            <Typography variant="bodyCallout">
              Processor onboarding is not yet complete, merchant portal capabilities are currently unavailable.
            </Typography>
            <Typography>{`Company Name: ${tenantAccount?.company?.name}`}</Typography>
            <Typography>{`TenantId: ${tenantAccount?.owner.tenantId}`}</Typography>
          </Paper>
        </Grid>
      );
    }

    const userRole = viewerUser?.relationship?.role;

    if (requiresPttOnboard) {
      return <MerchantPttOnboarding />;
    }
    if (isOnboarded) {
      return (
        <Switch>
          {/* Protected Routes */}
          <ProtectedRoute path={RoutePath.CustomerManagement} hasPermission={!!tenantAccount?.settings?.features?.customers?.enabled}>
            <CustomerManagement />
          </ProtectedRoute>
          <ProtectedRoute
            path={RoutePath.Payment}
            hasPermission={!!tenantAccount?.settings?.features?.payments?.virtualTerminal && userRole !== AppRole.Reader}
          >
            <PaymentVirtualTerminal />
          </ProtectedRoute>
          <ProtectedRoute hasPermission={userRole === AppRole.Editor || userRole === AppRole.Admin} path={RoutePath.PaymentRequest}>
            <PaymentRequest />
          </ProtectedRoute>
          {/* Common Routes */}
          <Route path={RoutePath.Settings}>
            <AccountManagement />
          </Route>
          <Route path={RoutePath.AccountManagement}>
            <AccountManagement />
          </Route>
          <Route path={RoutePath.AccountPreferences}>
            <AccountPreferences />
          </Route>
          <Route path={RoutePath.UserManagement}>
            <UserManagement />
          </Route>
          <Route path={RoutePath.Help}>
            <Help />
          </Route>
          <Route exact path={RoutePath.Payments}>
            <Home tabPath={RoutePath.Payments} />
          </Route>
          <Route exact path={RoutePath.Requests}>
            <Home tabPath={RoutePath.Requests} />
          </Route>
          <Route path={RoutePath.Onboarding}>
            <MerchantPttOnboarding />
          </Route>
          <Route path="*">
            <Redirect to={RoutePath.Payments} />
          </Route>
        </Switch>
      );
    }

    return (
      // Remove Wepay onboarding - replace with holding page (as this tenant is invalid)
      <Grid>
        <Paper sx={{ padding: theme.spacing(2) }}>
          <Typography variant="bodyCallout">Onboarding is currently not possible, please contact your account manager.</Typography>
          <Typography>{`Company Name: ${tenantAccount?.company?.name}`}</Typography>
          <Typography>{`TenantId: ${tenantAccount?.owner.tenantId}`}</Typography>
        </Paper>
      </Grid>
    );
  };
  // Only use breadcrumbs when view is mobile size.
  const isMobileSize = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));
  return (
    // Main container for app.
    <Grid container className={classes.root}>
      <Helmet>
        <meta name="ai:productName" content="apteanpay"></meta>
        <meta name="ai:product" content="P3066FO8JM8W24WW9"></meta>
      </Helmet>
      {/* {payment request success} */}
      <Snackbar
        className={matchesSmDown ? classes.snackBarMobile : classes.snackBar}
        open={displayPaymentRequestSuccessful}
        autoHideDuration={5000}
        onClose={() => {
          setDisplayPaymentRequestSuccessful(false);
        }}
        anchorOrigin={anchorOrigin}
      >
        <Alert className={classes.snackBarAlert} icon={<CheckIcon style={{ color: theme.palette.success.dark }} />} severity="success">
          {paymentRequestSuccessMessage}
        </Alert>
      </Snackbar>
      {/* Top AppBar */}
      <PrimaryAppBar
        menuVisible={isTenantMenuOpen}
        loginContext={loginContext}
        handleCompanyChange={onSelectTenantAccount}
        networkBusy={networkBusy}
        isOnboarded={isOnboarded}
        viewerUser={
          viewerUser || loginContext
            ? ({
                firstName: loginContext?.firstName,
                lastName: loginContext?.lastName,
                email: loginContext?.email,
              } as Person)
            : undefined
        }
        balances={currentBalances}
        defaultCurrency={defaultCurrency}
        companyName={tenantAccount?.businessProfile?.name || tenantAccount?.company?.name}
        logoUrl={tenantAccount?.businessProfile?.logoUrl as string}
        handleMenuIconClick={toggleTenantMenuOpen}
        selectedCompanyId={selectedTenantId}
        integrationSettings={tenantAccount?.settings?.integrationSettings}
        showAccountBalance={!!tenantSupportedCapabilities?.accountBalance}
      />
      {/* {Drawer / Hamburger Menu} */}
      <TenantMenu
        isMenuOpen={isTenantMenuOpen}
        handleMenuClose={handleTenantMenuClose}
        tenantAccount={tenantAccount}
        statementUrl={statementUrl}
        statementUrlError={statementUrlError}
        report={report}
        isFetchingStatementUrl={isFetchingStatementUrl}
        isFetchingPayoutUrl={isFetchingPayoutUrl}
        reportError={reportError}
        showStatements={!!tenantSupportedCapabilities?.statements}
        showPayoutReports={!!tenantSupportedCapabilities?.payoutReports}
      />
      <Grid
        item
        container
        flex={1}
        direction={'column'}
        alignSelf={'end'}
        justifySelf={'stretch'}
        width={isTenantMenuOpen && !matchesMdDown ? 'calc(100% - 310px)' : '100%'}
        padding={matchesLgUp && !isTenantMenuOpen ? '64px 124px 24px 124px' : '64px 24px 24px 24px'}
      >
        {tenantAccount && viewerUser && isOnboarded && isMobileSize && (
          <Grid item container flex={0}>
            <Grid
              item
              alignSelf={'start'}
              className={`${classes.crumbsWrap} ${!locationIsHome && !locationIsPayment ? classes.crumbsWidthWrap : ''} ${
                locationIsPayment ? classes.crumbsWidthWrapPayment : ''
              }`}
            >
              <Breadcrumbs lastTabPath={lastTabPath} tenantName={tenantAccount?.businessProfile?.name || ''} />
            </Grid>
          </Grid>
        )}
        <Grid
          item
          container
          justifySelf={'center'}
          alignContent={'stretch'}
          justifyContent={'center'}
          alignSelf={'center'}
          flexGrow={1}
          className={isMobileSize ? '' : classes.desktopWrap}
        >
          {getAppContent()}
        </Grid>
      </Grid>
      <ConnectivityIssueDetails isOpen={hasConnectivityIssue} handleReconnect={checkConnection} />
    </Grid>
  );
};

export default App;
