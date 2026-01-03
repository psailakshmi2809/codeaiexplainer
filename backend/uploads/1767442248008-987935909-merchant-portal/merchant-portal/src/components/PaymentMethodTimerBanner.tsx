import AlarmIcon from '@mui/icons-material/AccessAlarm';
import { Grid, Theme } from '@mui/material';
import { createStyles, makeStyles } from '@mui/styles';
import React, { useEffect, useState } from 'react';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    grid: {
      padding: theme.spacing(0.5, 2, 0.5, 2),
      margin: theme.spacing(0.5, 0),
      background: theme.palette.warning.light,
      color: theme.palette.warning.main,
    },
    alarmIcon: {
      fontSize: '18px',
      verticalAlign: 'text-bottom',
      marginRight: '5px',
    },
  }),
);

interface PaymentMethodTimerBannerProps {
  timeLimit: number;
  clearOneTimePaymentMethod: () => void;
}
const PaymentMethodTimerBanner: React.FC<PaymentMethodTimerBannerProps> = props => {
  const classes = useStyles();
  const { timeLimit, clearOneTimePaymentMethod } = props;
  const [timeInterval, setTimeInterval] = useState<number>(0);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);

  const functionTest = () => {
    const current = new Date().getTime();
    const difference = timeLimit - current;
    if (difference > 0) {
      const minute = Math.ceil(difference / 60000);
      setTimeInterval(minute);
    } else {
      if (intervalId) {
        clearInterval(intervalId);
        setIntervalId(null);
      }
      setTimeInterval(0);
      clearOneTimePaymentMethod();
    }
  };

  useEffect(() => {
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
    if (timeLimit > 0) {
      functionTest();
      setIntervalId(setInterval(functionTest, 60000));
    } else {
      setTimeInterval(0);
    }
  }, [timeLimit]);

  if (timeInterval > 0) {
    return (
      <Grid item xs={12} className={classes.grid}>
        <AlarmIcon className={classes.alarmIcon} />
        Complete your payment within <b>{`${timeInterval} minute${timeInterval > 1 ? 's ' : ' '}`}</b> to pay using temporary card
      </Grid>
    );
  }

  return null;
};

export default PaymentMethodTimerBanner;
