import React, { useState, useEffect } from 'react';
import { TransactionStatementAvailableFormat, FileFormat } from '../gql-types.generated';
import {
  Grid,
  Button,
  Theme,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  useMediaQuery,
  useTheme,
  Typography,
} from '@mui/material';
import { makeStyles, createStyles } from '@mui/styles';
import ErrorIcon from '@mui/icons-material/Error';

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
    },
    content: {
      paddingTop: theme.spacing(1),
    },
    buttonContent: {
      textAlign: 'end',
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
    },
    errorIcon: {
      marginRight: 4,
    },
  }),
);

interface TransactionReportDownloadOptionsProps {
  availableFormats: TransactionStatementAvailableFormat[] | null | undefined;
  isRecentStatement: boolean;
  handleCancel: () => void;
  handleDownload: (statementName: string) => void;
  statementName: string;
  statementUrl: string | undefined;
  statementUrlError?: Error;
}

const TransactionReportDownloadOptions: React.FC<TransactionReportDownloadOptionsProps> = (
  props: TransactionReportDownloadOptionsProps,
): JSX.Element | null => {
  const { availableFormats, isRecentStatement, handleCancel, handleDownload, statementName, statementUrl, statementUrlError } = props;
  const classes = useStyles();
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.down('md'));

  const [selectedStatementFormat, setSelectedStatementFormat] = useState<FileFormat | null>(null);
  const [csvFormat, setcsvFormat] = useState<TransactionStatementAvailableFormat | null>(null);
  const [pdfFormat, setpdfFormat] = useState<TransactionStatementAvailableFormat | null>(null);

  useEffect(() => {
    const csv = availableFormats?.filter(statement => {
      return statement.format === FileFormat.Csv;
    });
    const pdf = availableFormats?.filter(statement => {
      return statement.format === FileFormat.Pdf;
    });
    if (pdf && pdf.length > 0) {
      setpdfFormat(pdf[0]);
      setSelectedStatementFormat(FileFormat.Pdf);
    }
    if (csv && csv.length > 0) {
      setcsvFormat(csv[0]);
      setSelectedStatementFormat(FileFormat.Csv);
    }
  }, [availableFormats]);

  useEffect(() => {
    if (statementUrl && statementUrl.length > 0) {
      const downloadLinkId = `statement-link-${statementName}`;
      const downloadLink = document.getElementById(downloadLinkId);
      if (downloadLink) {
        downloadLink.click();
        handleCancel();
      }
    }
  }, [statementUrl]);

  const handleSelectRadio = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedStatementFormat(event.target.value as FileFormat);
  };

  const getStatementFileName = (selectedFormat: FileFormat | null) => {
    const availableFormat = availableFormats?.find(format => {
      return format.format === selectedFormat;
    });
    return availableFormat?.fileName;
  };

  const handleDownloadClick = () => {
    const statementNameForDownload = getStatementFileName(selectedStatementFormat);
    if (statementNameForDownload) {
      handleDownload(statementNameForDownload);
    }
  };

  return (
    <Grid container className={!matches && isRecentStatement ? classes.parentGridMenu : classes.parentGrid} xs={12}>
      <a id={`statement-link-${statementName}`} href={statementUrl || ''} style={{ display: 'none' }} />
      {isRecentStatement && (
        <Grid item xs={12}>
          <Typography variant={'title'}>Download Statement</Typography>
        </Grid>
      )}
      {isRecentStatement && statementUrlError && (
        <Grid item className={classes.dialogContextError}>
          <ErrorIcon className={classes.errorIcon} />
          {`${statementUrlError?.message || 'Unable to generate statement'}. Please try again later!`}
        </Grid>
      )}
      {!csvFormat && !pdfFormat && (
        <Grid item className={classes.dialogContextError}>
          <ErrorIcon className={classes.errorIcon} />
          {`Unable to generate statement. Please try again later!`}
        </Grid>
      )}
      <Grid item xs={12} className={classes.content}>
        <FormControl>
          <RadioGroup color="primary" name="selectedFormat" value={selectedStatementFormat} onChange={handleSelectRadio}>
            {csvFormat && <FormControlLabel value={FileFormat.Csv} control={<Radio color="primary" />} label="Download as CSV" />}
            {pdfFormat && <FormControlLabel value={FileFormat.Pdf} control={<Radio color="primary" />} label="Download as PDF" />}
          </RadioGroup>
        </FormControl>
      </Grid>
      <Grid item xs={12}>
        <Grid xs={12} className={classes.buttonGrid}>
          {isRecentStatement && (
            <Grid item xs={7} className={classes.buttonContent}>
              <Button onClick={handleCancel} color="primary">
                CANCEL
              </Button>
            </Grid>
          )}
          <Grid item xs={isRecentStatement ? 5 : 12} className={classes.buttonContent}>
            <Button variant="contained" color="primary" onClick={handleDownloadClick} disabled={!selectedStatementFormat}>
              DOWNLOAD
            </Button>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default TransactionReportDownloadOptions;
