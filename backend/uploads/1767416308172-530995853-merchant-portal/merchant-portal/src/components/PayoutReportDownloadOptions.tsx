import {
  Button,
  FormControl,
  FormControlLabel,
  Grid,
  Radio,
  RadioGroup,
  Theme,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { makeStyles, createStyles } from '@mui/styles';
import React, { useEffect, useState } from 'react';
import ErrorIcon from '@mui/icons-material/Error';
import { FileFormat } from '../gql-types.generated';
import LoadingMask from './LoadingMask';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    parentGrid: {
      padding: theme.spacing(1, 3, 3, 3),
      width: '100%',
      borderLeft: `1px solid ${theme.palette.uxGrey.border}`,
      borderRight: `1px solid ${theme.palette.uxGrey.border}`,
    },
    parentGridMenu: {
      padding: theme.spacing(1, 3, 3, 3),
      width: '100%',
      maxWidth: '350px',
      borderLeft: `1px solid ${theme.palette.uxGrey.border}`,
      borderRight: `1px solid ${theme.palette.uxGrey.border}`,
    },
    buttonGrid: {
      paddingTop: theme.spacing(1),
      display: 'flex',
      justifyContent: 'flex-end',
    },
    content: {
      paddingTop: theme.spacing(1),
      position: 'relative',
    },
    buttonContent: {
      marginRight: theme.spacing(1),
    },
    dialogContextError: {
      backgroundColor: theme.palette.error.light,
      color: theme.palette.error.main,
      fontWeight: 500,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: theme.spacing(0.5, 0),
      margin: theme.spacing(0, -2),
      width: 'calc(100% + 32px)',
      fontSize: '12px',
    },
    errorIcon: {
      marginRight: 4,
      fontSize: '20px',
    },
  }),
);

interface PayoutReportDownloadOptionsProps {
  isRecentPayout: boolean;
  handleCancel: () => void;
  handleDownload: (id: string, format: FileFormat) => void;
  payoutId: string;
  payoutUrl?: string | null;
  payoutUrlError?: Error;
  isFetchingPayoutUrl: boolean;
}

const PayoutReportDownloadOptions: React.FC<PayoutReportDownloadOptionsProps> = props => {
  const { isRecentPayout, payoutId, payoutUrl, payoutUrlError, isFetchingPayoutUrl, handleCancel, handleDownload } = props;
  const classes = useStyles();
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.down('md'));

  const [selectedPayoutFormat, setSelectedPayoutFormat] = useState<FileFormat>(FileFormat.Csv);

  const handleSelectRadio = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedPayoutFormat(event.target.value as FileFormat);
  };

  const handleDownloadClick = () => {
    if (payoutId) {
      handleDownload(payoutId, selectedPayoutFormat);
    }
  };

  useEffect(() => {
    if (payoutUrl && payoutUrl.length > 0) {
      const downloadLinkId = `payout-link-${payoutId}`;
      const downloadLink = document.getElementById(downloadLinkId);
      if (downloadLink) {
        downloadLink.click();
        handleCancel();
      }
    }
  }, [payoutUrl]);

  return (
    <Grid container className={!matches && isRecentPayout ? classes.parentGridMenu : classes.parentGrid} xs={12}>
      <a id={`payout-link-${payoutId}`} href={payoutUrl || ''} style={{ display: 'none' }} />
      {isRecentPayout && (
        <Grid item xs={12}>
          <Typography variant={'title'}>Download Report</Typography>
        </Grid>
      )}
      {isRecentPayout && payoutUrlError && (
        <Grid item className={classes.dialogContextError}>
          <ErrorIcon className={classes.errorIcon} />
          {`${payoutUrlError?.message || 'Unable to fetch payout report'}. Please try again later!`}
        </Grid>
      )}
      <Grid item xs={12} className={classes.content}>
        <LoadingMask loading={isFetchingPayoutUrl} />
        <FormControl>
          <RadioGroup color="primary" name="selectedFormat" value={selectedPayoutFormat} onChange={handleSelectRadio}>
            <FormControlLabel
              key={FileFormat.Csv}
              value={FileFormat.Csv}
              control={<Radio color="primary" />}
              label="Download as CSV"
            />
            <FormControlLabel
              key={FileFormat.Pdf}
              value={FileFormat.Pdf}
              control={<Radio color="primary" />}
              label="Download as PDF"
            />
          </RadioGroup>
        </FormControl>
      </Grid>
      <Grid item xs={12}>
        <Grid xs={12} className={classes.buttonGrid}>
          {/* cancel button is when we use the download options in payout list */}
          {isRecentPayout && (
            <Button onClick={handleCancel} color="primary" className={classes.buttonContent}>
              CANCEL
            </Button>
          )}
          {/* stop button is when we use the download options in payout modal */}
          {!isRecentPayout && isFetchingPayoutUrl && (
            <Button onClick={handleCancel} color="primary" variant="contained" autoFocus className={classes.buttonContent}>
              STOP
            </Button>
          )}
          {(isRecentPayout || (!isRecentPayout && !isFetchingPayoutUrl)) && (
            <Button variant="contained" color="primary" onClick={handleDownloadClick} disabled={isFetchingPayoutUrl}>
              DOWNLOAD
            </Button>
          )}
        </Grid>
      </Grid>
    </Grid>
  );
};

export default PayoutReportDownloadOptions;
