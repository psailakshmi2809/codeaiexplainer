import { Box, Button, Link, Paper, Popover, Theme, Typography } from '@mui/material';
import { createStyles, makeStyles } from '@mui/styles';
import { DateTime } from 'luxon';
import React, { useEffect, useState } from 'react';
import { FileFormat, PayoutReport, PayoutReportItem } from '../gql-types.generated';
import { PayoutReportDisplayName } from '../util/PayoutReportDisplayName';
import PayoutReportDownloadOptions from './PayoutReportDownloadOptions';
import PayoutReportsHistory from './PayoutReportsHistory';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
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
  }),
);

interface PayoutReportsProps {
  payoutReports?: PayoutReportItem[] | null;
  report?: PayoutReport;
  reportError?: Error;
  handlePayoutDownload: (payoutReportId: string, format: FileFormat) => void;
  clearPayoutReportOrError: () => void;
  isFetchingPayoutUrl: boolean;
  updatePayoutReportCancelledInFlight: (payoutReportCancelledInFlight: boolean) => void;
}

const PayoutReports: React.FC<PayoutReportsProps> = props => {
  const {
    payoutReports,
    report,
    reportError,
    isFetchingPayoutUrl,
    handlePayoutDownload,
    clearPayoutReportOrError,
    updatePayoutReportCancelledInFlight,
  } = props;
  const classes = useStyles();

  const [reportsHistoryVisible, setReportsHistoryVisible] = useState<boolean>(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<HTMLAnchorElement | null>(null);
  const [selectedPayout, setSelectedPayout] = useState<string | undefined>(undefined);
  const [latestPayoutReports, setLatestPayoutReports] = useState<PayoutReportItem[] | undefined>(undefined);

  useEffect(() => {
    let latestReports = payoutReports?.slice().sort((a: PayoutReportItem, b: PayoutReportItem) => {
      const aDate = DateTime.fromISO(a.endTime).toUTC();
      const bDate = DateTime.fromISO(b.endTime).toUTC();
      return aDate > bDate ? -1 : 1;
    });

    if (latestReports && latestReports?.length > 0) {
      const recentDate = DateTime.fromISO(latestReports[0].endTime).toUTC();
      const recentMonth = recentDate.month;
      const recentYear = recentDate.year;

      latestReports = latestReports.filter(report => {
        const reportDate = DateTime.fromISO(report.endTime).toUTC();
        const reportMonth = reportDate.month;
        const reportYear = reportDate.year;

        if (reportYear < recentYear - 1) return false;

        let diff = recentMonth - reportMonth;
        diff = diff < 0 ? diff + 12 : diff;

        return diff >= 0 && diff <= 2;
      });

      setLatestPayoutReports(latestReports);
    }
  }, [payoutReports]);

  if (!latestPayoutReports || latestPayoutReports.length === 0) return null;

  const cancelPayoutReport = () => {
    if (isFetchingPayoutUrl) {
      updatePayoutReportCancelledInFlight(true);
    }
    clearPayoutReportOrError();
  };

  const openReportsHistory = () => {
    setReportsHistoryVisible(true);
    updatePayoutReportCancelledInFlight(false);
    clearPayoutReportOrError();
  };

  const closeReportsHistory = () => {
    setReportsHistoryVisible(false);
    clearPayoutReportOrError();
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>, payoutId: string) => {
    event.preventDefault();
    setAnchorEl(event.currentTarget);
    setIsMenuOpen(true);
    setSelectedPayout(payoutId);
    updatePayoutReportCancelledInFlight(false);
    clearPayoutReportOrError();
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setIsMenuOpen(false);
    setSelectedPayout(undefined);
    cancelPayoutReport();
  };

  const handlePayoutHistoryDownload = (payoutReportId: string, format: FileFormat) => {
    updatePayoutReportCancelledInFlight(false);
    handlePayoutDownload(payoutReportId, format);
  };

  const getLastThree = () => {
    const lastThree = latestPayoutReports.slice(0, 3);
    return (
      <>
        {lastThree.map((report, index) => {
          const reportId = report.payoutReportId;

          if (!reportId) return null;

          const name = PayoutReportDisplayName(report.startTime, report.endTime);

          return (
            <Link
              underline={'hover'}
              key={index}
              href="#"
              onClick={(event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
                handleMenuOpen(event, reportId);
              }}
              data-cy="payout-report"
            >
              <Typography className={classes.report} variant="body1">
                {name}
              </Typography>
            </Link>
          );
        })}
      </>
    );
  };

  return (
    <Paper className={classes.paper} elevation={0}>
      <Box className={classes.contentBox}>
        <Box className={classes.header}>
          <Box className={classes.headerText}>
            <Typography variant="subtitle">Payout Reports</Typography>
          </Box>
        </Box>
        <Box data-cy="payout-last-three-months">{getLastThree()}</Box>
        <Box className={classes.viewAllSection}>
          <Button className={classes.footerButton} color="primary" onClick={openReportsHistory} data-cy="view-all-statements">
            VIEW ALL REPORTS
          </Button>
        </Box>
      </Box>
      {selectedPayout && (
        <Popover
          anchorEl={anchorEl}
          open={isMenuOpen}
          onClose={(event, reason) => {
            if (reason !== 'backdropClick') {
              handleMenuClose();
            }
          }}
          disableEscapeKeyDown={isFetchingPayoutUrl}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <PayoutReportDownloadOptions
            isRecentPayout={true}
            handleCancel={handleMenuClose}
            handleDownload={handlePayoutDownload}
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
        handleDownload={handlePayoutHistoryDownload}
        isFetchingPayoutUrl={isFetchingPayoutUrl}
      />
    </Paper>
  );
};

export default PayoutReports;
