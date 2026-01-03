import {
  Container,
  Box,
  Dialog,
  Divider,
  IconButton,
  Link,
  MenuItem,
  MenuList,
  Popover,
  Theme,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { createStyles, makeStyles } from '@mui/styles';
import PaymentsIcon from '@mui/icons-material/Payments';
import RequestQuoteIcon from '@mui/icons-material/RequestQuote';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import AssessmentIcon from '@mui/icons-material/Assessment';
import SettingsIcon from '@mui/icons-material/Settings';
import HomeIcon from '@mui/icons-material/Home';
import HelpIcon from '@mui/icons-material/Help';
import PeopleIcon from '@mui/icons-material/People';
import PersonIcon from '@mui/icons-material/Person';
import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { NavLink } from 'react-router-dom';
import logoutIconInverted from '../logoutIconInverted.svg';
import TuneIcon from '@mui/icons-material/Tune';
import { DateTime } from 'luxon';
import {
  PayoutReportItem,
  FileFormat,
  TransactionStatementAvailableFormat,
  TransactionStatement,
  PayoutReport,
  TenantAccount,
} from '../gql-types.generated';
import { PayoutReportDisplayName } from '../util/PayoutReportDisplayName';
import PayoutReportDownloadOptions from './PayoutReportDownloadOptions';
import PayoutReportsHistory from './PayoutReportsHistory';
import LoadingMask from './LoadingMask';
import TransactionReportDownloadOptions from './TransactionReportDownloadOptions';
import TransactionReportYears from './TransactionReportYears';
import { allMonths } from '../util/Months';
import CloseIcon from '@mui/icons-material/Close';
import ErrorIcon from '@mui/icons-material/Error';
import { createPayoutReport, fetchGenerateStatementAccessUrl } from '../features/home/HomeActions';
import {
  clearGenerateStatementAccess,
  capturePayoutReport,
  capturePayoutReportCancelledInFlight,
  capturePayoutReportError,
  capturePayoutReportInFlight,
} from '../features/home/HomeSlice';
import { fetchIsTenantMenuOpen } from '../features/app/AppSlice';
import { ApteanSSOProvider } from '../util/ApteanSSOProvider';
import { AUTH_MODE } from '../util/Constants';
import { b2cAuthProvider } from '../util/AuthProvider';
import { Helmet } from 'react-helmet';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      textAlign: 'start',
    },
    userInfo: {
      padding: theme.spacing(3),
    },
    menuItem: {
      height: 55,
      textDecoration: 'none',
      color: theme.palette.text.primary,
      '&>.MuiDivider-root': {
        width: 'calc(100% - 12px)',
        position: 'absolute',
        top: 0,
        left: 0,
        marginLeft: 12,
      },
    },
    menuItemIcon: {
      marginRight: theme.spacing(2),
      color: theme.palette.uxGrey.main,
    },
    logoutIcon: {
      marginRight: theme.spacing(2),
      width: '1em',
      height: '1em',
      fontSize: '1.5rem',
      transform: 'rotate(180deg)',
    },
    manageAccountIcon: {
      marginRight: theme.spacing(2),
      width: '1em',
      height: '1em',
      fontSize: '1.5rem',
    },
    subMenuItem: {
      marginLeft: 32,
      paddingLeft: 32,
    },
    navList: {
      width: '100%',
      padding: 0,
    },
    paper: {
      textAlign: 'start',
      [theme.breakpoints.down('lg')]: {
        margin: theme.spacing(2, 0),
      },
      width: '100%',
    },
    closeButton: {
      position: 'absolute',
      right: theme.spacing(1),
      top: theme.spacing(1),
      color: theme.palette.uxGrey.main,
    },
    contentBox: {
      padding: theme.spacing(2, 3, 1, 3),
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    headerText: {
      height: '100%',
      maxWidth: '85%',
    },
    downloadHeaderText: {
      lineHeight: 1.6,
    },
    headerHeadText: {
      letterSpacing: 1.5,
      fontSize: 12,
      padding: theme.spacing(1, 0.5),
    },
    headerIcon: {
      lineHeight: 1,
      borderRadius: 50,
      backgroundColor: theme.palette.uxGrey.hover,
      padding: 8,
    },
    icon: {
      fontSize: '2rem',
      color: theme.palette.text.secondary,
    },
    footerButton: {
      paddingLeft: 0,
    },
    reports: {},
    report: {
      paddingTop: 4,
      cursor: 'pointer',
    },
    helpText: {
      fontSize: '1rem',
      fontWeight: 'lighter',
    },
    viewAllSection: {
      paddingTop: theme.spacing(1),
    },
    dialogContextError: {
      backgroundColor: theme.palette.error.light,
      color: theme.palette.error.main,
      fontWeight: 500,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: theme.spacing(0.5, 0),
      margin: theme.spacing(0, -3),
      width: 'calc(100% + 48px)',
    },
    errorIcon: {
      marginRight: 4,
    },
    contentWrap: {
      padding: 0,
    },
  }),
);
interface NavigationListProps {
  afterClick?: () => void;
  statementUrl?: string;
  statementUrlError?: Error;
  isFetchingStatementUrl: boolean;
  report?: PayoutReport;
  reportError?: Error;
  isFetchingPayoutUrl: boolean;
  tenantAccount?: TenantAccount;
  showStatements: boolean;
  showPayoutReports: boolean;
}

const NavigationList: React.FC<NavigationListProps> = props => {
  const {
    afterClick,
    statementUrl,
    statementUrlError,
    isFetchingStatementUrl,
    report,
    reportError,
    isFetchingPayoutUrl,
    tenantAccount,
    showStatements,
    showPayoutReports,
  } = props;
  const dispatch = useDispatch();
  const classes = useStyles();
  const [transactionYearsDialogOpen, setTransactionYearsDialogOpen] = useState(false);
  const [reportsOpen, setReportsOpen] = useState<boolean>(false);
  const [statementsOpen, setStatementsOpen] = useState<boolean>(false);
  const [reportsHistoryVisible, setReportsHistoryVisible] = useState<boolean>(false);
  const [isReportMenuOpen, setIsReportMenuOpen] = useState(false);
  const [reportAnchorEl, setReportAnchorEl] = useState<HTMLAnchorElement | null>(null);
  const [selectedPayout, setSelectedPayout] = useState<string | undefined>(undefined);
  const [latestPayoutReports, setLatestPayoutReports] = useState<PayoutReportItem[]>([]);
  const [lastThreeReports, setLastThreeReports] = useState<(JSX.Element | null)[]>([]);
  const [lastThreeStatements, setLastThreeStatements] = useState<(JSX.Element | null)[]>([]);
  const [isStatementMenuOpen, setIsStatementMenuOpen] = useState(false);
  const [statementAnchorEl, setStatementAnchorEl] = useState<HTMLAnchorElement | null>(null);
  const [selectedStatement, setSelectedStatement] = useState<TransactionStatementAvailableFormat[] | null | undefined>(null);
  const [selectedStatementName, setSelectedStatementName] = useState<string>('');
  const [isOnboarded, setIsOnboarded] = useState<boolean>(false);
  const [customerFeatureEnabled, setCustomerFeatureEnabled] = useState<boolean>(false);
  const matchesMdDown = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));
  const [isUserManager] = useState<boolean>(ApteanSSOProvider.userPermissions().canManageUsers);
  const navItemClick = () => {
    if (afterClick) {
      afterClick();
    }
    if (matchesMdDown) {
      dispatch(fetchIsTenantMenuOpen(false));
    }
  };
  const clearPayoutReportOrError = () => {
    dispatch(capturePayoutReport(undefined));
    dispatch(capturePayoutReportError(undefined));
    dispatch(capturePayoutReportInFlight(false));
  };
  const handlePayoutReportDownload = (payoutReportId: string, format: FileFormat) => {
    if (payoutReportId) {
      dispatch(createPayoutReport(payoutReportId, format));
    }
  };
  const updatePayoutReportCancelledInFlight = (cancelledInFlight: boolean) => {
    dispatch(capturePayoutReportCancelledInFlight(cancelledInFlight));
  };
  const cancelPayoutReport = () => {
    if (isFetchingPayoutUrl) {
      updatePayoutReportCancelledInFlight(true);
    }
    clearPayoutReportOrError();
  };
  const handleGenerateStatementStateClear = () => {
    dispatch(clearGenerateStatementAccess());
  };
  const handleStatementDownload = (statementName: string) => {
    if (statementName) {
      dispatch(fetchGenerateStatementAccessUrl(statementName));
    }
  };
  const closeYears = () => {
    setTransactionYearsDialogOpen(false);
    handleGenerateStatementStateClear();
  };
  const toggleYearsDialogOpen = () => {
    setTransactionYearsDialogOpen(!transactionYearsDialogOpen);
  };
  const handleStatementMenuClose = () => {
    setStatementAnchorEl(null);
    setIsStatementMenuOpen(false);
    setSelectedStatement(null);
    setSelectedStatementName('');
    handleGenerateStatementStateClear();
  };
  const payoutReportMenuOpen = (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>, payoutId: string) => {
    event.preventDefault();
    setReportAnchorEl(event.currentTarget);
    setIsReportMenuOpen(true);
    setSelectedPayout(payoutId);
    updatePayoutReportCancelledInFlight(false);
    clearPayoutReportOrError();
  };

  const getLastThreeMonthsStatements = (tenantStatements?: TransactionStatement[] | null) => {
    // sorting the statements order
    let statements: TransactionStatement[] = [];
    if (tenantStatements && tenantStatements.length > 0) {
      statements = tenantStatements?.slice().sort((a: TransactionStatement, b: TransactionStatement) => {
        const aDate = DateTime.fromISO(a.endTime);
        const bDate = DateTime.fromISO(b.endTime);
        return aDate > bDate ? -1 : 1;
      });
    }
    //getting the statements for last three months
    const currentMonth = DateTime.local().month;
    const lastThreeMonths = [];
    const initialMonth =
      statements && statements.length > 0 && DateTime.fromISO(statements[0].endTime).toUTC().month === currentMonth ? 1 : 0;
    let month = 0;
    while (statements && month < 3 && initialMonth + month < statements?.length) {
      lastThreeMonths.push(statements[initialMonth + month]);
      month += 1;
    }
    return lastThreeMonths;
  };
  const statementMenuOpen = (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>, month: TransactionStatement) => {
    const statementMonth = DateTime.fromISO(month.endTime).toUTC().month;
    const statementYear = DateTime.fromISO(month.endTime).toUTC().year;
    const statementName = `statement-${statementYear}-${statementMonth < 10 ? '0' : ''}${statementMonth}`;
    event.preventDefault();
    setStatementAnchorEl(event.currentTarget);
    setIsStatementMenuOpen(true);
    setSelectedStatement(month.availableFormats);
    setSelectedStatementName(statementName);
  };
  useEffect(() => {
    if (tenantAccount) {
      // Update is onboarded & customer feature enabled states.
      setIsOnboarded(!!tenantAccount.tosAcceptance);
      setCustomerFeatureEnabled(tenantAccount?.settings?.features?.customers?.enabled || false);
      // Update payout and transaction items.
      const { payoutReports } = tenantAccount;
      let latestReports =
        payoutReports &&
        payoutReports?.slice().sort((a: PayoutReportItem, b: PayoutReportItem) => {
          const aDate = DateTime.fromISO(a.endTime).toUTC();
          const bDate = DateTime.fromISO(b.endTime).toUTC();
          return aDate > bDate ? -1 : 1;
        });
      // Update the payout reports.
      if (latestReports && latestReports?.length > 0) {
        const recentDate = DateTime.fromISO(latestReports[0].endTime).toUTC();
        const recentMonth = recentDate.month;
        const recentYear = recentDate.year;
        latestReports = latestReports.filter((report: PayoutReportItem) => {
          const reportDate = DateTime.fromISO(report.endTime).toUTC();
          const reportMonth = reportDate.month;
          const reportYear = reportDate.year;
          if (reportYear < recentYear - 1) return false;
          let diff = recentMonth - reportMonth;
          diff = diff < 0 ? diff + 12 : diff;
          return diff >= 0 && diff <= 2;
        });
        setLatestPayoutReports(latestReports);

        const lastThreeReports = latestReports.slice(0, 3);
        setLastThreeReports(
          lastThreeReports.map((report, index) => {
            const reportId = report.payoutReportId;
            if (!reportId) return null;
            const name = PayoutReportDisplayName(report.startTime, report.endTime);
            return (
              <MenuItem
                className={`${classes.menuItem} ${classes.subMenuItem}`}
                onClick={event => payoutReportMenuOpen(event as unknown as React.MouseEvent<HTMLAnchorElement, MouseEvent>, reportId)}
                data-cy="payout-report"
                key={index}
              >
                <Divider />
                {name}
              </MenuItem>
            );
          }),
        );
      } else {
        setLatestPayoutReports([]);
        setLastThreeReports([]);
      }
      const months = getLastThreeMonthsStatements(tenantAccount.statements);
      const lastThree = [];
      for (let i = 0; i < months.length; i += 1) {
        const statementMonth = DateTime.fromISO(months[i].endTime).toUTC().month;
        const statementYear = DateTime.fromISO(months[i].endTime).toUTC().year;
        lastThree.push(
          <MenuItem
            className={`${classes.menuItem} ${classes.subMenuItem}`}
            key={i}
            onClick={event => statementMenuOpen(event as unknown as React.MouseEvent<HTMLAnchorElement, MouseEvent>, months[i])}
            data-cy="transaction-report"
          >
            <Divider />
            <Typography className={classes.report} variant="body1">
              {allMonths[statementMonth - 1].label} {statementYear}
            </Typography>
          </MenuItem>,
        );
      }
      setLastThreeStatements(lastThree);
    }
  }, [tenantAccount]);

  const openReportsHistory = () => {
    setReportsHistoryVisible(true);
    updatePayoutReportCancelledInFlight(false);
    clearPayoutReportOrError();
  };

  const closeReportsHistory = () => {
    setReportsHistoryVisible(false);
    clearPayoutReportOrError();
  };

  const payoutReportMenuClose = () => {
    if (isFetchingPayoutUrl) {
      updatePayoutReportCancelledInFlight(true);
    }
    setReportAnchorEl(null);
    setIsReportMenuOpen(false);
    setSelectedPayout(undefined);
    clearPayoutReportOrError();
  };
  const handleLogout = () => {
    if (AUTH_MODE === 'b2c') {
      b2cAuthProvider?.logout();
    } else {
      ApteanSSOProvider.exitPortalApp();
    }
  };
  let signOutText = 'Exit';
  if (AUTH_MODE === 'b2c') {
    signOutText = 'Sign out';
  }

  return (
    <Container className={classes.contentWrap}>
      <MenuList className={classes.navList} data-cy="settings-menu">
        <MenuItem component={Link} className={classes.menuItem} onClick={navItemClick} href={'/'} data-cy="nav-home">
          <HomeIcon className={classes.menuItemIcon} />
          Home
        </MenuItem>
        <MenuItem
          component={NavLink}
          className={classes.menuItem}
          onClick={navItemClick}
          to="/all-payments"
          data-cy="nav-all-payments"
        >
          <Divider />
          <PaymentsIcon className={classes.menuItemIcon} />
          Payments
        </MenuItem>
        <MenuItem
          component={NavLink}
          className={classes.menuItem}
          onClick={navItemClick}
          to="/payment-requests"
          data-cy="nav-payment-requests"
        >
          <Divider />
          <RequestQuoteIcon className={classes.menuItemIcon} />
          Payment Requests
        </MenuItem>
        {showStatements && (
          <MenuItem className={classes.menuItem} onClick={() => setStatementsOpen(!statementsOpen)} data-cy="nav-statements">
            <Divider />
            <FactCheckIcon className={classes.menuItemIcon} />
            Statements
          </MenuItem>
        )}
        {showStatements &&
          statementsOpen && [
            lastThreeStatements,
            <MenuItem
              key={3}
              className={`${classes.menuItem} ${classes.subMenuItem}`}
              onClick={lastThreeStatements.length > 0 ? toggleYearsDialogOpen : undefined}
              data-cy="view-all-statements"
            >
              <Divider />
              {lastThreeStatements.length > 0 ? 'View All Statements' : 'No Statements available'}
            </MenuItem>,
          ]}
        {showPayoutReports && (
          <MenuItem className={classes.menuItem} onClick={() => setReportsOpen(!reportsOpen)} data-cy="nav-reports">
            <Divider />
            <AssessmentIcon className={classes.menuItemIcon} />
            Reports
          </MenuItem>
        )}
        {showPayoutReports &&
          reportsOpen && [
            lastThreeReports,
            <MenuItem
              key={3}
              className={`${classes.menuItem} ${classes.subMenuItem}`}
              onClick={lastThreeReports.length > 0 ? openReportsHistory : undefined}
              data-cy="view-all-statements"
            >
              <Divider />
              {lastThreeReports.length > 0 ? 'View All Reports' : 'No Reports Available'}
            </MenuItem>,
          ]}
        {isOnboarded && (
          <MenuItem component={NavLink} onClick={navItemClick} className={classes.menuItem} to="/settings" data-cy="manage-account">
            <Divider />
            <SettingsIcon className={classes.menuItemIcon} />
            Account Settings
          </MenuItem>
        )}
        {isOnboarded && (
          <MenuItem
            component={NavLink}
            onClick={navItemClick}
            className={classes.menuItem}
            to="/account-preferences"
            data-cy="account-preferences"
          >
            <Divider />
            <TuneIcon className={classes.menuItemIcon} />
            Account Preferences
          </MenuItem>
        )}
        {customerFeatureEnabled && (
          <MenuItem
            component={NavLink}
            onClick={navItemClick}
            className={classes.menuItem}
            to="/customer-management"
            data-cy="manage-customers"
          >
            <Divider />
            <PeopleIcon className={classes.menuItemIcon} />
            Manage Customers
          </MenuItem>
        )}
        {isOnboarded && isUserManager && (
          <MenuItem
            component={NavLink}
            onClick={navItemClick}
            className={classes.menuItem}
            to="/user-management"
            data-cy="manage-users"
          >
            <Divider />
            <PersonIcon className={classes.menuItemIcon} />
            Manage Users
          </MenuItem>
        )}
        <MenuItem component={NavLink} className={classes.menuItem} onClick={navItemClick} to="/help" data-cy="help">
          <Divider />
          <HelpIcon className={classes.menuItemIcon} />
          Help
        </MenuItem>
        <MenuItem className={classes.menuItem} onClick={handleLogout} data-cy="sign-out">
          <Divider />
          <img className={classes.logoutIcon} alt="logout" src={logoutIconInverted} />
          {signOutText}
        </MenuItem>
      </MenuList>
      <Popover
        anchorEl={statementAnchorEl}
        open={isStatementMenuOpen}
        onClose={(event, reason) => {
          if (reason !== 'backdropClick') {
            handleStatementMenuClose();
          }
        }}
        disableEscapeKeyDown={isFetchingStatementUrl}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <LoadingMask loading={isFetchingStatementUrl} />
        <TransactionReportDownloadOptions
          availableFormats={selectedStatement}
          isRecentStatement={true}
          handleCancel={handleStatementMenuClose}
          handleDownload={handleStatementDownload}
          statementName={selectedStatementName}
          statementUrl={statementUrl}
          statementUrlError={statementUrlError}
        />
      </Popover>
      <Dialog
        aria-label={'statement download dialog'}
        PaperProps={{ className: classes.contentBox }}
        onClose={closeYears}
        fullWidth={true}
        maxWidth={'sm'}
        open={!!transactionYearsDialogOpen}
        disableEscapeKeyDown={isFetchingStatementUrl}
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
        data-cy="monthly-statement-dialog"
      >
        <Helmet>
          <meta name="ai:viewId" content="statements"></meta>
          <meta name="ai:viewDescription" content="Aptean Pay Merchant Portal - Statements"></meta>
          <title>Aptean Pay Merchant Portal - Statements</title>
        </Helmet>
        <LoadingMask loading={isFetchingStatementUrl} />
        <Box className={classes.header}>
          <Box className={classes.headerText}>
            <Typography variant="h6" id="modal-title">
              Statements
            </Typography>
            <Typography variant="subtitle1" id="modal-description">
              Your monthly statement will download as a .csv/.pdf file.
            </Typography>
          </Box>
          <IconButton
            aria-label="close"
            className={classes.closeButton}
            onClick={closeYears}
            data-cy="close-monthly-statement-dialog"
            size="large"
          >
            <CloseIcon />
          </IconButton>
        </Box>
        {statementUrlError && (
          <Box className={classes.dialogContextError}>
            <ErrorIcon className={classes.errorIcon} />
            {`${statementUrlError?.message || 'Unable to generate statement'}. Please try again later!`}
          </Box>
        )}
        <TransactionReportYears
          statements={tenantAccount?.statements}
          handleStatementDownload={handleStatementDownload}
          statementUrl={statementUrl}
          clearStatementAccess={handleGenerateStatementStateClear}
        />
      </Dialog>
      {selectedPayout && (
        <Popover
          anchorEl={reportAnchorEl}
          open={isReportMenuOpen}
          onClose={(event, reason) => {
            if (reason !== 'backdropClick') {
              payoutReportMenuClose();
            }
          }}
          disableEscapeKeyDown={isFetchingPayoutUrl}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <PayoutReportDownloadOptions
            isRecentPayout={true}
            handleCancel={payoutReportMenuClose}
            handleDownload={handlePayoutReportDownload}
            payoutId={selectedPayout}
            payoutUrl={report?.uri}
            payoutUrlError={reportError}
            isFetchingPayoutUrl={isFetchingPayoutUrl}
          />
        </Popover>
      )}
      <PayoutReportsHistory
        open={reportsHistoryVisible}
        close={closeReportsHistory}
        payoutReports={latestPayoutReports}
        payoutReport={report}
        payoutReportError={reportError}
        cancelPayoutReport={cancelPayoutReport}
        handleDownload={handlePayoutReportDownload}
        isFetchingPayoutUrl={isFetchingPayoutUrl}
      />
    </Container>
  );
};

export default NavigationList;
