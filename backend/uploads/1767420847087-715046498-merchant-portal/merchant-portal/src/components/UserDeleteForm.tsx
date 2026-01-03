import { Button, CircularProgress, DialogActions, FormHelperText, Paper, Theme, Typography } from '@mui/material';
import { createStyles, makeStyles } from '@mui/styles';
import { FC, useEffect, useState } from 'react';

import { Person } from '../gql-types.generated';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {},
    paper: {
      width: 400,
      padding: theme.spacing(3),
    },
    actions: {
      marginTop: theme.spacing(4),
    },
    header: {
      marginBottom: theme.spacing(1),
    },
    body: {
      marginBottom: theme.spacing(2),
    },
    formProgress: {
      color: theme.palette.primary.main,
      position: 'absolute',
      top: '50%',
      left: '50%',
      marginTop: -25,
      marginLeft: -25,
    },
  }),
);

interface UserDeleteFormProps {
  close: () => void;
  user: Person | null | undefined;
  userError: Error | undefined;
  networkBusy: boolean | undefined;
  submit: (id: string | undefined) => void;
}

const UserForm: FC<UserDeleteFormProps> = props => {
  const classes = useStyles();
  // Existing user for edit should have a unique id associated with it for identification.
  const { user, submit, userError, networkBusy } = props;
  const id = user?.id; // Fill from the loaded userId if existing.
  const [submitted, setSubmitted] = useState(false); // Submitted state of the form
  const [isFormBusy, setIsFormBusy] = useState(false); // Busy state of the form itself.

  useEffect(() => {
    if (networkBusy && !userError) {
      setIsFormBusy(true);
      return;
    }
    setIsFormBusy(false);
    if (userError) {
      setSubmitted(false);
      return;
    }
    // Error value can be stale if the effect was ran via a different dependency, must also have a success message to close.
    if (!userError && submitted && !networkBusy) {
      props.close();
    }
  }, [userError, networkBusy]);

  const submitForm = () => {
    setSubmitted(true);
    submit(id);
  };

  return (
    <Paper className={classes.paper} elevation={0}>
      <Typography variant="h6" className={classes.header} id="modal-title" data-cy="delete-user-dialog-header">
        Delete user
      </Typography>
      <Typography variant="body1" className={classes.body} id="modal-description">
        Are you sure you want to delete {user?.firstName} {user?.lastName}?
      </Typography>
      <DialogActions className={classes.actions}>
        <Button
          color="primary"
          onClick={() => {
            props.close();
          }}
          disabled={isFormBusy || submitted}
          data-cy="delete-user-cancel"
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={() => {
            submitForm();
          }}
          disabled={isFormBusy || submitted}
          data-cy="delete-user-delete"
        >
          DELETE
        </Button>
      </DialogActions>
      {(isFormBusy || submitted) && <CircularProgress aria-label={'progress spinner'} size={50} className={classes.formProgress} />}
      {userError && (
        <FormHelperText error>
          Unable to delete the user.
          <br />
          {userError.message}
        </FormHelperText>
      )}
    </Paper>
  );
};

export default UserForm;
