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

interface BusinessUrlProps {
  businessUrl: string;
  handleNewBusinessUrl: (businessUrl: string) => void;
  canEdit: boolean;
  tenantId?: string;
}

const BusinessUrl: React.FC<BusinessUrlProps> = props => {
  const classes = useStyles();
  const { businessUrl, handleNewBusinessUrl, canEdit, tenantId } = props;
  const [edit, setEdit] = useState(false);
  const [value, setValue] = useState(businessUrl);
  const [isValidUrl, setIsValidUrl] = useState(true);

  useEffect(() => {
    setValue(businessUrl);
  }, [businessUrl]);

  useEffect(() => {
    setEdit(false);
    setIsValidUrl(true);
  }, [tenantId]);

  const handleEditClick = () => {
    setEdit(true);
  };
  const handleSaveClick = () => {
    //Save new statement description
    if (value) {
      if (value.localeCompare(businessUrl) !== 0) {
        handleNewBusinessUrl(value);
      }
      setEdit(false);
    }
  };
  const handleCancelClick = () => {
    setValue(businessUrl);
    setEdit(false);
    setIsValidUrl(true);
  };
  const validateUrl = (url: string) => {
    //https://stackoverflow.com/questions/5717093/check-if-a-javascript-string-is-a-url
    const pattern = new RegExp(
      '^(https?:\\/\\/)?' + // protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
        '(\\#[-a-z\\d_]*)?$',
      'i',
    ); // fragment locator
    setIsValidUrl(!!pattern.test(url));
  };
  const handleNewText = (event: ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value);
    validateUrl(event.target.value);
  };

  if (edit) {
    const errorMsg: string = value.length === 0 ? '*This field cannot be left blank.' : '*Invalid url.';
    return (
      <>
        <TextField
          variant="outlined"
          size="small"
          hiddenLabel
          inputProps={{ 'aria-label': 'business url', 'aria-describedby': `${isValidUrl ? undefined : 'business-url-helpertext-id'}` }}
          className={classes.text}
          value={value}
          onChange={handleNewText}
          error={!isValidUrl}
          helperText={
            !isValidUrl && (
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
          FormHelperTextProps={{ id: 'business-url-helpertext-id' }}
          data-cy="business-url-input"
        />
        <Button
          className={classes.buttons}
          variant="contained"
          size="small"
          onClick={handleSaveClick}
          disabled={!isValidUrl}
          color="primary"
          data-cy="business-url-save"
        >
          Save
        </Button>
        <Button className={classes.buttons} variant="text" size="small" onClick={handleCancelClick} data-cy="business-url-cancel">
          Cancel
        </Button>
      </>
    );
  }
  return (
    <>
      <Typography className={classes.text} variant="body1" data-cy="business-url">
        {businessUrl}
      </Typography>
      {canEdit && (
        <Button
          className={classes.buttons}
          variant="outlined"
          size="small"
          onClick={handleEditClick}
          color="primary"
          startIcon={<CreateIcon />}
          data-cy="business-url-edit"
        >
          Edit
        </Button>
      )}
    </>
  );
};

export default BusinessUrl;
