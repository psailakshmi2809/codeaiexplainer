import { ChangeEvent, useEffect, useState } from 'react';
import { Button, DialogActions, DialogContent, TextField, Popover, Theme } from '@mui/material';
import { createStyles, makeStyles } from '@mui/styles';
import { useSelector } from 'react-redux';
import { selectForwardPaymentRequestInFlight } from '../features/home/HomeSlice';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    dialogContent: {
      width: 350,

      [theme.breakpoints.down('md')]: {
        width: 300,
      },
    },
  }),
);

interface ForwardDialogProps {
  anchorElement: null | HTMLElement;
  handleClose: () => void;
  handleForward: (email: string) => void;
}

const ForwardDialog: React.FC<ForwardDialogProps> = props => {
  const styles = useStyles();
  const forwardPaymentRequestInFlight = useSelector(selectForwardPaymentRequestInFlight);
  const { anchorElement, handleClose, handleForward } = props;
  const [email, setEmail] = useState<string>('');
  const [emailValid, setEmailValid] = useState<boolean>(true);

  useEffect(() => {
    if (!anchorElement) {
      setEmail('');
      setEmailValid(true);
    }
  }, [anchorElement]);

  const onEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!emailValid) setEmailValid(true);
    setEmail(e.target.value);
  };

  const validateEmail = () => {
    if (!email) setEmailValid(false);

    const emailFormat = RegExp(/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/);
    setEmailValid(!!emailFormat.test(email));
  };

  const forwardPaymentRequest = () => {
    validateEmail();

    if (emailValid) {
      handleForward(email);
    }
  };

  const closeDialog = () => {
    setEmail('');
    handleClose();
  };

  return (
    <Popover
      open={!!anchorElement}
      anchorEl={anchorElement}
      onClose={(event, reason) => {
        if (reason !== 'backdropClick') {
          handleClose();
        }
      }}
      hideBackdrop
      aria-label="Forward Payment Request Dialog"
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'left',
      }}
    >
      <DialogContent className={styles.dialogContent}>
        <TextField
          fullWidth
          value={email}
          onChange={onEmailChange}
          onBlur={validateEmail}
          error={!emailValid}
          helperText={emailValid ? '' : 'Invalid Email Address'}
          label="Email Address"
          variant="outlined"
          color="primary"
        />
      </DialogContent>
      <DialogActions>
        <Button color="primary" onMouseDown={closeDialog} disabled={forwardPaymentRequestInFlight}>
          Cancel
        </Button>
        <Button
          disabled={forwardPaymentRequestInFlight || !email || !emailValid}
          color="primary"
          variant="contained"
          onClick={forwardPaymentRequest}
        >
          Send
        </Button>
      </DialogActions>
    </Popover>
  );
};

export default ForwardDialog;
