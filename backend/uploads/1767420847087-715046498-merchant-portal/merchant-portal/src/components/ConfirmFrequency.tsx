import { FC } from 'react';
import { Theme, Box, DialogTitle, DialogContentText, DialogActions, Button, Typography } from '@mui/material';
import { createStyles, makeStyles } from '@mui/styles';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    textSection: {
      margin: 0,
      padding: theme.spacing(1.5, 3),
    },
    dialogContextTitle: {
      color: 'black',
      marginBottom: 0,
    },
    dialogTitle: {
      padding: theme.spacing(2, 0),
    },
    dialogTitleText: {
      fontWeight: 500,
    },
    dialogActionsHouse: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      padding: theme.spacing(2, 3, 3),
    },
    cancelButton: {
      marginRight: theme.spacing(2),
    },
  }),
);

interface ConfirmFrequencyProps {
  cancel: () => void;
  confirm: () => void;
}

const ConfirmFrequency: FC<ConfirmFrequencyProps> = props => {
  const classes = useStyles();
  const { cancel, confirm } = props;

  return (
    <Box>
      <Box className={classes.textSection}>
        <DialogTitle className={classes.dialogTitle} data-cy="frequency-dialog-title">
          <Typography className={classes.dialogTitleText} variant="h5" id="modal-title">
            Confirm your frequency?
          </Typography>
        </DialogTitle>
        <DialogContentText className={classes.dialogContextTitle} id="modal-description">
          Please be aware that if you select daily frequency, you will NOT be able to change to weekly or monthly frequency later.
        </DialogContentText>
      </Box>
      <DialogActions className={classes.dialogActionsHouse}>
        <Button className={classes.cancelButton} onClick={cancel} color="primary">
          Cancel
        </Button>
        <Button onClick={confirm} type="submit" variant="contained" color="primary">
          Confirm
        </Button>
      </DialogActions>
    </Box>
  );
};

export default ConfirmFrequency;
