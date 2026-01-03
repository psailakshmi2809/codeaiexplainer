import {
  Button,
  Checkbox,
  Divider,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Popover,
  Select,
  SelectChangeEvent,
  TextField,
  Theme,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { createStyles, makeStyles } from '@mui/styles';
import CustomerAutoComplete from './CustomerAutoComplete';
import React, { ChangeEvent, useEffect, useRef, useState } from 'react';
import CurrencyFormat from 'react-currency-format';
import FilterListIcon from '@mui/icons-material/FilterList';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DateRangeIcon from '@mui/icons-material/DateRange';
import { CurrencyType } from '../gql-types.generated';
import { CustomerOption } from '../custom-types/CustomerOption';
import {
  DateFilterValue,
  AllPaymentStatusFilterValue,
  PaymentStatusFilterValue,
  PaymentStatusFilterValueUnselected,
  MAX_STATUS_COUNT,
} from '../util/PaymentsListFilterValue';
import { DateRangePicker, Range, RangeFocus, RangeKeyDict } from 'react-date-range';
import { format, isValid } from 'date-fns';
import { DateTime } from 'luxon';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    containerGridXs: {
      minWidth: '90vw',
      maxWidth: '90vw',
      overflowY: 'hidden',
    },
    containerGrid: {
      minWidth: 380,
      maxWidth: 380,
      overflowY: 'hidden',
    },
    totalCountText: {
      fontSize: 18,
      fontWeight: 'bold',
    },
    closeContainer: {
      textAlign: 'right',
    },
    closeIcon: {
      margin: 0,
      color: theme.palette.uxGrey.main,
    },
    filterText: {
      fontSize: 16,
      fontWeight: 'bold',
    },
    buttonContainer: {
      textAlign: 'right',
    },
    statusFilterContainer: {
      padding: theme.spacing(0, 1.5, 0, 0.5),
    },
    filterContainer: {
      padding: theme.spacing(2, 1.5, 0, 0.5),
    },
    customerFilterContainer: {
      padding: theme.spacing(2, 1.5, 1, 0.5),
    },
    filterContainerDate: {
      padding: theme.spacing(2, 1.5, 1, 0.5),
    },
    applyFilterContainer: {
      padding: theme.spacing(2, 1.5, 2, 0.5),
    },
    toggleButton: {
      padding: 0,
    },
    fieldContainer: {
      padding: theme.spacing(1, 0),
    },
    rangeError: {
      color: theme.palette.error.main,
    },
    root: {
      '& input::-webkit-calendar-picker-indicator': {
        display: 'none',
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
    padding: {
      padding: theme.spacing(1),
    },
    containerFilter: {
      maxHeight: 'calc(100vh - 162px)',
      overflowY: 'auto',
      position: 'relative',
      padding: theme.spacing(1),
    },
    filterHeader: {
      padding: theme.spacing(1),
    },
  }),
);

interface PaymentsListFilterProps {
  totalCount?: number;
  customersEnabled: boolean;
  customerList?: CustomerOption[];
  defaultCurrency?: string | null;
  filterDateOption?: string;
  filterFromDate?: string;
  filterToDate?: string;
  filterAmountRange: boolean;
  filterFromAmount?: number;
  filterToAmount?: number;
  filterPaymentStatusList?: AllPaymentStatusFilterValue[];
  filterStatusCount: number;
  filterCustomer?: CustomerOption;
  hasCustomerOptionError: boolean;
  handleFilterCustomerUpdate: (customer?: CustomerOption) => void;
  handleFilterDateUpdate: (fromDate?: string, toDate?: string, dateOption?: string) => void;
  handleFilterAmountUpdate: (isAmountRange: boolean, fromAmount?: number, toAmount?: number) => void;
  handleFilterStatusUpdate: (statusCount: number, paymentStatusFilterList?: AllPaymentStatusFilterValue[]) => void;
}

const PaymentsListFilter: React.FC<PaymentsListFilterProps> = props => {
  const {
    totalCount,
    defaultCurrency,
    filterDateOption,
    filterFromDate,
    filterToDate,
    filterAmountRange,
    filterFromAmount,
    filterToAmount,
    filterPaymentStatusList,
    filterStatusCount,
    filterCustomer,
    customersEnabled,
    handleFilterCustomerUpdate,
    handleFilterAmountUpdate,
    handleFilterDateUpdate,
    handleFilterStatusUpdate,
    hasCustomerOptionError,
  } = props;
  const classes = useStyles();
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.down('lg'));
  const matchesXs = useMediaQuery(theme.breakpoints.down('md'));

  const defaultDateRange: Range = {
    // Temporary workaround to avoid setting initial date range, may be fixed in a future library release
    startDate: undefined,
    endDate: new Date(''),
    key: 'selection',
  };

  const dateRangeRef = useRef<HTMLDivElement>(null);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [statusFilterOpen, setStatusFilterOpen] = useState(true);
  const [dateFilterOpen, setDateFilterOpen] = useState(true);
  const [amountFilterOpen, setAmountFilterOpen] = useState(true);
  const [customerFilterOpen, setCustomerFilterOpen] = useState(true);
  const [isAmountRange, setIsAmountRange] = useState(false);

  // fields
  const [customerOption, setCustomerOption] = useState<CustomerOption | undefined>(undefined);
  const [customerFieldTextValue, setCustomerFieldTextValue] = useState<string>('');
  const [exactAmount, setExactAmount] = useState<string>('');
  const [isValidExactAmount, setIsValidExactAmount] = useState(true);
  const [fromAmount, setFromAmount] = useState<string>('');
  const [isValidFromAmount, setIsValidFromAmount] = useState(true);
  const [toAmount, setToAmount] = useState<string>('');
  const [isValidToAmount, setIsValidToAmount] = useState(true);
  const [isValidAmountRange, setIsValidAmountRange] = useState(true);
  const [dateOption, setDateOption] = useState('none');
  const [fromDate, setFromDate] = useState('');
  const [isValidFromDate, setIsValidFromDate] = useState(true);
  const [toDate, setToDate] = useState('');
  const [isValidToDate, setIsValidToDate] = useState(true);
  const [isValidDateRange, setIsValidDateRange] = useState(true);
  const [isDateRangeMenuOpen, setIsDateRangeMenuOpen] = useState(false);
  const [dateRange, setDateRange] = useState<Range>(defaultDateRange);
  const [statusList, setStatusList] = useState<AllPaymentStatusFilterValue[]>(PaymentStatusFilterValue);
  const [statusCount, setStatusCount] = useState<number>(MAX_STATUS_COUNT);
  const [showAllStatus, setShowAllStatus] = useState(true);
  const [statusFilterChange, setStatusFilterChange] = useState(false);
  const [dateFilterChange, setDateFilterChange] = useState(false);
  const [paidFilterChange, setPaidFilterChange] = useState(false);
  const [customerFilterChange, setCustomerFilterChange] = useState(false);
  // RangeFocus [number, 0 | 1]
  // `range` represents the index in the list of ranges of the range that's focused
  // `rangeStep` is which step on the range is focused: `0` for start date and `1` for end date
  // This allows to put the range step to 1 (endDate) when the picker is opened from the end date.
  const [focusedRange, setFocusedRange] = useState<RangeFocus | undefined>();

  // filter button enable
  const isFilterEnabled =
    (statusFilterChange || dateFilterChange || paidFilterChange || customerFilterChange) &&
    statusCount > 0 &&
    ((dateOption === 'dateRange' && fromDate && isValidFromDate && toDate && isValidToDate && isValidDateRange) ||
      (dateOption === 'dateRange' && !fromDate && !toDate) ||
      dateOption !== 'dateRange') &&
    ((isAmountRange && toAmount && isValidToAmount && fromAmount && isValidFromAmount && isValidAmountRange) ||
      (isAmountRange && !toAmount && !fromAmount) ||
      (!isAmountRange && exactAmount && isValidExactAmount) ||
      (!isAmountRange && !exactAmount));

  useEffect(() => {
    setDateRange(prev => ({
      startDate: fromDate ? new Date(`${fromDate}T00:00`) : prev.startDate,
      endDate: toDate ? new Date(`${toDate}T00:00`) : prev.endDate,
      key: 'selection',
    }));
  }, [fromDate, toDate]);

  // Checking if there is change in any filter applied if non then disabling apply filter button
  useEffect(() => {
    let hasChange = false;

    if (statusCount !== filterStatusCount) {
      hasChange = true;
    } else {
      const filterStatusList = filterPaymentStatusList || PaymentStatusFilterValue;
      for (let filterIndex = 0; filterIndex < filterStatusList.length; filterIndex += 1) {
        if (statusList[filterIndex].isSelected !== filterStatusList[filterIndex].isSelected) {
          hasChange = true;
          break;
        }
      }
    }

    setStatusFilterChange(hasChange);
  }, [statusList]);

  useEffect(() => {
    let hasChange = false;

    if (dateOption !== 'dateRange') {
      hasChange = dateOption !== (filterDateOption || 'none');
    } else {
      const from = filterFromDate && filterFromDate.length > 10 ? filterFromDate.slice(0, 10) : '';
      const to = filterToDate && filterToDate.length > 10 ? filterToDate.slice(0, 10) : '';
      hasChange = fromDate !== from || toDate !== to;
    }

    setDateFilterChange(hasChange);
  }, [dateOption, fromDate, toDate]);

  useEffect(() => {
    let hasChange = false;

    if (isAmountRange) {
      hasChange =
        Math.round(parseFloat(fromAmount || '0') * 100) !== (filterFromAmount || 0) ||
        Math.round(parseFloat(toAmount || '0') * 100) !== (filterToAmount || 0);
    } else {
      hasChange =
        Math.round(parseFloat(exactAmount || '0') * 100) !== (filterFromAmount || 0) ||
        Math.round(parseFloat(exactAmount || '0') * 100) !== (filterToAmount || 0);
    }

    setPaidFilterChange(hasChange);
  }, [fromAmount, toAmount, exactAmount]);

  useEffect(() => {
    // Check if field value from the customer select field is different.
    setCustomerFilterChange(customerOption?.id !== filterCustomer?.id);
  }, [customerOption?.id]);

  useEffect(() => {
    // Remove customer value
    if (!filterCustomer) {
      setCustomerOption(undefined);
      setCustomerFieldTextValue('');
    }
  }, [filterCustomer]);

  const handleMenuClose = () => {
    if (isMenuOpen) {
      setIsMenuOpen(false);
      setAnchorEl(null);
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    if (!isMenuOpen) {
      event.preventDefault();
      setAnchorEl(event.currentTarget);

      setDateOption(filterDateOption || 'none');
      setIsAmountRange(filterAmountRange);

      if (filterDateOption === 'dateRange') {
        setFromDate(filterFromDate && filterFromDate.length > 10 ? filterFromDate.slice(0, 10) : '');
        setToDate(filterToDate && filterToDate.length > 10 ? filterToDate.slice(0, 10) : '');
      } else {
        setFromDate('');
        setToDate('');
      }

      if (filterAmountRange) {
        const from = filterFromAmount ? (filterFromAmount / 100).toFixed(2).toString() : '';
        const to = filterToAmount ? (filterToAmount / 100).toFixed(2).toString() : '';

        setExactAmount('');
        setFromAmount(from);
        setToAmount(to);
      } else {
        const amount = filterFromAmount ? (filterFromAmount / 100).toFixed(2).toString() : '';
        setExactAmount(amount);
        setFromAmount('');
        setToAmount('');
      }

      setStatusList(filterPaymentStatusList || PaymentStatusFilterValue);
      setStatusCount(filterStatusCount);
      setShowAllStatus(filterStatusCount === MAX_STATUS_COUNT);

      setIsValidAmountRange(true);
      setIsValidDateRange(true);
      setIsValidExactAmount(true);
      setIsValidFromAmount(true);
      setIsValidFromDate(true);
      setIsValidToAmount(true);
      setIsValidToDate(true);
      setStatusFilterChange(false);
      setDateFilterChange(false);
      setPaidFilterChange(false);
      setCustomerFilterChange(false);

      setIsMenuOpen(true);
    }
  };

  const applyFilter = () => {
    // Amount Filter Calculations
    let startAmount: number | undefined;
    let endAmount: number | undefined;
    if (isAmountRange && fromAmount && toAmount) {
      startAmount = Math.round(parseFloat(fromAmount) * 100);
      endAmount = Math.round(parseFloat(toAmount) * 100);

      if (startAmount !== filterFromAmount || endAmount !== filterToAmount) {
        handleFilterAmountUpdate(isAmountRange, startAmount, endAmount);
      }
    } else if (!isAmountRange && exactAmount) {
      startAmount = Math.round(parseFloat(exactAmount) * 100);
      endAmount = Math.round(parseFloat(exactAmount) * 100);

      if (startAmount !== filterFromAmount || endAmount !== filterToAmount) {
        handleFilterAmountUpdate(isAmountRange, startAmount, endAmount);
      }
    } else {
      handleFilterAmountUpdate(isAmountRange, undefined, undefined);
    }

    // Date Filter Calculations
    let startDate: string | undefined;
    let endDate: string | undefined;
    let option: string | undefined = dateOption;

    if (dateOption === 'dateRange' && fromDate && toDate) {
      if (fromDate.length === 10 && toDate.length === 10) {
        startDate = DateTime.utc(
          parseInt(fromDate.slice(0, 4)),
          parseInt(fromDate.slice(5, 7)),
          parseInt(fromDate.slice(8, 10)),
        ).toString();

        endDate = DateTime.utc(
          parseInt(toDate.slice(0, 4)),
          parseInt(toDate.slice(5, 7)),
          parseInt(toDate.slice(8, 10)),
          23,
          59,
          59,
        ).toString();

        if (startDate !== filterFromDate || endDate !== filterToDate) {
          handleFilterDateUpdate(startDate, endDate, dateOption);
        }
      }
    } else if (dateOption !== filterDateOption) {
      switch (dateOption) {
        case 'today': {
          const today = DateTime.now();
          startDate = DateTime.utc(today.year, today.month, today.day).toString();
          endDate = DateTime.utc(today.year, today.month, today.day, 23, 59, 59).toString();
          break;
        }
        case 'yesterday': {
          const today = DateTime.now();
          const yesterday = today.minus({ days: 1 });
          startDate = DateTime.utc(yesterday.year, yesterday.month, yesterday.day).toString();
          endDate = DateTime.utc(yesterday.year, yesterday.month, yesterday.day, 23, 59, 59).toString();
          break;
        }
        case 'thisWeek': {
          const today = DateTime.now();
          const weekDay = today.weekday - 1;
          const firstWeekDay = today.minus({ days: weekDay });
          startDate = DateTime.utc(firstWeekDay.year, firstWeekDay.month, firstWeekDay.day).toString();
          endDate = DateTime.utc(today.year, today.month, today.day, 23, 59, 59).toString();
          break;
        }
        case 'last7Days': {
          const today = DateTime.now();
          const yesterday = today.minus({ days: 1 });
          const lastSeven = today.minus({ days: 7 });
          startDate = DateTime.utc(lastSeven.year, lastSeven.month, lastSeven.day).toString();
          endDate = DateTime.utc(yesterday.year, yesterday.month, yesterday.day, 23, 59, 59).toString();
          break;
        }
        case 'thisMonth': {
          const today = DateTime.now();
          startDate = DateTime.utc(today.year, today.month, 1).toString();
          endDate = DateTime.utc(today.year, today.month, today.day, 23, 59, 59).toString();
          break;
        }
        case 'last30Days': {
          const today = DateTime.now();
          const yesterday = today.minus({ days: 1 });
          const lastThirty = today.minus({ days: 30 });
          startDate = DateTime.utc(lastThirty.year, lastThirty.month, lastThirty.day).toString();
          endDate = DateTime.utc(yesterday.year, yesterday.month, yesterday.day, 23, 59, 59).toString();
          break;
        }
        default: {
          option = undefined;
        }
      }

      handleFilterDateUpdate(startDate, endDate, option);
    }

    handleFilterCustomerUpdate(customerOption);

    // Status Filter Updation [the reload would trigger in status update.]
    handleFilterStatusUpdate(statusCount, statusList);

    handleMenuClose();
  };

  const toggleCustomerFilterOpen = () => {
    setCustomerFilterOpen(!customerFilterOpen);
  };

  const toggleStatusFilterOpen = () => {
    setStatusFilterOpen(!statusFilterOpen);
  };

  const toggleDateFilterOpen = () => {
    setDateFilterOpen(!dateFilterOpen);
  };

  const toggleAmountFilterOpen = () => {
    setAmountFilterOpen(!amountFilterOpen);
  };

  const toggleIsAmountRange = () => {
    setIsAmountRange(!isAmountRange);
    setExactAmount('');
    setIsValidExactAmount(true);
    setFromAmount('');
    setIsValidFromAmount(true);
    setToAmount('');
    setIsValidToAmount(true);
    setIsValidAmountRange(true);
  };

  const checkIsAmountValid = (value: string) => {
    if (value.length === 0) return true;

    const amount = parseFloat(value);

    if (Number.isNaN(amount) || amount < 1 || amount > 10000000) return false;

    return true;
  };

  const checkIsAmountRangeValid = (fromValue: string, toValue: string) => {
    if (fromValue && toValue && isValidFromAmount && isValidToAmount) {
      const amountFrom = parseFloat(fromValue);
      const amountTo = parseFloat(toValue);

      if (amountFrom >= amountTo) return false;
    }
    return true;
  };

  const handleExactAmountChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.trim();
    setExactAmount(value);
    setIsValidExactAmount(checkIsAmountValid(value));
  };

  const handleFromAmountChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.trim();
    setFromAmount(value);
    setIsValidFromAmount(checkIsAmountValid(value));
    setIsValidAmountRange(checkIsAmountRangeValid(value, toAmount));
  };

  const handleToAmountChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.trim();
    setToAmount(value);
    setIsValidToAmount(checkIsAmountValid(value));
    setIsValidAmountRange(checkIsAmountRangeValid(fromAmount, value));
  };

  const handleDateOptionChange = (event: SelectChangeEvent) => {
    setDateOption(event.target.value as string);
    setFromDate('');
    setToDate('');
    setIsValidFromDate(true);
    setIsValidToDate(true);
    setIsValidDateRange(true);
    setFocusedRange(undefined);
    setDateRange(defaultDateRange);
  };

  const handleDateRangeMenu = (isOpen: boolean) => {
    if (!isOpen) {
      setFocusedRange(undefined);
    }
    setIsDateRangeMenuOpen(isOpen);
  };

  const handleEnterKeydown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter') {
      handleDateRangeMenu(true);
    }
  };

  const closeCalendar = () => {
    setFocusedRange(undefined);
    handleDateRangeMenu(false);
  };

  const handleStatusListChange = (value: boolean, index: number) => {
    const updatedStatusList = [...statusList];
    const updatedItem = { ...updatedStatusList[index] };
    updatedItem.isSelected = value;
    updatedStatusList[index] = updatedItem;
    setStatusList(updatedStatusList);

    if (value) {
      if (statusCount === MAX_STATUS_COUNT - 1) setShowAllStatus(true);
      setStatusCount(statusCount + 1);
    } else {
      setStatusCount(statusCount - 1);
      setShowAllStatus(false);
    }
  };

  const handleShowAllChange = (value: boolean) => {
    setShowAllStatus(value);

    if (value) {
      setStatusList(PaymentStatusFilterValue);
      setStatusCount(MAX_STATUS_COUNT);
    } else {
      setStatusList(PaymentStatusFilterValueUnselected);
      setStatusCount(0);
    }
  };

  const checkIsDateRangeValid = (from: string, to: string) => {
    const valueFrom = DateTime.fromISO(from);
    const valueTo = DateTime.fromISO(to);

    return valueFrom <= valueTo;
  };

  const checkIsDateValid = (date: string) => {
    if (date.length !== 10) return false;

    const value = DateTime.fromISO(date);

    if (!value.isValid) return false;

    const today = DateTime.now();
    const valueUTC = DateTime.utc(value.year, value.month, value.day);
    const todayUTC = DateTime.utc(today.year, today.month, today.day);

    // This checks if the date is in the future.
    if (valueUTC > todayUTC) return false;

    return true;
  };

  const handleDateRangeChange = (range: RangeKeyDict) => {
    if ('selection' in range) {
      setDateRange(range.selection);

      if (range.selection.startDate && isValid(range.selection.startDate)) {
        setFromDate(format(range.selection.startDate, 'yyyy-MM-dd'));
        setIsValidFromDate(checkIsDateValid(format(range.selection.startDate, 'yyyy-MM-dd')));
      }

      if (range.selection.endDate && isValid(range.selection.endDate)) {
        setToDate(format(range.selection.endDate, 'yyyy-MM-dd'));
        setIsValidToDate(checkIsDateValid(format(range.selection.endDate, 'yyyy-MM-dd')));
      }

      if (
        range.selection.startDate &&
        isValid(range.selection.startDate) &&
        range.selection.endDate &&
        isValid(range.selection.endDate)
      ) {
        setIsValidDateRange(
          checkIsDateRangeValid(format(range.selection.startDate, 'yyyy-MM-dd'), format(range.selection.endDate, 'yyyy-MM-dd')),
        );
      }
    }
  };

  const handleFromDateChange = (event: ChangeEvent<HTMLInputElement>) => {
    const date = event.target.value;
    setFromDate(date);

    setIsValidFromDate(checkIsDateValid(date));

    if (toDate && isValidToDate && date && isValidFromDate) {
      setIsValidDateRange(checkIsDateRangeValid(date, toDate));
    }
  };

  const handleToDateChange = (event: ChangeEvent<HTMLInputElement>) => {
    const date = event.target.value;
    setToDate(date);

    setIsValidToDate(checkIsDateValid(date));

    if (fromDate && isValidFromDate && date && isValidToDate) {
      setIsValidDateRange(checkIsDateRangeValid(fromDate, date));
    }
  };

  const getStatusFilter = () => {
    return (
      <Grid item container xs={12} direction="column" data-cy="status-filter-list">
        <FormControlLabel
          label="Show All"
          control={<Checkbox checked={showAllStatus} color="primary" onChange={event => handleShowAllChange(event.target.checked)} />}
        />
        {statusList.map((option, index) => {
          return (
            <FormControlLabel
              key={index}
              label={option.display}
              control={
                <Checkbox
                  checked={option.isSelected || showAllStatus}
                  color="primary"
                  onChange={event => {
                    handleStatusListChange(event.target.checked, index);
                  }}
                />
              }
            />
          );
        })}
      </Grid>
    );
  };

  const getDateFilter = () => {
    return (
      <>
        <Grid item xs={12}>
          <FormControl variant="outlined" fullWidth>
            <Select
              id="date-range-select"
              value={dateOption}
              onChange={handleDateOptionChange}
              SelectDisplayProps={{ role: 'listbox' }}
            >
              {DateFilterValue.map((option, index) => {
                return (
                  <MenuItem key={index} value={option.value}>
                    {option.display}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
        </Grid>
        {dateOption === 'dateRange' && (
          <>
            <Grid item xs={12}>
              <TextField
                fullWidth
                variant="outlined"
                id="from-date-textfield-id"
                label="From Date"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        color="inherit"
                        onClick={() => {
                          handleDateRangeMenu(true);
                        }}
                        aria-label="date range icon"
                      >
                        <DateRangeIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                  'aria-describedby': `${isValidFromDate ? undefined : 'from-date-helpertext-id'} ${
                    isValidDateRange ? undefined : 'date-range-helpertext-id'
                  }`,
                }}
                InputLabelProps={{
                  shrink: true,
                }}
                FormHelperTextProps={{ id: 'from-date-helpertext-id' }}
                onChange={handleFromDateChange}
                onKeyDown={handleEnterKeydown}
                classes={{ root: classes.root }}
                autoComplete="off"
                type="date"
                value={fromDate}
                error={!isValidFromDate}
                helperText={isValidFromDate ? null : 'Invalid Date.'}
                data-cy="from-date"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                variant="outlined"
                id="to-date-textfield-id"
                label="To Date"
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
                        aria-label="date range icon"
                      >
                        <DateRangeIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                  'aria-describedby': `${isValidToDate ? undefined : 'to-date-helpertext-id'} ${
                    isValidDateRange ? undefined : 'date-range-helpertext-id'
                  }`,
                }}
                InputLabelProps={{
                  shrink: true,
                }}
                FormHelperTextProps={{ id: 'to-date-helpertext-id' }}
                onChange={handleToDateChange}
                onKeyDown={handleEnterKeydown}
                classes={{ root: classes.root }}
                autoComplete="off"
                type="date"
                value={toDate}
                ref={dateRangeRef}
                error={!isValidToDate}
                helperText={isValidToDate ? null : 'Invalid Date.'}
                data-cy="to-date"
              />
            </Grid>
            {!isValidDateRange && (
              <Grid item xs={12} className={classes.rangeError} id="date-range-helpertext-id">
                <em>To Date</em> should be greater than <em>From Date</em>
              </Grid>
            )}
            <Popover
              open={isDateRangeMenuOpen}
              anchorEl={dateRangeRef?.current}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
              <Grid container className={classes.calendarWrapper}>
                <DateRangePicker
                  ranges={[dateRange]}
                  months={matches ? 1 : 2}
                  onChange={handleDateRangeChange}
                  maxDate={new Date()}
                  weekdayDisplayFormat="EEEEE"
                  startDatePlaceholder="From Date"
                  endDatePlaceholder="To Date"
                  direction="horizontal"
                  focusedRange={focusedRange}
                  fixedHeight
                  showDateDisplay={false}
                  showMonthAndYearPickers={false}
                  rangeColors={[theme.palette.uxBlue.activated || '']}
                />
              </Grid>
              <Grid container justifyContent={'flex-end'} className={classes.padding}>
                <Button variant="contained" color="primary" onClick={closeCalendar} data-cy="date-range-done">
                  Done
                </Button>
              </Grid>
            </Popover>
          </>
        )}
      </>
    );
  };

  const getExactAmount = () => {
    return (
      <Grid item xs={12}>
        <CurrencyFormat
          displayType="input"
          customInput={TextField}
          decimalScale={2}
          allowNegative={false}
          fullWidth
          variant="outlined"
          label={`${defaultCurrency === CurrencyType.Cad ? 'CA' : ''}$ Amount`}
          aria-required="true"
          autoComplete="off"
          error={!isValidExactAmount}
          value={exactAmount}
          onChange={handleExactAmountChange}
          helperText={
            isValidExactAmount
              ? null
              : `Amount must be between ${defaultCurrency === CurrencyType.Cad ? 'CA' : ''}$1 - ${
                  defaultCurrency === CurrencyType.Cad ? 'CA' : ''
                }$10,000,000`
          }
          inputProps={{
            'aria-label': 'exact amount',
            'aria-describedby': `${isValidExactAmount ? undefined : 'exact-amount-helpertext-id'}`,
          }}
          FormHelperTextProps={{ id: 'exact-amount-helpertext-id' }}
          data-cy="payment-exact-amount"
        />
      </Grid>
    );
  };

  const getAmountRange = () => {
    return (
      <>
        <Grid item xs={12}>
          <CurrencyFormat
            displayType="input"
            customInput={TextField}
            decimalScale={2}
            allowNegative={false}
            fullWidth
            variant="outlined"
            label={`${defaultCurrency === CurrencyType.Cad ? 'CA' : ''}$ From Amount`}
            aria-required="true"
            autoComplete="off"
            error={!isValidFromAmount}
            value={fromAmount}
            onChange={handleFromAmountChange}
            helperText={
              isValidFromAmount
                ? null
                : `Amount must be between ${defaultCurrency === CurrencyType.Cad ? 'CA' : ''}$1 - ${
                    defaultCurrency === CurrencyType.Cad ? 'CA' : ''
                  }$10,000,000`
            }
            inputProps={{
              'aria-label': 'from amount',
              'aria-describedby': `${isValidFromAmount ? undefined : 'from-amount-helpertext-id'} ${
                isValidAmountRange ? undefined : 'amount-range-helpertext-id'
              }`,
            }}
            FormHelperTextProps={{ id: 'from-amount-helpertext-id' }}
            data-cy="payment-from-amount"
          />
        </Grid>
        <Grid item xs={12}>
          <CurrencyFormat
            displayType="input"
            customInput={TextField}
            decimalScale={2}
            allowNegative={false}
            fullWidth
            variant="outlined"
            label={`${defaultCurrency === CurrencyType.Cad ? 'CA' : ''}$ To Amount`}
            aria-required="true"
            autoComplete="off"
            error={!isValidToAmount}
            value={toAmount}
            onChange={handleToAmountChange}
            helperText={
              isValidToAmount
                ? null
                : `Amount must be between ${defaultCurrency === CurrencyType.Cad ? 'CA' : ''}$1 - ${
                    defaultCurrency === CurrencyType.Cad ? 'CA' : ''
                  }$10,000,000`
            }
            inputProps={{
              'aria-label': 'to amount',
              'aria-describedby': `${isValidToAmount ? undefined : 'to-amount-helpertext-id'} ${
                isValidAmountRange ? undefined : 'amount-range-helpertext-id'
              }`,
            }}
            FormHelperTextProps={{ id: 'to-amount-helpertext-id' }}
            data-cy="payment-to-amount"
          />
        </Grid>
        {!isValidAmountRange && (
          <Grid item xs={12} className={classes.rangeError} id="amount-range-helpertext-id">
            <em>To Amount</em> should be greater than <em>From Amount</em>
          </Grid>
        )}
      </>
    );
  };

  const getCustomerFilter = () => {
    return (
      <Grid item xs={12}>
        <CustomerAutoComplete
          fieldValue={customerFieldTextValue}
          setFieldValue={setCustomerFieldTextValue}
          customerOption={customerOption}
          setCustomerOption={setCustomerOption}
          hasCustomerOptionError={hasCustomerOptionError}
        />
      </Grid>
    );
  };
  return (
    <>
      <Button
        variant="text"
        color="primary"
        aria-label="payments-filter"
        startIcon={<FilterListIcon />}
        onClick={(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
          handleMenuOpen(event);
        }}
        aria-describedby={isMenuOpen ? 'apply-filter-heading' : undefined}
        data-cy="payments-filter-button"
      >
        FILTERS
      </Button>

      <Popover
        anchorEl={anchorEl}
        open={isMenuOpen}
        onClose={() => {
          handleMenuClose();
        }}
        anchorOrigin={{ vertical: 'bottom', horizontal: -280 }}
      >
        <Grid container className={matchesXs ? classes.containerGridXs : classes.containerGrid}>
          {/* Filter heading */}
          <Grid item container xs={12} className={classes.filterHeader}>
            <Grid item xs={10} id="apply-filter-heading">
              <Typography variant="subtitle2">PAYMENTS: FILTERS</Typography>
              <Typography className={classes.totalCountText} data-cy="result-count">
                {totalCount || 0} Results
              </Typography>
            </Grid>
            <Grid item xs={2} className={classes.closeContainer}>
              <IconButton
                size="small"
                onClick={handleMenuClose}
                className={classes.closeIcon}
                aria-label="close apply filter menu"
                data-cy="close-filter-menu"
              >
                <CloseIcon />
              </IconButton>
            </Grid>
          </Grid>
          <Grid container className={classes.containerFilter} data-cy="filter-container-scrollable">
            {/* Status Filter */}
            <Grid item container xs={12} className={classes.statusFilterContainer}>
              <Grid item container xs={12}>
                <Grid item xs={10}>
                  <Typography className={classes.filterText}>Status</Typography>
                </Grid>
                <Grid item xs={2} className={classes.buttonContainer}>
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={toggleStatusFilterOpen}
                    aria-label={`${statusFilterOpen ? 'collapse' : 'expand'} status filter options`}
                    data-cy="status-filter-drop"
                  >
                    {statusFilterOpen ? <RemoveIcon /> : <AddIcon />}
                  </IconButton>
                </Grid>
                {statusCount === 0 && (
                  <Grid item xs={12} className={classes.rangeError}>
                    At least one Status is required to Apply Filters.
                  </Grid>
                )}
              </Grid>
              {statusFilterOpen && (
                <Grid item container xs={12} spacing={2} className={classes.fieldContainer}>
                  {getStatusFilter()}
                </Grid>
              )}
            </Grid>

            <Grid item xs={12}>
              <Divider orientation="horizontal" style={{ height: '2px' }} />
            </Grid>

            {/* Date Filter */}
            <Grid item container xs={12} className={classes.filterContainerDate}>
              <Grid item container xs={12}>
                <Grid item xs={10}>
                  <Typography className={classes.filterText}>Last Updated</Typography>
                </Grid>
                <Grid item xs={2} className={classes.buttonContainer}>
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={toggleDateFilterOpen}
                    aria-label={`${dateFilterOpen ? 'collapse' : 'expand'} date filter options`}
                    data-cy="date-filter-drop"
                  >
                    {dateFilterOpen ? <RemoveIcon /> : <AddIcon />}
                  </IconButton>
                </Grid>
              </Grid>
              {dateFilterOpen && (
                <Grid item container xs={12} spacing={2} className={classes.fieldContainer}>
                  {getDateFilter()}
                </Grid>
              )}
            </Grid>

            <Grid item xs={12}>
              <Divider orientation="horizontal" style={{ height: '2px' }} />
            </Grid>

            {customersEnabled && (
              <Grid item container xs={12} className={classes.customerFilterContainer}>
                <Grid item container xs={12}>
                  <Grid item xs={10}>
                    <Typography className={classes.filterText}>Customer</Typography>
                  </Grid>
                  <Grid item xs={2} className={classes.buttonContainer}>
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={toggleCustomerFilterOpen}
                      aria-label={`${customerFilterOpen ? 'collapse' : 'expand'} customer filter options`}
                      data-cy="customer-filter-drop"
                    >
                      {customerFilterOpen ? <RemoveIcon /> : <AddIcon />}
                    </IconButton>
                  </Grid>
                </Grid>
                {customerFilterOpen && (
                  <Grid item container xs={12} spacing={2} className={classes.fieldContainer}>
                    {getCustomerFilter()}
                  </Grid>
                )}
              </Grid>
            )}

            <Grid item xs={12}>
              <Divider orientation="horizontal" style={{ height: '2px' }} />
            </Grid>

            {/* Amount Filter */}
            <Grid item container xs={12} className={classes.filterContainer}>
              <Grid item container xs={12}>
                <Grid item xs={10}>
                  <Typography className={classes.filterText}>Paid</Typography>
                </Grid>
                <Grid item xs={2} className={classes.buttonContainer}>
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={toggleAmountFilterOpen}
                    aria-label={`${amountFilterOpen ? 'collapse' : 'expand'} amount filter options`}
                    data-cy="amount-filter-drop"
                  >
                    {amountFilterOpen ? <RemoveIcon /> : <AddIcon />}
                  </IconButton>
                </Grid>
              </Grid>
              {amountFilterOpen && (
                <>
                  <Grid item container xs={12} spacing={2} className={classes.fieldContainer}>
                    {isAmountRange ? getAmountRange() : getExactAmount()}
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      variant="text"
                      size="small"
                      color="primary"
                      onClick={toggleIsAmountRange}
                      className={classes.toggleButton}
                      aria-label={isAmountRange ? 'USE EXACT AMOUNT' : 'USE PAID AMOUNT RANGE'}
                      data-cy="amount-range-toggle"
                    >
                      {isAmountRange ? 'USE EXACT AMOUNT' : 'USE PAID AMOUNT RANGE'}
                    </Button>
                  </Grid>
                </>
              )}
            </Grid>
          </Grid>
          {/* Filter Button */}
          <Grid container justifyContent={'flex-end'} className={classes.applyFilterContainer}>
            <Button
              variant="contained"
              color="primary"
              size="small"
              onClick={applyFilter}
              disabled={!isFilterEnabled}
              data-cy="apply-payments-filter"
            >
              APPLY FILTER
            </Button>
          </Grid>
        </Grid>
      </Popover>
    </>
  );
};

export default PaymentsListFilter;
