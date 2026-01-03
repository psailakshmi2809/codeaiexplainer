import { Box, Grid, IconButton, Popover, Theme, Tooltip, Typography, useMediaQuery } from '@mui/material';
import { createStyles, makeStyles } from '@mui/styles';
import React, { useState } from 'react';
import { AccountBalances } from '../gql-types.generated';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import { isToday, isYesterday } from '../util/Dates';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    tooltip: {
      cursor: 'pointer',
      marginLeft: '0.3rem',
    },
    balanceWrap: {
      lineHeight: 1,
    },
    balance: {
      lineHeight: 1,
    },
    balancePopover: {
      padding: 8,
    },
    container: {
      marginRight: 4,
      textTransform: 'none',
      [theme.breakpoints.down(375)]: {
        'margin-right': 0,
        padding: '6px',
      },
    },
    icon: {
      color: theme.palette.uxGrey.main,
    },
  }),
);

interface AccountBalanceToolProps {
  defaultCurrency?: string | null;
  balances: AccountBalances | null | undefined;
}

const AccountBalanceTool: React.FC<AccountBalanceToolProps> = (props: AccountBalanceToolProps): JSX.Element | null => {
  const classes = useStyles();
  const { balances, defaultCurrency } = props;
  const matchesMdDown = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));
  const matchesSmDown = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'));
  const [anchorEl, setAnchorEl] = useState<HTMLAnchorElement | null>();
  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (event?.currentTarget) {
      setAnchorEl(event?.currentTarget);
    }
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  // TODO: Default to browser locale if no defualt?
  const balanceValue = balances ? balances.balance : 0;
  const currentBalance = new Intl.NumberFormat('en', {
    style: 'currency',
    currencyDisplay: 'symbol',
    currency: defaultCurrency || 'USD',
  }).format((balanceValue || 0) / 100);

  let updatedTime = '(not synced)';
  if (balances && balances.updatedTimestamp) {
    const updatedDate = new Date(balances?.updatedTimestamp);
    if (isToday(updatedDate)) {
      updatedTime = `As of today at ${new Intl.DateTimeFormat('en', {
        hour: 'numeric',
        minute: 'numeric',
      }).format(updatedDate)}`;
    } else if (isYesterday(updatedDate)) {
      updatedTime = `As of yesterday at ${new Intl.DateTimeFormat('en', {
        hour: 'numeric',
        minute: 'numeric',
      }).format(updatedDate)}`;
    } else {
      updatedTime = `As of ${new Intl.DateTimeFormat('en', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
      }).format(updatedDate)}`;
    }
    updatedTime += ' - refreshes hourly';
  }

  const accountBalanceVisual = (
    <Box className={classes.balanceWrap} tabIndex={0} padding={'0px 12px'}>
      <Typography variant={matchesMdDown ? 'h4' : 'h5'} className={classes.balance} textAlign={'center'} aria-label={currentBalance}>
        {currentBalance}
      </Typography>
      {(!matchesMdDown || matchesSmDown) && (
        <Grid container alignItems="center" alignContent="center">
          <Typography variant="body2">Account Balance</Typography>
          <Tooltip title={updatedTime} aria-label={updatedTime} className={classes.tooltip} aria-hidden="false">
            <InfoOutlinedIcon htmlColor="grey" fontSize="small" />
          </Tooltip>
        </Grid>
      )}
    </Box>
  );
  if (matchesSmDown) {
    return (
      <>
        <IconButton
          onClick={event => handleClick(event as unknown as React.MouseEvent<HTMLAnchorElement, MouseEvent>)}
          className={classes.container}
          aria-label="Account Balance"
          size="large"
        >
          <AccountBalanceIcon className={classes.icon} />
        </IconButton>
        <Popover
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          keepMounted
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => {
            handleClose();
          }}
        >
          <Box className={classes.balancePopover}>{accountBalanceVisual}</Box>
        </Popover>
      </>
    );
  }
  return accountBalanceVisual;
};

export default AccountBalanceTool;
