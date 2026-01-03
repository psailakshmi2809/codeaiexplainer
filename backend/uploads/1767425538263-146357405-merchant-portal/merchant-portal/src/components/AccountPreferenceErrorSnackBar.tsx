import { Alert, Snackbar, Theme, Typography } from '@mui/material';
import { createStyles, makeStyles } from '@mui/styles';
import React from 'react';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    snackbar: {
      minWidth: '100%',
      backgroundColor: theme.palette.error.main,
    },
    alert: {
      backgroundColor: theme.palette.error.main,
    },
    errorText: {
      color: theme.palette.getContrastText(theme.palette.error.main),
    },
  }),
);

interface AccountPreferenceErrorSnackBarProps {
  open: boolean;
  message?: string;
  onClose?: () => void;
}

const AccountPreferenceErrorSnackBar: React.FC<AccountPreferenceErrorSnackBarProps> = props => {
  const classes = useStyles();
  const { open, message, onClose } = props;

  return (
    <Snackbar
      className={classes.snackbar}
      open={open}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'center',
      }}
      onClose={() => {
        if (onClose) onClose();
      }}
      autoHideDuration={5000}
    >
      <Alert className={classes.alert} severity="error">
        <Typography className={classes.errorText}>{message || 'Something went wrong, please try to resave your changes'}</Typography>
      </Alert>
    </Snackbar>
  );
};

export default AccountPreferenceErrorSnackBar;
