import {
  Button,
  Checkbox,
  Divider,
  FormControlLabel,
  Grid,
  IconButton,
  Popover,
  Theme,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { createStyles, makeStyles } from '@mui/styles';
import CustomerAutoComplete from './CustomerAutoComplete';
import React, { useEffect, useState } from 'react';
import FilterListIcon from '@mui/icons-material/FilterList';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { CustomerOption } from '../custom-types/CustomerOption';
import {
  AllPaymentRequestsStatusFilterValue,
  PaymentRequestsStatusFilterValue,
  PaymentRequestsStatusFilterValueUnselected,
  MAX_STATUS_COUNT,
} from '../util/PaymentRequestsListFilterValue';

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
    customerFilterContainer: {
      padding: theme.spacing(2, 1.5, 1, 0.5),
    },
    applyFilterContainer: {
      padding: theme.spacing(2, 1.5, 2, 0.5),
    },
    fieldContainer: {
      padding: theme.spacing(1, 0),
    },
    customerFieldContainer: {
      padding: theme.spacing(1, 0),
      paddingBottom: 148,
    },
    rangeError: {
      color: theme.palette.error.main,
    },
    padding: {
      padding: theme.spacing(1),
    },
    containerFilter: {
      maxHeight: 'calc(100vh - 162px)',
      overflowY: 'auto',
      padding: theme.spacing(1),
      position: 'relative',
    },
    filterHeader: {
      padding: theme.spacing(1),
    },
  }),
);

interface PaymentRequestListFilterProps {
  totalCount?: number;
  customersEnabled: boolean;
  customerList?: CustomerOption[];
  filterPaymentRequestStatusList?: AllPaymentRequestsStatusFilterValue[];
  filterStatusCount: number;
  filterCustomer?: CustomerOption;
  hasCustomerOptionError: boolean;
  handleFilterCustomerUpdate: (customer?: CustomerOption) => void;
  handleFilterStatusUpdate: (statusCount: number, paymentRequestStatusFilterList?: AllPaymentRequestsStatusFilterValue[]) => void;
}

const PaymentRequestListFilter: React.FC<PaymentRequestListFilterProps> = props => {
  const {
    totalCount,
    filterPaymentRequestStatusList,
    filterStatusCount,
    filterCustomer,
    customersEnabled,
    handleFilterCustomerUpdate,
    handleFilterStatusUpdate,
    hasCustomerOptionError,
  } = props;
  const classes = useStyles();
  const theme = useTheme();
  const matchesXs = useMediaQuery(theme.breakpoints.down('sm'));
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [statusFilterOpen, setStatusFilterOpen] = useState(true);
  const [customerFilterOpen, setCustomerFilterOpen] = useState(true);

  // fields
  const [customerOption, setCustomerOption] = useState<CustomerOption | undefined>(undefined);
  const [customerFieldTextValue, setCustomerFieldTextValue] = useState<string>('');
  const [statusList, setStatusList] = useState<AllPaymentRequestsStatusFilterValue[]>(PaymentRequestsStatusFilterValue);
  const [statusCount, setStatusCount] = useState<number>(MAX_STATUS_COUNT);
  const [showAllStatus, setShowAllStatus] = useState(true);
  const [statusFilterChange, setStatusFilterChange] = useState(false);
  const [customerFilterChange, setCustomerFilterChange] = useState(false);

  // filter button enable
  const isFilterEnabled = statusCount > 0 && (statusFilterChange || customerFilterChange);

  // Checking if there is change in any filter applied if non then disabling apply filter button
  useEffect(() => {
    let hasChange = false;

    if (statusCount !== filterStatusCount) {
      hasChange = true;
    } else {
      const filterStatusList = filterPaymentRequestStatusList || PaymentRequestsStatusFilterValue;
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

      setStatusList(filterPaymentRequestStatusList || PaymentRequestsStatusFilterValue);
      setStatusCount(filterStatusCount);
      setShowAllStatus(filterStatusCount === MAX_STATUS_COUNT);

      setStatusFilterChange(false);
      setCustomerFilterChange(false);

      setIsMenuOpen(true);
    }
  };

  const applyFilter = () => {
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
      setStatusList(PaymentRequestsStatusFilterValue);
      setStatusCount(MAX_STATUS_COUNT);
    } else {
      setStatusList(PaymentRequestsStatusFilterValueUnselected);
      setStatusCount(0);
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
        aria-label="payment-request-filter"
        startIcon={<FilterListIcon />}
        onClick={(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
          handleMenuOpen(event);
        }}
        aria-describedby={isMenuOpen ? 'apply-filter-heading' : undefined}
        data-cy="payment-request-filter-button"
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
              <Typography variant="subtitle2">PAYMENT REQUESTS: FILTERS</Typography>
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
                  <Grid item container xs={12} spacing={2} className={classes.customerFieldContainer}>
                    {getCustomerFilter()}
                  </Grid>
                )}
              </Grid>
            )}
          </Grid>
          {/* Filter Button */}
          <Grid container justifyContent={'flex-end'} className={classes.applyFilterContainer}>
            <Button
              variant="contained"
              color="primary"
              size="small"
              onClick={applyFilter}
              disabled={!isFilterEnabled}
              data-cy="apply-payment-request-filter"
            >
              APPLY FILTER
            </Button>
          </Grid>
        </Grid>
      </Popover>
    </>
  );
};

export default PaymentRequestListFilter;
