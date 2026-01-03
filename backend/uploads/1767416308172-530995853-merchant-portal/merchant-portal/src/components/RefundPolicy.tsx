import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  TextField,
  Theme,
  Typography,
} from '@mui/material';
import { createStyles, makeStyles } from '@mui/styles';
import CloseIcon from '@mui/icons-material/Close';
import React, { ChangeEvent, useEffect, useState } from 'react';

interface RefundPolicyProps {
  refundPolicy: string | undefined;
  handleNewRefundPolicy: (refundPolicy: string) => void;
  canEdit: boolean;
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      padding: theme.spacing(0),
    },
    refund: {
      maxHeight: '180px',
      width: '100%',
      overflow: 'hidden',
      whiteSpace: 'nowrap',
      textOverflow: 'ellipsis',
      maxWidth: '60vw',
    },
    modal: {
      padding: theme.spacing(1, 2.5),
    },
    multiLineField: {
      marginTop: theme.spacing(3),
    },
    editActions: {
      padding: theme.spacing(0, 3, 3, 3),
    },
    editButtons: {
      paddingRight: theme.spacing(3),
      paddingLeft: theme.spacing(3),
    },
    error: {
      padding: theme.spacing(2),
      backgroundColor: theme.palette.error.light,
    },
    errorText: {
      paddingRight: theme.spacing(3),
      paddingLeft: theme.spacing(3),
      paddingTop: 4,
      paddingBottom: 4,
      color: theme.palette.error.main,
      fontWeight: 500,
    },
    policyButtons: {
      marginRight: theme.spacing(1),
    },
  }),
);

const RefundPolicy: React.FC<RefundPolicyProps> = props => {
  const classes = useStyles();

  const { refundPolicy, handleNewRefundPolicy, canEdit } = props;
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(refundPolicy);
  const [error, setError] = useState(false);

  useEffect(() => {
    setValue(refundPolicy);
  }, [refundPolicy]);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setValue(refundPolicy); //In case the user clicks escape
    setError(false);
  };

  const handleValueChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (canEdit) {
      setValue(event.target.value);
      if (value) {
        setError(false);
      }
    }
  };

  const handleSaveClick = () => {
    if (!value) {
      setError(true);
    } else {
      handleNewRefundPolicy(value.trim());
      handleClose();
    }
  };

  const refundPolicyModal = (
    <Dialog
      aria-label={'refund policy dialog'}
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      aria-labelledby="modal-title"
    >
      <DialogTitle className={classes.modal} id="modal-title">
        <Grid container alignContent={'center'} justifyContent={'space-between'} spacing={0}>
          <Grid item xs={6}>
            <Typography variant={'title'}>Refund Policy</Typography>
          </Grid>
          <Grid item container xs={6} justifyContent={'end'} spacing={2}>
            <Grid item>
              <IconButton onClick={handleClose} aria-label="close dialog" data-cy="close-refund-policy-dialog" size="large">
                <CloseIcon />
              </IconButton>
            </Grid>
          </Grid>
        </Grid>
      </DialogTitle>
      {error && (
        <Grid container className={classes.error}>
          <Typography className={classes.errorText} data-cy="error-message">
            To send payment requests, you must have a refund policy
          </Typography>
        </Grid>
      )}
      <DialogContent>
        <TextField
          value={value}
          onChange={handleValueChange}
          className={classes.multiLineField}
          variant="outlined"
          multiline
          inputProps={{ 'aria-label': 'refund policy' }}
          label="Refund Policy"
          fullWidth
          minRows={20}
          maxRows={20}
          placeholder="Write or paste your refund policy."
          data-cy="refund-policy"
        />
      </DialogContent>
      <DialogActions className={classes.editActions}>
        <Button
          variant={canEdit ? 'text' : 'outlined'}
          size="small"
          onClick={handleClose}
          className={classes.editButtons}
          data-cy={`${canEdit ? 'cancel' : 'close'}-refund-policy`}
        >
          {canEdit ? 'Cancel' : 'Close'}
        </Button>
        {canEdit && (
          <Button variant="contained" color="primary" size="small" onClick={handleSaveClick} data-cy="save-refund-policy">
            Save
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );

  if (!refundPolicy) {
    if (!canEdit) {
      return <Typography variant="body1">No refund policy. An Editor or Admin must add a refund policy.</Typography>;
    }
    return (
      <>
        <Button variant="outlined" color="primary" onClick={handleOpen} size="small">
          Add Refund Policy
        </Button>
        {refundPolicyModal}
      </>
    );
  }
  return (
    <>
      <Grid xs={12} item>
        <Typography variant="body1" className={classes.refund}>
          {refundPolicy}
        </Typography>
      </Grid>
      <Grid xs={12} item>
        <Button
          variant="outlined"
          color="primary"
          onClick={handleOpen}
          className={classes.policyButtons}
          size="small"
          data-cy={canEdit ? 'manage-policy' : 'view-policy'}
        >
          {canEdit ? 'Manage Policy' : 'View Policy'}
        </Button>
      </Grid>
      {refundPolicyModal}
    </>
  );
};

export default RefundPolicy;
