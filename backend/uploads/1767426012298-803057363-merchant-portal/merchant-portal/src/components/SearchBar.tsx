import { TextField, Theme, alpha } from '@mui/material';
import { createStyles, makeStyles } from '@mui/styles';
import React, { ChangeEvent, useState } from 'react';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    errorContent: {
      textAlign: 'left',
      fontSize: '10px',
      paddingLeft: 8,
    },
    closeIcon: {
      color: theme.palette.uxGrey.main,
      cursor: 'pointer',
    },
    searchIconError: {
      color: theme.palette.error.main,
    },
    searchInput: {
      backgroundColor: alpha(theme.palette.common.black, 0.08),
      border: 'none',
    },
    searchFieldSet: {
      border: 'none',
    },
    searchInputRoot: {
      maxWidth: 340,
      '& fieldset': {
        borderWidth: 0,
      },
    },
    searchIconStart: {
      color: alpha(theme.palette.common.black, 0.6),
    },
    searchIcon: {
      color: theme.palette.primary.main,
      cursor: 'pointer',
    },
  }),
);

interface SearchBarProps {
  placeholderText: string;
  queryString?: string;
  updateQueryString: (queryString: string | undefined) => void;
  minimumCharacter: number;
  searchError?: Error;
  clearSearchError?: () => void;
  isSearchDisabled?: boolean;
  isSpacesAllowed: boolean;
  searchName: string;
}

const SearchBar: React.FC<SearchBarProps> = props => {
  const {
    placeholderText,
    queryString,
    updateQueryString,
    minimumCharacter,
    searchError,
    clearSearchError,
    isSearchDisabled,
    isSpacesAllowed,
    searchName,
  } = props;
  const classes = useStyles();
  const [searchString, setSearchString] = useState<string>(queryString || '');
  const [isSearchOnFocus, setIsSearchOnFocus] = useState<boolean>(false);
  const [isValidSearchString, setIsValidSearchString] = useState<boolean>(true);
  const [isSearched, setIsSearched] = useState<boolean>((queryString || '').length >= minimumCharacter);
  const handleSearch = () => {
    if (searchString.trim().length >= minimumCharacter) {
      setIsSearched(true);
      if (clearSearchError) clearSearchError();
      updateQueryString(searchString.trim());
    } else {
      setIsValidSearchString(false);
    }
  };

  const handleSearchOnCancel = () => {
    setIsSearched(false);
    setIsValidSearchString(true);
    setIsSearchOnFocus(false);
    setSearchString('');
    updateQueryString(undefined);
  };

  const handleSearchOnChange = (event: ChangeEvent<HTMLInputElement>) => {
    const searchString = event.target.value;
    const search = isSpacesAllowed ? searchString : searchString.trim();
    let isValidSearch = false;
    if (search.trim().length >= minimumCharacter) {
      isValidSearch = true;
    }
    setIsValidSearchString(isValidSearch);
    setSearchString(search);
    setIsSearched(false);
  };

  const handleSearchOnBlur = () => {
    if (!isSearched) {
      if (queryString && queryString.length > 0) updateQueryString(undefined);
      setSearchString('');
    }
    setIsValidSearchString(true);
    setIsSearchOnFocus(false);
  };

  return (
    <TextField
      size="small"
      id="filled-adorment-weight"
      disabled={isSearchDisabled}
      value={searchString}
      placeholder={placeholderText}
      onChange={handleSearchOnChange}
      autoComplete="nope"
      fullWidth
      onFocus={() => {
        setIsSearchOnFocus(true);
      }}
      onBlur={() => handleSearchOnBlur()}
      classes={{
        root: classes.searchInputRoot,
      }}
      onKeyUp={event => {
        if (event.key === 'Enter') handleSearch();
      }}
      helperText={
        // eslint-disable-next-line no-nested-ternary
        searchError
          ? 'An error has occurred with the search'
          : !isValidSearchString
          ? `Your search must have atleast ${minimumCharacter === 1 ? 'one' : minimumCharacter} character${
              minimumCharacter > 1 ? 's' : ''
            }.`
          : ''
      }
      error={!isValidSearchString}
      data-cy={`${searchName}-search`}
      InputProps={{
        startAdornment: !isSearchOnFocus && !isSearched && <SearchIcon className={classes.searchIconStart} />,
        endAdornment:
          isSearchOnFocus && !isSearched ? (
            <SearchIcon
              onMouseDown={() => {
                handleSearch();
              }}
              className={isValidSearchString ? classes.searchIcon : classes.searchIconError}
            />
          ) : (
            isSearched && (
              <CloseIcon aria-label="clear search field" onMouseDown={handleSearchOnCancel} className={classes.closeIcon} />
            )
          ),
        classes: {
          root: classes.searchInput,
        },
      }}
      inputProps={{
        'aria-label': 'press enter key to search',
        'aria-describedby': `${isValidSearchString ? undefined : 'search-error1-id'} ${searchError ? 'search-error2-id' : undefined}`,
      }}
    />
  );
};

export default SearchBar;
