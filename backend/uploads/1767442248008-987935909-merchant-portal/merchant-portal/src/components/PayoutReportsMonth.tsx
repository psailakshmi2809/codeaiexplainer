import { Box, Chip, Collapse, Divider, Grid, ListItem, ListItemText, Theme } from '@mui/material';
import { createStyles, makeStyles } from '@mui/styles';
import React, { useState } from 'react';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import PayoutReportDownloadOptions from './PayoutReportDownloadOptions';
import { MonthlyPayoutReport } from '../custom-types/MonthlyPayoutReport';
import { FileFormat, PayoutReport } from '../gql-types.generated';
import { PayoutReportDisplayName } from '../util/PayoutReportDisplayName';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    item: {
      borderColor: theme.palette.uxGrey.focus,
      borderLeftWidth: 1,
      borderRightWidth: 1,
      borderTopWidth: 0,
      borderBottomWidth: 0,
      borderStyle: 'solid',
    },
    gridItem: {
      borderColor: theme.palette.uxGrey.focus,
      borderWidth: '1px',
      borderStyle: 'solid',
      borderRadius: '3px',
      padding: theme.spacing(0.5),
      margin: theme.spacing(0.5),
      cursor: 'pointer',
    },
    gridItemSelected: {
      borderColor: theme.palette.primary.main,
      borderWidth: '1px',
      borderStyle: 'solid',
      borderRadius: '3px',
      margin: theme.spacing(0.5),
      padding: theme.spacing(0.5),
      cursor: 'pointer',
    },
    tileText: {
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
    chip: {
      margin: theme.spacing(0.5),
    },
    containerPadding: {
      paddingLeft: theme.spacing(2),
    },
  }),
);

interface PayoutReportsMonthProps {
  monthlyPayoutReport: MonthlyPayoutReport;
  payoutReport?: PayoutReport;
  handleDownload: (id: string, format: FileFormat) => void;
  cancelPayoutReport: () => void;
  isFetchingPayoutUrl: boolean;
  selectedPayoutId: string | undefined;
  setSelectedPayoutId: (selectedPayoutId: string | undefined) => void;
}

const PayoutReportsMonth: React.FC<PayoutReportsMonthProps> = props => {
  const {
    monthlyPayoutReport,
    payoutReport,
    isFetchingPayoutUrl,
    handleDownload,
    cancelPayoutReport,
    selectedPayoutId,
    setSelectedPayoutId,
  } = props;
  const classes = useStyles();
  const [isListExpanded, setIsListExpanded] = useState<boolean>(false);

  return (
    <>
      <ListItem
        key={monthlyPayoutReport.name}
        button
        className={classes.item}
        onClick={() => {
          setIsListExpanded(!isListExpanded);
          setSelectedPayoutId(undefined);
        }}
        disabled={isFetchingPayoutUrl}
      >
        <ListItemText primary={monthlyPayoutReport.name} />
        {isListExpanded ? <ExpandLess /> : <ExpandMore />}
      </ListItem>
      <Collapse key={`${monthlyPayoutReport.name}${'-collapse'}`} in={isListExpanded} timeout="auto" unmountOnExit>
        <Box className={`${classes.item} ${classes.containerPadding}`}>
          <Grid container>
            {monthlyPayoutReport.reports.map((report, index) => {
              const label = PayoutReportDisplayName(report.startTime, report.endTime);

              return (
                <Chip
                  key={index}
                  variant="outlined"
                  size="small"
                  color={report.payoutReportId === selectedPayoutId ? 'primary' : undefined}
                  onClick={() => {
                    const payoutId = report.payoutReportId;
                    if (payoutId) {
                      setSelectedPayoutId(selectedPayoutId === payoutId ? undefined : payoutId);
                    }
                  }}
                  label={label}
                  className={classes.chip}
                  disabled={isFetchingPayoutUrl}
                />
              );
            })}
          </Grid>
        </Box>

        {selectedPayoutId && monthlyPayoutReport.reports.find(r => r.payoutReportId === selectedPayoutId) && (
          <>
            <Divider />
            <PayoutReportDownloadOptions
              isRecentPayout={false}
              payoutId={selectedPayoutId}
              handleCancel={cancelPayoutReport}
              handleDownload={handleDownload}
              payoutUrl={payoutReport?.id === selectedPayoutId ? payoutReport?.uri : undefined}
              isFetchingPayoutUrl={isFetchingPayoutUrl}
            />
          </>
        )}
      </Collapse>
    </>
  );
};

export default PayoutReportsMonth;
