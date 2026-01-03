import { Box, Dialog, DialogContent, DialogTitle, Divider, IconButton, List, Theme, Typography } from '@mui/material';
import { createStyles, makeStyles } from '@mui/styles';
import React, { useEffect, useState } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import PayoutReportsMonth from './PayoutReportsMonth';
import { FileFormat, PayoutReport, PayoutReportItem } from '../gql-types.generated';
import { DateTime } from 'luxon';
import { allMonths } from '../util/Months';
import { MonthlyPayoutReport } from '../custom-types/MonthlyPayoutReport';
import ErrorIcon from '@mui/icons-material/Error';
import { Helmet } from 'react-helmet';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    closeButton: {
      position: 'absolute',
      right: theme.spacing(1),
      top: theme.spacing(1),
      color: theme.palette.uxGrey.main,
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
    dialogContextError: {
      backgroundColor: theme.palette.error.light,
      color: theme.palette.error.main,
      fontWeight: 400,
      display: 'flex',
      justifyContent: 'center',
      padding: theme.spacing(0.5, 0),
      margin: theme.spacing(0, -3),
      width: 'calc(100% + 48px)',
      fontSize: '16px',
    },
    errorIcon: {
      marginRight: 4,
    },
  }),
);

interface PayoutReportsHistoryProps {
  open: boolean;
  close: () => void;
  payoutReports: PayoutReportItem[];
  payoutReport?: PayoutReport;
  payoutReportError?: Error;
  handleDownload: (id: string, format: FileFormat) => void;
  cancelPayoutReport: () => void;
  isFetchingPayoutUrl: boolean;
}

const PayoutReportsHistory: React.FC<PayoutReportsHistoryProps> = props => {
  const { open, close, payoutReports, payoutReport, payoutReportError, isFetchingPayoutUrl, handleDownload, cancelPayoutReport } =
    props;
  const classes = useStyles();

  const [monthlyPayoutReports, setMonthlyPayoutReports] = useState<MonthlyPayoutReport[] | undefined>(undefined);
  const [selectedPayoutId, setSelectedPayoutId] = useState<string | undefined>(undefined);

  useEffect(() => {
    const monthlyReports: MonthlyPayoutReport[] = [];
    if (payoutReports && payoutReports.length > 0) {
      const recentMonth = DateTime.fromISO(payoutReports[0].endTime).toUTC().month;
      for (let monthDiff = 0; monthDiff < 3; monthDiff += 1) {
        // eslint-disable-next-line no-loop-func
        const reports = payoutReports.filter(report => {
          const reportMonth = DateTime.fromISO(report.endTime).toUTC().month;
          let diff = recentMonth - reportMonth;
          diff = diff < 0 ? diff + 12 : diff;

          return diff === monthDiff;
        });

        if (reports.length > 0) {
          const latestReportdate = DateTime.fromISO(reports[0].endTime).toUTC();
          const latestReportMonth = latestReportdate.month;
          const latestReportYear = latestReportdate.year;

          const reportName = `${allMonths[latestReportMonth - 1].label} ${latestReportYear}`;

          const monthlyReport: MonthlyPayoutReport = {
            name: reportName,
            reports,
          };

          monthlyReports.push(monthlyReport);
        }
      }
    }
    setMonthlyPayoutReports(monthlyReports);
  }, [payoutReports]);

  const handleOnClose = () => {
    setSelectedPayoutId(undefined);
    cancelPayoutReport();
    close();
  };

  return (
    <Dialog
      open={open}
      onClose={(event, reason) => {
        if (reason !== 'backdropClick') {
          handleOnClose();
        }
      }}
      maxWidth="sm"
      fullWidth
    >
      <Helmet>
        <meta name="ai:viewId" content="reports"></meta>
        <meta name="ai:viewDescription" content="Aptean Pay Merchant Portal - Reports"></meta>
        <title>Aptean Pay Merchant Portal - Reports</title>
      </Helmet>
      <DialogTitle>
        <Box className={classes.header}>
          <Box className={classes.headerText}>
            <Typography variant="h6" id="modal-title">
              Payouts
            </Typography>
            <Typography variant="subtitle1" id="modal-description">
              Latest three months
            </Typography>
          </Box>
          <IconButton
            aria-label="close"
            className={classes.closeButton}
            onClick={close}
            data-cy="close-monthly-payout-dialog"
            size="large"
            disabled={isFetchingPayoutUrl}
          >
            <CloseIcon />
          </IconButton>
        </Box>
        {payoutReportError && (
          <Box className={classes.dialogContextError}>
            <ErrorIcon className={classes.errorIcon} />
            {`${payoutReportError?.message || 'Unable to generate payout report'}. Please try again later!`}
          </Box>
        )}
      </DialogTitle>
      <DialogContent>
        <Box>
          <List>
            {monthlyPayoutReports?.map((report, index) => (
              <>
                <Divider key={index} />
                <PayoutReportsMonth
                  key={index}
                  monthlyPayoutReport={report}
                  cancelPayoutReport={cancelPayoutReport}
                  handleDownload={handleDownload}
                  payoutReport={payoutReport}
                  isFetchingPayoutUrl={isFetchingPayoutUrl}
                  selectedPayoutId={selectedPayoutId}
                  setSelectedPayoutId={setSelectedPayoutId}
                />
              </>
            ))}
            <Divider />
          </List>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default PayoutReportsHistory;
