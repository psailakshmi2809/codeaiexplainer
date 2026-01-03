import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  IconButton,
  InputAdornment,
  TextField,
  Theme,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { createStyles, makeStyles } from '@mui/styles';
import React, { useEffect, useState } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import ErrorIcon from '@mui/icons-material/Error';
import { FileFormat, Report } from '../gql-types.generated';
import { DateRange, Range, RangeKeyDict, RangeFocus } from 'react-date-range';
import { DateTime } from 'luxon';
import LoadingMask from './LoadingMask';
import DateRangeIcon from '@mui/icons-material/DateRange';
import { addDays, format, subDays, isAfter, isBefore, isValid } from 'date-fns';
import 'react-date-range/dist/styles.css'; // main style file
import 'react-date-range/dist/theme/default.css'; // theme css file

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    closeButton: {
      color: theme.palette.uxGrey.main,
      textAlign: 'right',
    },
    dialogContextErrorIcon: {
      marginRight: 4,
    },
    dialogContextError: {
      borderBottom: `1px solid ${theme.palette.uxGrey.border}`,
      padding: '8px 24px',
      backgroundColor: theme.palette.error.light,
      color: theme.palette.error.main,
      fontWeight: 500,
      display: 'flex',
    },
    padding: {
      padding: theme.spacing(1),
      paddingTop: 0,
      '&::before': {
        content: '""',
        height: 1,
        width: '100%',
        background: theme.palette.uxGrey.hover,
        marginBottom: theme.spacing(1),
      },
    },
    textField: {
      '&.selectEmptyMissing .MuiOutlinedInput-notchedOutline': {
        border: '1px solid',
        borderColor: theme.palette.error.main,
      },
      '&.selectEmptyMissing label': {
        color: theme.palette.error.main,
      },
    },
    root: {
      '& input::-webkit-calendar-picker-indicator': {
        display: 'none',
      },
    },
    content: {
      '& .MuiPaper-elevation5': {
        boxShadow: 'none',
        borderBottom: `1px solid ${theme.palette.uxGrey.border}`,
      },
    },
    calendarWrapper: {
      '& .rdrDateRangeWrapper': {
        position: 'relative',
        width: '42em',
        [theme.breakpoints.down(600)]: {
          width: '25em',
          alignItems: 'center',
        },
      },
      '& .rdrMonthAndYearWrapper': {
        width: '100%',
        position: 'absolute',
        height: 30,
        paddingTop: 0,
      },
      '& .rdrDefinedRangesWrapper': {
        display: 'none',
      },
      '& .rdrNextPrevButton': {
        background: '#ffffff',
        '&:focus': {
          background: theme.palette.uxGrey.focus,
        },
        '&:hover': {
          background: theme.palette.uxGrey.hover,
        },
      },
      '& .rdrMonth': {
        width: '21em',
        paddingBottom: 0,
      },
      '& .rdrMonth ~ .rdrMonth:last-of-type::before': {
        content: '""',
        height: '72%',
        background: theme.palette.uxGrey.hover,
        width: 1,
        position: 'absolute',
        top: '15%',
        left: '50%',
      },
      '& .rdrMonthAndYearPickers': {
        display: 'none',
      },
      '& .rdrDateDisplayItem': {
        border: 'none',
        boxShadow: 'none',
      },
      '& .rdrMonthName': {
        textAlign: 'center',
        color: '#000000',
        padding: '0.5em',
      },
      '& .rdrDayPassive': {
        visibility: 'hidden',
      },
      '& .rdrStartEdge, & .rdrEndEdge': {
        color: `${theme.palette.primary.main} !important`,
      },
      '& .rdrInRange ~ .rdrDayNumber span': {
        color: '#000000 !important',
      },
      '& .rdrDayStartPreview, & .rdrDayInPreview, & .rdrDayEndPreview': {
        borderColor: theme.palette.uxGrey.main,
      },
    },
    calendarDialogRoot: {
      top: '57.5vh !important',
      height: 400,
      overflowY: 'visible',
      // eslint-disable-next-line no-useless-computed-key
      ['@media screen and (max-height: 768px)']: {
        height: '100%',
        top: '0 !important',
      },
    },
    calendarDialogRootWithError: {
      top: '60.5vh !important',
      height: 400,
      overflowY: 'visible',
      // eslint-disable-next-line no-useless-computed-key
      ['@media screen and (max-height: 768px)']: {
        height: '100%',
        top: '0 !important',
      },
    },
    calendarContent: {
      justifyContent: 'center',
      [theme.breakpoints.up(600)]: {
        margin: 0,
      },
    },
    calendarPaper: {
      margin: 0,
      alignItems: 'flex-start',
      // eslint-disable-next-line no-useless-computed-key
      ['@media screen and (max-height: 768px)']: {
        alignItems: 'center',
      },
    },
    actions: {
      padding: 0,
      paddingTop: 16,
      width: '100%',
      display: 'flex',
      justifyContent: 'flex-end',
    },
    contentContainer: {
      position: 'relative',
    },
  }),
);

interface DateRangeValue {
  start: string;
  end: string;
}

interface ExportPaymentsProps {
  open: boolean;
  paymentsReport: Report | undefined;
  paymentsReportError: Error | undefined;
  onClose: () => void;
  handlePaymentsReport: (endDate: string, format: FileFormat, startDate: string) => void;
  updateExportsCancelledInFlight: (exportsCancelledInFlight: boolean) => void;
  generatingExportsInFlight: boolean;
}
const ExportPayments: React.FC<ExportPaymentsProps> = props => {
  const {
    open,
    paymentsReport,
    paymentsReportError,
    onClose,
    handlePaymentsReport,
    updateExportsCancelledInFlight,
    generatingExportsInFlight,
  } = props;

  const classes = useStyles();
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.down('md'));

  const maxDate = new Date();
  const defaultDateRange: Range = {
    // Temporary workaround to avoid setting initial date range, may be fixed in a future library release
    startDate: undefined,
    endDate: new Date(''),
    key: 'selection',
  };

  const [isDateRangeMenuOpen, setIsDateRangeMenuOpen] = useState<boolean>(false);
  const [reportLink, setReportLink] = useState<string>();
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [startDateError, setStartDateError] = useState<boolean>(false);
  const [endDateError, setEndDateError] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [dateRangeError, setDateRangeError] = useState<Error>();
  const [startDateErrorMessage, setStartDateErrorMessage] = useState<boolean>(false);
  const [endDateErrorMessage, setEndDateErrorMessage] = useState<boolean>(false);
  const [dateRange, setDateRange] = useState<Range>(defaultDateRange);
  // RangeFocus [number, 0 | 1]
  // `range` represents the index in the list of ranges of the range that's focused
  // `rangeStep` is which step on the range is focused: `0` for start date and `1` for end date
  // This allows to put the range step to 1 (endDate) when the picker is opened from the end date.
  const [focusedRange, setFocusedRange] = useState<RangeFocus | undefined>();

  const clearErrors = () => {
    setStartDateError(false);
    setStartDateErrorMessage(false);
    setEndDateError(false);
    setEndDateErrorMessage(false);
    setDateRangeError(undefined);
  };

  useEffect(() => {
    setFocusedRange(undefined);
    setStartDate('');
    setEndDate('');
    setDateRange(defaultDateRange);
    updateExportsCancelledInFlight(false);
  }, []);

  const handleOnClose = () => {
    onClose();
    //cleanup after closing the modal
    setDateRange(defaultDateRange);
    setFocusedRange(undefined);
    setStartDate('');
    setEndDate('');
    clearErrors();
    setIsLoading(false);
    setReportLink(undefined);
    setIsDateRangeMenuOpen(false);
    updateExportsCancelledInFlight(true);
  };

  useEffect(() => {
    if (paymentsReport) {
      setReportLink(paymentsReport?.downloadUrl || '#');
      setTimeout(() => {
        document.getElementById('payments-report-link')?.click();
      }, 500);
      setTimeout(() => {
        handleOnClose();
      }, 500);
    }

    return () => {
      //cleanup after closing the modal
      setDateRange(defaultDateRange);
      setFocusedRange(undefined);
      setStartDate('');
      setEndDate('');
      clearErrors();
      setIsLoading(false);
      setReportLink(undefined);
      setIsDateRangeMenuOpen(false);
    };
  }, [paymentsReport]);

  useEffect(() => {
    if (paymentsReportError) {
      setIsLoading(false);
    }
  }, [paymentsReportError]);

  useEffect(() => {
    setDateRange(prev => ({
      startDate: startDate ? new Date(`${startDate}T00:00`) : prev.startDate,
      endDate: endDate ? new Date(`${endDate}T00:00`) : prev.endDate,
      key: 'selection',
    }));
  }, [startDate, endDate]);

  const setDate = (date: Date, setState: (targetDate: string) => void) => {
    if (isValid(date)) {
      const targetDate = format(date, 'yyyy-MM-dd');
      setState(targetDate);
    }
  };

  useEffect(() => {
    const isValidStartDate = isValid(dateRange.startDate);
    const isValidEndDate = isValid(dateRange.endDate);
    if (isValidStartDate) {
      const dateAsString = format(dateRange.startDate as Date, 'yyyy-MM-dd');
      setStartDate(dateAsString);
      // setDate(dateRange.startDate as Date, setStartDate);

      //clearing error
      setStartDateError(false);
      setStartDateErrorMessage(false);
    }

    if (isValidEndDate) {
      const dateAsString = format(dateRange.endDate as Date, 'yyyy-MM-dd');
      setEndDate(dateAsString);
      // setDate(dateRange.endDate as Date, setEndDate);

      //clearing error
      setEndDateError(false);
      setEndDateErrorMessage(false);
    }
  }, [dateRange.startDate, dateRange.endDate]);

  const handleDateRangeMenu = (isOpen: boolean) => {
    if (!open) {
      setFocusedRange(undefined);
    }
    setIsDateRangeMenuOpen(isOpen);
  };

  const isDateDisabled = (date: Date): boolean => {
    if (dateRange.startDate) {
      return isBefore(date, subDays(dateRange.startDate, 30)) || isAfter(date, addDays(dateRange.startDate, 30));
    }
    return false;
  };

  const checkDateRangeError = () => {
    // Checking for valid date
    if (startDate.length !== 10 || endDate.length !== 10) {
      setEndDateError(endDate.length !== 10);
      setEndDateErrorMessage(endDate.length !== 10);
      setStartDateError(startDate.length !== 10);
      setStartDateErrorMessage(startDate.length !== 10);
      return undefined;
    }

    const startUtc = DateTime.utc(
      parseInt(startDate.substring(0, 4)),
      parseInt(startDate.substring(5, 7)),
      parseInt(startDate.substring(8, 10)),
    );

    const endUtc = DateTime.utc(
      parseInt(endDate.substring(0, 4)),
      parseInt(endDate.substring(5, 7)),
      parseInt(endDate.substring(8, 10)),
      23,
      59,
      59,
    );

    //checking if start date is less the end date
    if (endUtc < startUtc) {
      setEndDateError(true);
      setStartDateError(true);
      setDateRangeError({ message: 'End Date must be after the Start Date.' } as Error);
      return undefined;
    }

    //checking if the dates exceed today
    const upperLimitLocal = new Date();
    const upperLimitUtc = DateTime.utc(
      upperLimitLocal.getFullYear(),
      upperLimitLocal.getMonth() + 1,
      upperLimitLocal.getDate(),
      23,
      59,
      59,
    );

    if (endUtc > upperLimitUtc || startUtc > upperLimitUtc) {
      setEndDateError(endUtc > upperLimitUtc);
      setStartDateError(startUtc > upperLimitUtc);
      setDateRangeError({ message: `Date range cannot exceed today's date` } as Error);
      return undefined;
    }

    //checking if the difference in range is more than 31 days
    const dateRangeLimit = startUtc.plus({ days: 31 });
    if (endUtc > dateRangeLimit) {
      setEndDateError(true);
      setStartDateError(true);
      setDateRangeError({ message: 'The date range cannot exceed 31 days.' } as Error);
      return undefined;
    }

    const dateRange: DateRangeValue = { start: startUtc.toString(), end: endUtc.toString() };
    return dateRange;
  };

  const validate = () => {
    setTimeout(() => {
      if (checkDateRangeError()) {
        clearErrors();
      }
    }, 1000);
  };

  const handleDateRangeChange = (range: RangeKeyDict) => {
    if ('selection' in range) {
      range.selection.startDate?.setHours(10);
      range.selection.endDate?.setHours(10);
      setDateRange(range.selection);

      if (range.selection.startDate) {
        setDate(range.selection.startDate, setStartDate);

        //clearing error
        setStartDateError(false);
        setStartDateErrorMessage(false);
      }

      if (range.selection.endDate) {
        setDate(range.selection.endDate, setEndDate);

        //clearing error
        setEndDateError(false);
        setEndDateErrorMessage(false);
      }

      if (startDate && endDate) {
        validate();
      }
      // Reset to default range once any update occurs.
      setFocusedRange(undefined);
    }
  };

  const handleDownload = () => {
    setIsLoading(true);
    //cleaning before submitting
    clearErrors();

    const dateRange: DateRangeValue | undefined = checkDateRangeError();
    if (dateRange) {
      updateExportsCancelledInFlight(false);
      handlePaymentsReport(dateRange.end, FileFormat.Csv, dateRange.start);
    } else {
      setIsLoading(false);
    }
  };

  const closeCalendar = () => {
    if (checkDateRangeError()) {
      clearErrors();
    }
    handleDateRangeMenu(false);
  };

  const handleEnterKeydown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter') {
      handleDateRangeMenu(true);
    }
  };

  const handleStop = () => {
    updateExportsCancelledInFlight(true);
    setIsLoading(false);
    setReportLink(undefined);
  };

  const hasError = startDateError || endDateError || dateRangeError;

  return (
    <Dialog
      aria-label={'export payments dialog'}
      open={open}
      onClose={(event, reason) => {
        if (reason !== 'backdropClick' && !isLoading) {
          handleOnClose();
        }
      }}
      disableEscapeKeyDown={isLoading}
      fullWidth={true}
      maxWidth={'sm'}
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
      data-cy="export-payments"
    >
      <DialogTitle>
        <Grid container item xs={12}>
          <Grid item xs={10}>
            <Typography variant="subtitle2" id="modal-title">
              EXPORT
            </Typography>
            <Typography variant="title" id="modal-description">
              Download Payments
            </Typography>
          </Grid>
          <Grid item xs={2} className={classes.closeButton}>
            <IconButton
              aria-label="close"
              title="close"
              size="medium"
              onClick={handleOnClose}
              disabled={isLoading}
              data-cy="export-payments-close"
            >
              <CloseIcon />
            </IconButton>
          </Grid>
        </Grid>
      </DialogTitle>
      {paymentsReportError && (
        <DialogContentText className={classes.dialogContextError} data-cy="report-error-message">
          <ErrorIcon className={classes.dialogContextErrorIcon} />
          {paymentsReportError.message}
        </DialogContentText>
      )}
      {dateRangeError && (
        <DialogContentText className={classes.dialogContextError} data-cy="report-error-message">
          <ErrorIcon className={classes.dialogContextErrorIcon} />
          {dateRangeError.message}
        </DialogContentText>
      )}
      <DialogContent>
        <a id="payments-report-link" href={reportLink} />
        <Grid container>
          <Grid container item xs={12} className={classes.contentContainer}>
            <LoadingMask loading={isLoading} />
            <Grid item xs={12}>
              <Typography variant="subtitle1">Select Date Range</Typography>
            </Grid>
            <Grid container item xs={12}>
              <Grid item xs={12} sm={6} padding={'0px 8px 0px 0px'}>
                <TextField
                  fullWidth
                  variant="outlined"
                  className={classes.textField}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          size="small"
                          color="inherit"
                          onClick={() => {
                            handleDateRangeMenu(true);
                          }}
                        >
                          <DateRangeIcon />
                        </IconButton>
                      </InputAdornment>
                    ),
                    'aria-label': 'start date',
                    'aria-describedby': `${startDateErrorMessage ? 'start-date-helpertext-id' : undefined}`,
                  }}
                  onChange={event => {
                    setStartDate(event.target.value);
                  }}
                  onKeyDown={handleEnterKeydown}
                  onBlur={validate}
                  classes={{ root: classes.root }}
                  autoComplete="off"
                  type="date"
                  value={startDate}
                  error={startDateError}
                  helperText={startDateErrorMessage ? 'Please enter a valid Date.' : ''}
                  FormHelperTextProps={{ id: 'start-date-helpertext-id' }}
                  data-cy="start-date"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  variant="outlined"
                  className={classes.textField}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          size="small"
                          color="inherit"
                          onClick={() => {
                            if (dateRange.startDate) {
                              // Only put focus on endDate step when a startDate exists.
                              setFocusedRange([0, 1]);
                            }
                            handleDateRangeMenu(true);
                          }}
                        >
                          <DateRangeIcon />
                        </IconButton>
                      </InputAdornment>
                    ),
                    'aria-label': 'end date',
                    'aria-describedby': `${startDateErrorMessage ? 'end-date-helpertext-id' : undefined}`,
                  }}
                  onChange={event => {
                    setEndDate(event.target.value);
                  }}
                  onKeyDown={handleEnterKeydown}
                  onBlur={validate}
                  classes={{ root: classes.root }}
                  autoComplete="off"
                  type="date"
                  value={endDate}
                  error={endDateError}
                  helperText={endDateErrorMessage ? 'Please enter a valid Date.' : ''}
                  FormHelperTextProps={{ id: 'end-date-helpertext-id' }}
                  data-cy="end-date"
                />
              </Grid>
            </Grid>
          </Grid>
          <DialogActions className={classes.actions}>
            {isLoading && (
              <Button
                variant="contained"
                color="primary"
                onClick={handleStop}
                disabled={generatingExportsInFlight}
                autoFocus
                data-cy="export-stop"
              >
                Stop
              </Button>
            )}

            {!isLoading && (
              <Button variant="contained" color="primary" onClick={handleDownload} disabled={isLoading} data-cy="export-download">
                Download
              </Button>
            )}
          </DialogActions>
        </Grid>
        <Dialog
          aria-label={'date range dialog'}
          open={isDateRangeMenuOpen}
          hideBackdrop
          disableEnforceFocus
          classes={{
            root: hasError ? classes.calendarDialogRootWithError : classes.calendarDialogRoot,
            scrollPaper: classes.calendarPaper,
          }}
          PaperProps={{
            classes: {
              root: classes.calendarContent,
            },
          }}
        >
          <Grid container className={classes.calendarWrapper}>
            <DateRange
              ranges={[dateRange]}
              months={matches ? 1 : 2}
              onChange={handleDateRangeChange}
              maxDate={maxDate}
              weekdayDisplayFormat="EEEEE"
              startDatePlaceholder="Start Date"
              endDatePlaceholder="End Date"
              direction="horizontal"
              disabledDay={isDateDisabled}
              focusedRange={focusedRange}
              fixedHeight
              showDateDisplay={false}
              showMonthAndYearPickers={false}
              rangeColors={[theme.palette.uxBlue.activated || '']}
            />
          </Grid>
          <Grid container justifyContent={matches ? 'flex-start' : 'flex-end'} className={classes.padding}>
            <Button variant="contained" color="primary" onClick={closeCalendar}>
              Done
            </Button>
          </Grid>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
};

export default ExportPayments;
