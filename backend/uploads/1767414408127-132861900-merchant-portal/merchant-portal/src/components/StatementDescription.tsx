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

interface StatementDescriptionProps {
  statementDescription: string;
  handleNewStatementDescription: (statementDescription: string) => void;
  canEdit: boolean;
  tenantId?: string;
}

const StatementDescription: React.FC<StatementDescriptionProps> = props => {
  const classes = useStyles();
  const { statementDescription, handleNewStatementDescription, canEdit, tenantId } = props;
  const [edit, setEdit] = useState(false);
  const [value, setValue] = useState(statementDescription);
  const [isValidStatement, setIsValidStatement] = useState(true);

  useEffect(() => {
    setValue(statementDescription);
  }, [statementDescription]);

  useEffect(() => {
    setEdit(false);
    setIsValidStatement(true);
  }, [tenantId]);

  const handleEditClick = () => {
    setEdit(true);
  };
  const handleSaveClick = () => {
    //Save new statement description
    if (value.trim().localeCompare(statementDescription) !== 0) {
      handleNewStatementDescription(value.trim());
    }
    setValue(value.trim());
    setEdit(false);
  };
  const handleCancelClick = () => {
    setValue(statementDescription);
    setIsValidStatement(true);
    setEdit(false);
  };
  const handleNewText = (event: ChangeEvent<HTMLInputElement>) => {
    setIsValidStatement(event.target.value.trim().length > 0);
    setValue(event.target.value);
  };

  if (edit) {
    return (
      <>
        <TextField
          variant="outlined"
          size="small"
          hiddenLabel
          className={classes.text}
          value={value}
          onChange={handleNewText}
          error={!isValidStatement}
          inputProps={{
            maxLength: 50,
            'aria-label': 'statement description',
            'aria-describedby': 'statement-description-helpertext-id',
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
          data-cy="statement-description"
          multiline
          helperText={
            <Typography color={isValidStatement ? '' : 'error'} variant="caption" data-cy="error-message">
              {!isValidStatement ? '*This field cannot be left blank' : '50 characters maximum'}
            </Typography>
          }
          FormHelperTextProps={{ id: 'statement-description-helpertext-id' }}
        />
        <Button
          className={classes.buttons}
          variant="contained"
          size="small"
          onClick={handleSaveClick}
          disabled={!isValidStatement}
          color="primary"
          data-cy="save-statement-description"
        >
          Save
        </Button>
        <Button
          className={classes.buttons}
          variant="text"
          size="small"
          onClick={handleCancelClick}
          data-cy="cancel-statement-description"
        >
          Cancel
        </Button>
        <Tooltip title="Payer Statement and Receipt Description" className={classes.tooltip} aria-hidden="false">
          <InfoOutlinedIcon htmlColor="grey" fontSize="small" />
        </Tooltip>
      </>
    );
  }
  return (
    <>
      <Typography className={classes.text} variant="body1">
        {statementDescription}
      </Typography>
      {canEdit && (
        <Button
          className={classes.buttons}
          variant="outlined"
          size="small"
          onClick={handleEditClick}
          color="primary"
          startIcon={<CreateIcon />}
          data-cy="edit-statement-description"
        >
          Edit
        </Button>
      )}
      <Tooltip title="Payer Statement and Receipt Description" className={classes.tooltip} aria-hidden="false">
        <InfoOutlinedIcon htmlColor="grey" fontSize="small" />
      </Tooltip>
    </>
  );
};

export default StatementDescription;
