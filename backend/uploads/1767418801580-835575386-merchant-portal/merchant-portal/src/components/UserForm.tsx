import {
  Button,
  CircularProgress,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormHelperText,
  Grid,
  InputLabel,
  Paper,
  Select,
  TextField,
  Theme,
  Typography,
} from '@mui/material';
import { createStyles, makeStyles } from '@mui/styles';
import InfoIcon from '@mui/icons-material/Info';
import { ChangeEvent, FC, useEffect, useState } from 'react';

import { Person, AppRole } from '../gql-types.generated';
import { roleInfo } from '../util/RoleInfo';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    formProgress: {
      color: theme.palette.primary.main,
      position: 'absolute',
      top: '50%',
      left: '50%',
      marginTop: -25,
      marginLeft: -25,
    },
    roleInformation: {
      color: theme.palette.text.secondary,
      display: 'flex',
      alignItems: 'center',
      padding: theme.spacing(1, 1.5, 0, 1.5),
    },
    roleInfoIcon: {
      marginRight: theme.spacing(1),
    },
    content: {
      overflow: 'visible',
    },
    errorSection: {
      padding: theme.spacing(0.5, 2),
    },
  }),
);

interface UserFormProps {
  close: () => void;
  user?: Person | null | undefined;
  userError: Error | undefined;
  networkBusy: boolean | undefined;
  submit: (firstName: string, lastName: string, email: string, role: AppRole, id?: string) => void;
  viewerUser?: Person | null | undefined;
  hasOneAdmin: boolean;
}

const UserForm: FC<UserFormProps> = props => {
  const classes = useStyles();
  // Existing user for edit should have a unique id associated with it for identification.
  const { user, userError, networkBusy, submit, viewerUser, hasOneAdmin } = props;
  const id = user?.id; // Fill from the loaded userId if existing.
  const [formDirty, setFormDirty] = useState(false); // Dirty state of the form.
  const [firstName, setFirstName] = useState(user?.firstName || ''); // Fill values if editing a user
  const [lastName, setLastName] = useState(user?.lastName || ''); // Fill values if editing a user
  const [email, setEmail] = useState(user?.email || ''); //  Fill values if editing a user
  const [role, setRole] = useState(user?.relationship?.role || AppRole.Reader); //  Fill values if editing a user. Defaults to Reader
  const [emailInvalid, setEmailInvalid] = useState(false); // Default invalid state to false
  const [submitted, setSubmitted] = useState(false); // Submitted state of the form
  const [isFormBusy, setIsFormBusy] = useState(false); // Busy state of the form itself.
  const emailDisabled = user?.email !== null && id !== undefined; // disable the email field if we have an id and its not blank
  const isOnlyAdmin = hasOneAdmin && user?.relationship?.role === AppRole.Admin;
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

  const isEmailValid = (emailValue: string) => {
    // Valid if no value.
    if (!emailValue) {
      return true;
    }
    const matches = emailValue ? emailValue.match(/^([\w.%+-]+)@([\w-]+\.)+([\w]{2,})$/i) || [] : [];
    return matches.length > 0;
  };
  const isFormValid = () => {
    return formDirty && firstName && lastName && email && isEmailValid(email) && role;
  };
  const submitForm = () => {
    setSubmitted(true);
    submit(firstName, lastName, email, role, id);
  };
  const handleFirstNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    setFormDirty(true);
    setFirstName(event.target.value);
  };
  const handleLastNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    setFormDirty(true);
    setLastName(event.target.value);
  };
  const handleEmailChange = (event: ChangeEvent<HTMLInputElement>) => {
    const emailValue = event.target.value;
    setEmailInvalid(!isEmailValid(emailValue));
    if (!emailInvalid) {
      setFormDirty(true);
    }
    setEmail(emailValue);
  };
  const handleRoleChange = (event: ChangeEvent<HTMLInputElement>) => {
    // Set as the Role value structure.
    setFormDirty(true);
    const roleChangeValue = event.target.value || AppRole.Reader;
    setRole(roleChangeValue as AppRole);
  };

  return (
    <Paper sx={{ maxWidth: 400 }} elevation={0}>
      <DialogTitle>
        <Typography variant="title" id="modal-title">
          {user?.id ? 'Edit user' : 'Add new user'}
        </Typography>
      </DialogTitle>
      <DialogContent className={classes.content}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              variant="outlined"
              fullWidth
              disabled={isFormBusy || submitted}
              autoFocus
              value={firstName}
              label="First Name"
              inputProps={{ 'aria-label': 'first name' }}
              onChange={handleFirstNameChange}
              required
              data-cy="first-name"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              variant="outlined"
              fullWidth
              disabled={isFormBusy || submitted}
              value={lastName}
              label="Last Name"
              inputProps={{ 'aria-label': 'last name' }}
              onChange={handleLastNameChange}
              required
              data-cy="last-name"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              error={emailInvalid}
              variant="outlined"
              value={email}
              label="Email"
              inputProps={{ 'aria-label': 'email' }}
              type="email"
              disabled={isFormBusy || submitted || emailDisabled}
              onChange={handleEmailChange}
              required
              data-cy="email"
            />
          </Grid>
          <Grid item xs={12}>
            <FormControl variant="outlined" fullWidth onChange={handleRoleChange} defaultValue={AppRole.Reader}>
              <InputLabel>Account Type</InputLabel>
              <Select
                native
                label={'Account Type'}
                disabled={isFormBusy || submitted || isOnlyAdmin}
                value={role}
                data-cy="role"
                inputProps={{ 'aria-label': 'account type' }}
              >
                {Object.keys(AppRole).map(roleValue => {
                  // Only use allowed role values.
                  if (
                    (roleValue === 'Admin' && viewerUser?.relationship?.role === AppRole.Admin) ||
                    roleValue === 'Editor' ||
                    roleValue === 'Reader' ||
                    roleValue === 'Unallocated'
                  ) {
                    return (
                      <option key={roleValue} value={AppRole[roleValue as keyof typeof AppRole]}>
                        {roleValue}
                      </option>
                    );
                  }
                  return false;
                })}
              </Select>
              <Typography className={classes.roleInformation} variant="body1" data-cy="role-information">
                <InfoIcon className={classes.roleInfoIcon} fontSize="small" />
                {roleInfo[role as AppRole]}
              </Typography>
            </FormControl>
          </Grid>
        </Grid>
      </DialogContent>
      {(isFormBusy || submitted) && <CircularProgress aria-label={'progress spinner'} size={50} className={classes.formProgress} />}
      {userError && (
        <Typography variant="body2" className={classes.errorSection}>
          <FormHelperText error>
            Failed to {user?.id ? 'modify user' : 'add user'}.
            <br />
            {userError?.message}
          </FormHelperText>
        </Typography>
      )}
      <DialogActions>
        <Button
          color="primary"
          onClick={() => {
            props.close();
          }}
          disabled={isFormBusy || submitted}
          data-cy="add-new-user-cancel"
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={() => {
            submitForm();
          }}
          disabled={!isFormValid() || isFormBusy || submitted}
          data-cy="add-new-user-save"
        >
          SAVE
        </Button>
      </DialogActions>
    </Paper>
  );
};

export default UserForm;
