import { Button, Chip, Divider, Grid, Theme } from '@mui/material';
import { createStyles, makeStyles } from '@mui/styles';
import React from 'react';
import CloseIcon from '@mui/icons-material/Close';
import { AllPaymentRequestsStatusFilterValue, MAX_STATUS_COUNT } from '../util/PaymentRequestsListFilterValue';
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

interface PaymentRequestListFilterChipsProps {
  isLoadingPayments: boolean;
  filterPaymentStatusList?: AllPaymentRequestsStatusFilterValue[];
  filterStatusCount: number;
  filterCustomerOption?: CustomerOption;
  removeStatusFilter: (statusIndex: number) => void;
  removeAllPaymentsFilter: () => void;
  removeCustomerFilter: () => void;
}

const PaymentRequestListFilterChips: React.FC<PaymentRequestListFilterChipsProps> = props => {
  const {
    isLoadingPayments,
    filterStatusCount,
    filterPaymentStatusList,
    filterCustomerOption,
    removeAllPaymentsFilter,
    removeStatusFilter,
    removeCustomerFilter,
  } = props;
  const classes = useStyles();
  const hasStatusFilter = filterStatusCount !== MAX_STATUS_COUNT;
  const hasCustomerFilter = !!filterCustomerOption;
  const hasChips = hasCustomerFilter || hasStatusFilter;

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
            data-cy="payment-requests-filter-clear-all"
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
                    data-cy="payment-request-status-chip"
                  />
                );
              }
              return null;
            })}
          {filterCustomerOption && (
            <Chip
              deleteIcon={<CloseIcon className={classes.chipIcon} />}
              label={`${filterCustomerOption.name} - ${filterCustomerOption.customerNumber}`}
              onDelete={() => {
                removeCustomerFilter();
              }}
              classes={{ root: classes.chipRoot }}
              disabled={isLoadingPayments}
              data-cy="payment-request-customer-chip"
            />
          )}
        </Grid>
      </Grid>
    );
  }

  return null;
};

export default PaymentRequestListFilterChips;
