import { Button, TextField, Typography } from '@mui/material';
import { createStyles, makeStyles } from '@mui/styles';
import CreateIcon from '@mui/icons-material/Create';
import React, { ChangeEvent, useEffect, useState } from 'react';

const useStyles = makeStyles(
  createStyles({
    buttons: {
      alignSelf: 'flex-start',
      marginLeft: 5,
    },
    text: {
      marginRight: 4,
    },
  }),
);

interface SupportEmailProps {
  supportEmail: string;
  handleNewSupportEmail: (supportEmail: string) => void;
  canEdit: boolean;
  tenantId?: string;
}

const SupportEmail: React.FC<SupportEmailProps> = props => {
  const classes = useStyles();
  const { supportEmail, handleNewSupportEmail, canEdit, tenantId } = props;
  const [edit, setEdit] = useState(false);
  const [value, setValue] = useState(supportEmail);
  const [isValidEmail, setIsValidEmail] = useState(true);

  useEffect(() => {
    setValue(supportEmail);
  }, [supportEmail]);

  useEffect(() => {
    setEdit(false);
    setIsValidEmail(true);
  }, [tenantId]);

  const handleEditClick = () => {
    setEdit(true);
  };
  const handleSaveClick = () => {
    //Save new statement description
    if (value) {
      if (value.localeCompare(supportEmail) !== 0) {
        handleNewSupportEmail(value);
      }
      setEdit(false);
    }
  };
  const handleCancelClick = () => {
    setValue(supportEmail);
    setEdit(false);
    setIsValidEmail(true);
  };
  const validateEmail = (email: string) => {
    const emailFormat = RegExp(/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/);
    setIsValidEmail(!!emailFormat.test(email));
  };
  const handleNewText = (event: ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value);
    validateEmail(event.target.value);
  };

  if (edit) {
    const errorMsg = value.length === 0 ? '*This field cannot be left blank.' : '*Invalid email.';
    return (
      <>
        <TextField
          variant="outlined"
          size="small"
          hiddenLabel
          className={classes.text}
          value={value}
          onChange={handleNewText}
          error={!isValidEmail}
          helperText={
            !isValidEmail && (
              <Typography color="error" variant="caption" data-cy="error-message">
                {errorMsg}
              </Typography>
            )
          }
          autoFocus
          onKeyDown={event => {
            if (event.keyCode === 13) {
              handleSaveClick();
            }
            if (event.keyCode === 27) {
              handleCancelClick();
            }
          }}
          inputProps={{
            'aria-label': 'support email',
            'aria-describedby': `${isValidEmail ? undefined : 'support-email-helpertext-id'}`,
          }}
          FormHelperTextProps={{ id: 'support-email-helpertext-id' }}
          data-cy="support-email-input"
        />
        <Button
          className={classes.buttons}
          variant="contained"
          size="small"
          onClick={handleSaveClick}
          disabled={!isValidEmail}
          color="primary"
          data-cy="support-email-save"
        >
          Save
        </Button>
        <Button className={classes.buttons} variant="text" size="small" onClick={handleCancelClick} data-cy="support-email-cancel">
          Cancel
        </Button>
      </>
    );
  }
  return (
    <>
      <Typography className={classes.text} variant="body1" data-cy="support-email">
        {supportEmail}
      </Typography>
      {canEdit && (
        <Button
          className={classes.buttons}
          variant="outlined"
          size="small"
          onClick={handleEditClick}
          color="primary"
          startIcon={<CreateIcon />}
          data-cy="support-email-edit"
        >
          Edit
        </Button>
      )}
    </>
  );
};

export default SupportEmail;
