import { Button, Divider, Grid, IconButton, Theme, Typography } from '@mui/material';
import { createStyles, makeStyles } from '@mui/styles';
import CloseIcon from '@mui/icons-material/Close';
import React from 'react';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      padding: theme.spacing(3, 3, 1, 3),
      borderRadius: 0,
    },
    logo: {
      height: 50,
    },
    header: {
      paddingBottom: theme.spacing(1),
    },
    merchantName: {
      fontWeight: 500,
    },
    divider: {
      paddingTop: theme.spacing(1),
      paddingBottom: theme.spacing(1),
    },
    overdueDate: {
      fontWeight: 500,
      color: theme.palette.error.main,
    },
    date: {
      fontWeight: 500,
    },
    payButton: {
      width: '100%',
      height: 60,
      cursor: 'default',
      '&:hover': {
        background: theme.palette.uxBlue.main,
      },
    },
    contentRow: {
      paddingTop: theme.spacing(1),
      paddingBottom: theme.spacing(1),
    },
    contentMessage: {
      paddingTop: theme.spacing(2),
      paddingBottom: theme.spacing(2),
    },
    disclaimer: {
      paddingTop: theme.spacing(1),
    },
    poweredBy: {
      paddingTop: theme.spacing(2),
    },
    apteanLogo: {
      height: '20px',
      marginLeft: theme.spacing(0),
      marginTop: '15px',
    },
    poweredByText: {
      fontSize: 13,
      lineHeight: 4,
      textAlign: 'right',
      paddingRight: theme.spacing(1),
    },
    wrappedText: {
      wordBreak: 'break-word',
    },
  }),
);

interface PaymentReminderEmailPreviewProps {
  overdue: boolean;
  message?: string;
  merchantName?: string;
  logoUrl?: string;
  close: () => void;
}

const PaymentReminderEmailPreview: React.FC<PaymentReminderEmailPreviewProps> = props => {
  const { close, overdue, message, merchantName, logoUrl } = props;
  const classes = useStyles();
  return (
    <Grid container className={classes.root}>
      <Grid item container xs={12} className={classes.header}>
        <Grid item xs={11}>
          {logoUrl ? <img className={classes.logo} src={logoUrl} alt={'customer logo'} /> : null}
          <Typography>PAYMENT DUE</Typography>
          {merchantName ? <Typography variant={'h5'}>{merchantName}</Typography> : null}
        </Grid>
        <Grid item xs={1}>
          <IconButton onClick={close} data-cy={'close-preview'}>
            <CloseIcon />
          </IconButton>
        </Grid>
      </Grid>
      {overdue && (
        <Grid item xs={12} padding={'8px 0px'}>
          <Typography variant={'body1'}>
            Your payment due on <span className={classes.overdueDate}>MM/DD/YYYY</span> is overdue.
          </Typography>
        </Grid>
      )}
      {!overdue && (
        <Grid item xs={12} padding={'8px 0px'}>
          <Typography variant={'body1'}>
            Your upcoming payment is due by <span className={classes.date}>MM/DD/YYYY</span>.
          </Typography>
        </Grid>
      )}
      <Grid container>
        <Grid item className={classes.contentRow} xs={5}>
          <Typography variant={'body2'}>Order#</Typography>
        </Grid>
        <Grid item className={classes.contentRow} xs={7}>
          <Typography variant={'subtitle'}>Order - 01</Typography>
        </Grid>
        <Grid item className={classes.contentRow} xs={5}>
          <Typography variant={'body2'}>Customer PO#</Typography>
        </Grid>
        <Grid item className={classes.contentRow} xs={7}>
          <Typography variant={'subtitle'}>Customer PO - 01</Typography>
        </Grid>
        <Grid item className={classes.contentRow} xs={5}>
          <Typography variant={'body2'}>Invoice#</Typography>
        </Grid>
        <Grid item className={classes.contentRow} xs={7}>
          <Typography variant={'subtitle'}>Customer Invoice - 00001</Typography>
        </Grid>
        <Grid item className={classes.contentRow} xs={5}>
          <Typography variant={'body2'}>Total</Typography>
        </Grid>
        <Grid item className={classes.contentRow} xs={7}>
          <Typography variant={'subtitle'}>$2000</Typography>
        </Grid>
      </Grid>
      <Grid item xs={12}>
        <Grid item className={classes.contentMessage} xs={12}>
          <Typography variant={'body2'} className={classes.wrappedText}>
            {message}
          </Typography>
        </Grid>
      </Grid>
      <Grid item xs={12}>
        <Button className={classes.payButton} variant={'contained'}>
          Click or tap to pay
        </Button>
      </Grid>
      <Grid item xs={12}>
        <Grid item className={classes.disclaimer} xs={12}>
          <Typography variant={'body2'}>Please do not respond to this email, as it is automatically generated.</Typography>
        </Grid>
      </Grid>
      <Grid item xs={12}>
        <Divider className={classes.divider} />
      </Grid>
      <Grid item container justifyContent={'center'} alignContent={'center'} xs={12}>
        <Grid item xs={5}>
          <Typography className={classes.poweredByText} variant={'body2'}>
            Powered by
          </Typography>
        </Grid>
        <Grid item xs={7}>
          <img className={classes.apteanLogo} src={'logo.png'}></img>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default PaymentReminderEmailPreview;
