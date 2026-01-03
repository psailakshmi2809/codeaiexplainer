import { Button, TextField, Typography, Tooltip } from '@mui/material';
import { createStyles, makeStyles } from '@mui/styles';
import CreateIcon from '@mui/icons-material/Create';
import React, { ChangeEvent, useEffect, useState } from 'react';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

const useStyles = makeStyles(
  createStyles({
    buttons: {
      alignSelf: 'flex-start',
      marginLeft: 5,
    },
    text: {
      marginRight: 4,
      wordBreak: 'break-all',
    },
    tooltip: {
      alignSelf: 'flex-start',
      cursor: 'pointer',
      marginLeft: '0.3rem',
      marginTop: 5,
    },
  }),
);

interface BusinessNameProps {
  businessName: string;
  handleNewBusinessName: (businessName: string) => void;
  canEdit: boolean;
  tenantId?: string;
}

const BusinessName: React.FC<BusinessNameProps> = props => {
  const classes = useStyles();
  const { businessName, handleNewBusinessName, canEdit, tenantId } = props;
  const [edit, setEdit] = useState(false);
  const [value, setValue] = useState(businessName);
  const [isValidName, setIsValidName] = useState(true);

  useEffect(() => {
    setValue(businessName);
  }, [businessName]);

  useEffect(() => {
    setEdit(false);
    setIsValidName(true);
  }, [tenantId]);

  const handleEditClick = () => {
    setEdit(true);
  };
  const handleSaveClick = () => {
    //Save new business name
    if (value.trim().localeCompare(businessName) !== 0) {
      handleNewBusinessName(value.trim());
    }
    setValue(value.trim());
    setEdit(false);
  };
  const handleCancelClick = () => {
    setValue(businessName);
    setIsValidName(true);
    setEdit(false);
  };
  const handleNewText = (event: ChangeEvent<HTMLInputElement>) => {
    setIsValidName(event.target.value.trim().length > 0);
    setValue(event.target.value);
  };

  if (edit) {
    return (
      <>
        <TextField
          variant="outlined"
          size="small"
          className={classes.text}
          value={value}
          onChange={handleNewText}
          error={!isValidName}
          hiddenLabel
          inputProps={{
            maxLength: 255,
            'aria-label': 'business name',
            'aria-describedby': 'business-name-helpertext-id',
          }}
          autoFocus
          onKeyDown={event => {
            if (event.keyCode === 13) {
              handleSaveClick();
            }
            if (event.keyCode === 27) {
              handleCancelClick();
            }
          }}
          helperText={!isValidName ? '*This field cannot be left blank' : undefined}
          FormHelperTextProps={{ id: 'business-name-helpertext-id' }}
          data-cy="business-name"
        />
        <Button
          className={classes.buttons}
          variant="contained"
          size="small"
          onClick={handleSaveClick}
          disabled={!isValidName}
          color="primary"
          data-cy="save-business-name"
        >
          Save
        </Button>
        <Button className={classes.buttons} variant="text" size="small" onClick={handleCancelClick} data-cy="cancel-business-name">
          Cancel
        </Button>
        <Tooltip title="Name displayed to Payers, shown in the Payer Portal" className={classes.tooltip} aria-hidden="false">
          <InfoOutlinedIcon htmlColor="grey" fontSize="small" />
        </Tooltip>
      </>
    );
  }
  return (
    <>
      <Typography className={classes.text} variant="body1">
        {businessName}
      </Typography>
      {canEdit && (
        <Button
          className={classes.buttons}
          variant="outlined"
          size="small"
          onClick={handleEditClick}
          color="primary"
          startIcon={<CreateIcon />}
          data-cy="edit-business-name"
        >
          Edit
        </Button>
      )}
      <Tooltip title="Name displayed to Payers, shown in the Payer Portal" className={classes.tooltip} aria-hidden="false">
        <InfoOutlinedIcon htmlColor="grey" fontSize="small" />
      </Tooltip>
    </>
  );
};

export default BusinessName;
