import { Button, Chip, Divider, Grid, Theme } from '@mui/material';
import { createStyles, makeStyles } from '@mui/styles';
import React from 'react';

import CloseIcon from '@mui/icons-material/Close';
import { CurrencyType } from '../gql-types.generated';
import { AllPaymentStatusFilterValue, DateFilterValue, MAX_STATUS_COUNT } from '../util/PaymentsListFilterValue';
import { CustomerOption } from '../custom-types/CustomerOption';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    chipsContainer: {
      padding: theme.spacing(0.5),
    },
    chipRoot: {
      backgroundColor: theme.palette.uxGrey.hover,
      fontWeight: 'bold',
      paddingRight: 3,
      marginRight: theme.spacing(1),
      marginBottom: theme.spacing(1),
    },
    chipIcon: {
      height: '15px',
      width: '15px',
      color: 'black',
    },
    clearAll: {
      marginBottom: theme.spacing(1),
    },
    divider: {
      padding: theme.spacing(0.5, 0),
    },
  }),
);

interface PaymentsListFilterChipsProps {
  isLoadingPayments: boolean;
  defaultCurrency?: string | null;
  filterDateOption?: string;
  filterFromDate?: string;
  filterToDate?: string;
  filterAmountRange: boolean;
  filterFromAmount?: number;
  filterToAmount?: number;
  filterPaymentStatusList?: AllPaymentStatusFilterValue[];
  filterStatusCount: number;
  filterCustomerOption?: CustomerOption;
  removeStatusFilter: (statusIndex: number) => void;
  removeDateRange: (reload: boolean) => void;
  removeAmountRange: (reload: boolean) => void;
  removeAllPaymentsFilter: () => void;
  removeCustomerFilter: () => void;
}

const PaymentsListFilterChips: React.FC<PaymentsListFilterChipsProps> = props => {
  const {
    isLoadingPayments,
    defaultCurrency,
    filterDateOption,
    filterFromDate,
    filterToDate,
    filterAmountRange,
    filterFromAmount,
    filterToAmount,
    filterStatusCount,
    filterPaymentStatusList,
    filterCustomerOption,
    removeDateRange,
    removeAmountRange,
    removeAllPaymentsFilter,
    removeStatusFilter,
    removeCustomerFilter,
  } = props;
  const classes = useStyles();

  const currencySymbol = defaultCurrency === CurrencyType.Cad ? 'CA$' : '$';
  const fromAmount = filterFromAmount ? `${currencySymbol}${(filterFromAmount / 100).toFixed(2).toString()}` : '';
  const toAmount = filterToAmount ? `${currencySymbol}${(filterToAmount / 100).toFixed(2).toString()}` : '';

  const dateRange =
    filterFromDate && filterToDate
      ? `${filterFromDate.slice(0, 10).replaceAll('-', '/')} - ${filterToDate.slice(0, 10).replaceAll('-', '/')}`
      : '';

  const hasFilterAmount = filterFromAmount && filterToAmount && filterFromAmount >= 100 && filterToAmount >= 100;
  const hasFilterDate = filterDateOption && filterFromDate && filterToDate;
  const hasStatusFilter = filterStatusCount !== MAX_STATUS_COUNT;
  const hasCustomerFilter = !!filterCustomerOption;

  const hasChips = hasCustomerFilter || hasFilterAmount || hasFilterDate || hasStatusFilter;

  if (hasChips) {
    return (
      <Grid container>
        <Grid item xs={12} className={classes.divider}>
          <Divider orientation="horizontal" />
        </Grid>

        <Grid item container xs={12} alignItems="center" className={classes.chipsContainer}>
          <Button
            variant="text"
            size="small"
            color="primary"
            onClick={removeAllPaymentsFilter}
            disabled={isLoadingPayments}
            className={classes.clearAll}
            data-cy="payments-filter-clear-all"
          >
            CLEAR ALL
          </Button>
          {hasStatusFilter &&
            filterPaymentStatusList?.map((option, index) => {
              if (option.isSelected) {
                return (
                  <Chip
                    key={index}
                    deleteIcon={<CloseIcon className={classes.chipIcon} />}
                    label={option.display}
                    onDelete={() => removeStatusFilter(index)}
                    classes={{ root: classes.chipRoot }}
                    disabled={isLoadingPayments}
                    data-cy="status-chip"
                  />
                );
              }
              return null;
            })}
          {filterDateOption === 'dateRange' && (
            <Chip
              deleteIcon={<CloseIcon className={classes.chipIcon} />}
              label={dateRange}
              onDelete={() => {
                removeDateRange(true);
              }}
              classes={{ root: classes.chipRoot }}
              disabled={isLoadingPayments}
              data-cy="date-chip"
            />
          )}
          {filterDateOption && filterDateOption !== 'dateRange' && (
            <Chip
              deleteIcon={<CloseIcon className={classes.chipIcon} />}
              label={
                DateFilterValue.find(option => {
                  return option.value === filterDateOption;
                })?.display
              }
              onDelete={() => {
                removeDateRange(true);
              }}
              classes={{ root: classes.chipRoot }}
              disabled={isLoadingPayments}
              data-cy="date-chip"
            />
          )}
          {filterFromAmount && filterToAmount && (
            <Chip
              deleteIcon={<CloseIcon className={classes.chipIcon} />}
              label={filterAmountRange ? `${fromAmount} - ${toAmount}` : fromAmount}
              onDelete={() => {
                removeAmountRange(true);
              }}
              classes={{ root: classes.chipRoot }}
              disabled={isLoadingPayments}
              data-cy="amount-chip"
            />
          )}
          {filterCustomerOption && (
            <Chip
              deleteIcon={<CloseIcon className={classes.chipIcon} />}
              label={`${filterCustomerOption.name} - ${filterCustomerOption.customerNumber}`}
              onDelete={() => {
                removeCustomerFilter();
              }}
              classes={{ root: classes.chipRoot }}
              disabled={isLoadingPayments}
              data-cy="customer-chip"
            />
          )}
        </Grid>
      </Grid>
    );
  }

  return null;
};

export default PaymentsListFilterChips;
