import { TextField, Theme } from '@mui/material';
import { createStyles, makeStyles } from '@mui/styles';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { CustomerOption } from '../custom-types/CustomerOption';
import { fetchCustomerOptionList } from '../features/home/HomeActions';
import { selectCustomerOptionList } from '../features/home/HomeSlice';
import { CustomerOrder, OrderDirection, CustomerOrderField } from '../gql-types.generated';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    textField: {
      '&.selectEmptyMissing .MuiOutlinedInput-notchedOutline': {
        border: '1px solid',
        borderColor: theme.palette.error.main,
      },
      '&.selectEmptyMissing label': {
        color: theme.palette.error.main,
      },
      '& .Mui-disabled': {
        backgroundColor: theme.palette.uxGrey.hover,
      },
    },
    listContainer: {
      listStyle: 'none',
      position: 'absolute',
      background: '#FFFFFF',
      overflowY: 'auto',
      overflowX: 'hidden',
      zIndex: 5,
      maxHeight: '148px',
      marginTop: 1,
      borderRadius: '4px',
      boxShadow: '0px 3px 3px -5px rgb(0 0 0 / 20%), 0px 6px 8px -1px rgb(0 0 0 / 14%), 0px 1px 12px 0px rgb(0 0 0 / 12%);',
      padding: theme.spacing(0.5, 0),
    },
    listMargin: {
      marginTop: '-22px',
    },
    listItem: {
      padding: '6px 16px 6px 16px',
      letterSpacing: '0.00938em',
      whiteSpace: 'nowrap',
      lineHeight: 1.5,
      fontSize: '1rem',
      overflow: 'hidden',
      width: '100%',
      cursor: 'pointer',
      textOverflow: 'ellipsis',
    },
    listItemSelected: {
      background: theme.palette.uxGrey.focus,
    },
    optionContainer: {
      width: '100%',
    },
    optionName: {
      float: 'left',
      maxWidth: '40%',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
    optionNumber: {
      width: 'auto',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
  }),
);

interface CustomerAutoCompleteProps {
  fieldValue: string;
  setFieldValue: (fieldValue: string) => void;
  paymentsDisabled?: boolean;
  customerOption: CustomerOption | undefined;
  setCustomerOption: (customerOption: CustomerOption | undefined) => void;
  customerOptionList?: CustomerOption[];
  hasCustomerOptionError: boolean;
  hasCommunication?: boolean;
}

const CustomerAutoComplete: React.FC<CustomerAutoCompleteProps> = props => {
  const { fieldValue, setFieldValue, paymentsDisabled, customerOption, setCustomerOption, hasCustomerOptionError, hasCommunication } =
    props;
  const classes = useStyles();
  const dispatch = useDispatch();
  const customerOptionList = useSelector(selectCustomerOptionList);
  const isFieldDisabled = hasCommunication || paymentsDisabled || hasCustomerOptionError;
  const [anchorEl, setAnchorEl] = useState<HTMLInputElement | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [invalidFieldValue, setInvalidFieldValue] = useState(false);

  useEffect(() => {
    if (customerOptionList && customerOptionList.length > 0) {
      // List is changing, set select index back to 0 for top option
      setSelectedIndex(0);
    } else if (!customerOptionList || customerOptionList.length === 0) {
      setSelectedIndex(-1);
    }
  }, [customerOptionList]);
  const handleValueSelect = () => {
    if (customerOptionList && selectedIndex > -1 && selectedIndex < customerOptionList.length) {
      setCustomerOption(customerOptionList[selectedIndex]);
      setFieldValue(`${customerOptionList[selectedIndex]?.name} - ${customerOptionList[selectedIndex]?.customerNumber}`);
      setSelectedIndex(-1);
      setAnchorEl(null);
      setInvalidFieldValue(false);
    }
  };

  const handleListItemHover = (index: number) => {
    setSelectedIndex(index);
  };

  const handleIndexUpdate = (increment: boolean) => {
    if (customerOptionList && customerOptionList.length > 0) {
      let updatedIndex = selectedIndex;
      if (increment) {
        updatedIndex = selectedIndex === customerOptionList.length - 1 ? 0 : updatedIndex + 1;
      } else {
        updatedIndex = selectedIndex < 1 ? customerOptionList.length - 1 : updatedIndex - 1;
      }
      setSelectedIndex(updatedIndex);

      // logic to move the scroll according to virtual focus
      // https://stackoverflow.com/questions/59667535/scroll-with-up-and-down-keys-in-autocomplete-list
      const selectedElement = document.getElementById(`customer-list-auto-complete-${updatedIndex}`);
      const listElement = document.getElementById(`customer-list-auto-complete`);
      if (selectedElement && listElement) {
        if (selectedElement.offsetTop < listElement.scrollTop) {
          // Hidden on top, move scroll to show item
          // Just to the top of item
          listElement.scrollTop = selectedElement.offsetTop;
        } else if (selectedElement.offsetTop > listElement.scrollTop + listElement.clientHeight - selectedElement.clientHeight) {
          // Hidden on bottom, move scroll to top of item + item height
          listElement.scrollTop = selectedElement.offsetTop - (listElement.clientHeight - selectedElement.clientHeight);
        }
      }
    }
  };

  const handleFieldChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    if (value) {
      if (value.length >= 3) {
        const customerOrderBy: CustomerOrder = { direction: OrderDirection.Desc, field: CustomerOrderField.Timestamp };
        dispatch(fetchCustomerOptionList(customerOrderBy, value));
        setAnchorEl(event.currentTarget);
      } else {
        setAnchorEl(null);
      }
    } else {
      setAnchorEl(null);
    }
    setFieldValue(value);
    setSelectedIndex(-1);
    if (invalidFieldValue) setInvalidFieldValue(false);
  };

  const handleFieldFocus = () => {
    setSelectedIndex(-1);
    setAnchorEl(null);
  };

  const handleListBlur = () => {
    setAnchorEl(null);
    setSelectedIndex(-1);
    const trimedValue = fieldValue.trim();
    if (trimedValue) {
      const value = `${customerOption?.name} - ${customerOption?.customerNumber}`;
      if (fieldValue !== value) {
        const customerValue = customerOptionList
          ? customerOptionList?.find(option => `${option?.name} - ${option?.customerNumber}` === trimedValue)
          : undefined;
        if (customerValue) {
          setCustomerOption(customerValue);
          setInvalidFieldValue(false);
        } else {
          setCustomerOption(undefined);
          setInvalidFieldValue(true);
        }
      }
    } else {
      setFieldValue('');
      setCustomerOption(undefined);
      setInvalidFieldValue(false);
    }
  };

  const handleFieldBlur = (event: React.FocusEvent) => {
    const relatedTarget = event.relatedTarget as HTMLInputElement;
    //Do not hide the list if the new focus is switching from the textfield to the list element
    if (!relatedTarget || relatedTarget.getAttribute('id') !== 'customer-list-auto-complete') {
      handleListBlur();
    }
    if (!customerOption) {
      setFieldValue('');
      setCustomerOption(undefined);
      setInvalidFieldValue(false);
    }
  };

  const handleFieldKeyDown = (event: React.KeyboardEvent<HTMLDivElement | HTMLUListElement>) => {
    switch (event.key) {
      case 'Down':
      case 'ArrowDown':
        handleIndexUpdate(true);
        break;
      case 'Up':
      case 'ArrowUp':
        handleIndexUpdate(false);
        break;
      case 'Enter':
        handleValueSelect();
        break;
      default:
    }
  };

  const handleListKeyDown = (event: React.KeyboardEvent<HTMLDivElement | HTMLUListElement>) => {
    //prevents the default scrolling of the list
    event.preventDefault();
    handleFieldKeyDown(event);
  };

  return (
    <>
      <TextField
        id="customer-name-or-number-id"
        fullWidth
        variant="outlined"
        label="Customer Name/Number"
        inputProps={{
          'aria-label': 'customer name or number auto complete',
          'aria-describedby': `${invalidFieldValue ? 'customer-option-helper-text-id' : undefined} ${
            selectedIndex > -1 ? `customer-list-auto-complete-${selectedIndex}` : 'customer-list-empty-option'
          }`,
        }}
        aria-required="true"
        value={fieldValue}
        className={classes.textField}
        autoComplete="nope"
        disabled={isFieldDisabled}
        onChange={handleFieldChange}
        onFocus={handleFieldFocus}
        onBlur={handleFieldBlur}
        onKeyDown={handleFieldKeyDown}
        error={invalidFieldValue}
        helperText={invalidFieldValue ? 'Invalid Customer Details' : undefined}
        FormHelperTextProps={{ id: 'customer-option-helper-text-id' }}
        data-cy="customer-name"
      />
      {anchorEl !== null && (
        <ul
          id="customer-list-auto-complete"
          className={`${classes.listContainer} ${invalidFieldValue ? classes.listMargin : undefined}`}
          style={{ width: anchorEl.offsetWidth }}
          tabIndex={1}
          onBlur={handleListBlur}
          onKeyDown={handleListKeyDown}
        >
          {customerOptionList &&
            customerOptionList.map((customer, index) => {
              return (
                <li
                  id={`customer-list-auto-complete-${index}`}
                  key={index}
                  className={`${classes.listItem} ${index === selectedIndex ? classes.listItemSelected : ''}`}
                  onMouseOver={() => {
                    handleListItemHover(index);
                  }}
                  onMouseDown={handleValueSelect}
                >
                  <div className={classes.optionContainer}>
                    <div className={classes.optionName}>{customer.name}</div>
                    <div className={classes.optionNumber}>&nbsp;-&nbsp;{customer.customerNumber}</div>
                  </div>
                </li>
              );
            })}
          {customerOptionList && customerOptionList.length === 0 && (
            <li id="customer-list-empty-option" className={classes.listItem}>
              No Customers found.
            </li>
          )}
        </ul>
      )}
    </>
  );
};

export default CustomerAutoComplete;
