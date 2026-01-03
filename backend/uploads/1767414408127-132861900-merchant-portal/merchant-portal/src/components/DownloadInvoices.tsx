import { Button, Grid, IconButton, Popover, Theme, Typography } from '@mui/material';
import { createStyles, makeStyles } from '@mui/styles';
import React, { useState } from 'react';
import DownloadIcon from '@mui/icons-material/GetApp';
import CloseIcon from '@mui/icons-material/Close';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    dialogButtons: {
      padding: theme.spacing(0.5, 0),
      marginBottom: theme.spacing(1),
    },
    containerGrid: {
      minWidth: 300,
      maxWidth: 300,
      overflowY: 'hidden',
    },
    link: {
      width: '100%',
      overflow: 'hidden',
      whiteSpace: 'nowrap',
      textOverflow: 'ellipsis',
    },
    linkContainer: {
      maxHeight: '175px',
      overflowY: 'auto',
      overflowX: 'hidden',
      padding: theme.spacing(1),
    },
    childGridContainer: {
      padding: theme.spacing(1),
    },
    headerText: {
      fontSize: '16px',
      fontWeight: 500,
    },
    buttonText: {
      textTransform: 'none',
      width: '100%',
    },
    downArrow: {
      height: '22.75px',
      width: '24px',
    },
  }),
);

interface DownloadInvoicesProps {
  isIconButton: boolean;
  invoiceUrl?: string | null;
  invoicesUrlList?: string[] | null;
  originTop?: boolean;
}

const DownloadInvoices: React.FC<DownloadInvoicesProps> = props => {
  const { isIconButton, invoiceUrl, invoicesUrlList, originTop } = props;
  // in case no invoice is present
  if (!invoiceUrl && (!invoicesUrlList || invoicesUrlList?.length === 0)) {
    return null;
  }

  const classes = useStyles();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    event.preventDefault();
    setAnchorEl(event.currentTarget);
    setIsMenuOpen(true);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setIsMenuOpen(false);
  };

  // for cases when there is only one invoice
  let singleUrl = invoiceUrl;

  if (invoicesUrlList?.length === 1) {
    [singleUrl] = invoicesUrlList;
  }

  if (singleUrl) {
    return (
      <>
        {isIconButton ? (
          <IconButton color="primary" href={singleUrl} aria-label="download invoice" data-cy="download-invoice" size="large">
            <DownloadIcon />
          </IconButton>
        ) : (
          <Button
            size="small"
            variant="outlined"
            color="primary"
            fullWidth
            href={singleUrl}
            className={classes.dialogButtons}
            data-cy="download-invoice"
          >
            DOWNLOAD INVOICE
          </Button>
        )}
      </>
    );
  }

  return (
    <>
      {isIconButton ? (
        <IconButton
          color="primary"
          aria-label="invoices"
          onClick={handleMenuOpen}
          aria-describedby={isMenuOpen ? 'invoice-heading' : undefined}
          data-cy="invoices"
          size="large"
        >
          <DownloadIcon />
        </IconButton>
      ) : (
        <Button
          size="small"
          variant="outlined"
          color="primary"
          fullWidth
          className={classes.dialogButtons}
          onClick={handleMenuOpen}
          endIcon={<ArrowDropDownIcon className={classes.downArrow} />}
          aria-describedby={isMenuOpen ? 'invoice-heading' : undefined}
          data-cy="invoices"
        >
          INVOICES
        </Button>
      )}
      <Popover
        anchorEl={anchorEl}
        open={isMenuOpen}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: originTop ? 'top' : 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: originTop ? 'bottom' : 'top', horizontal: 'right' }}
      >
        <Grid container className={classes.containerGrid}>
          <Grid item container xs={12} className={classes.childGridContainer}>
            <Grid item container xs={10} alignContent="center" id="invoice-heading">
              <Typography className={classes.headerText}>Download Invoices</Typography>
            </Grid>
            <Grid item container xs={2} justifyContent="flex-end">
              <IconButton size="small" onClick={handleMenuClose}>
                <CloseIcon />
              </IconButton>
            </Grid>
          </Grid>
          <Grid item container xs={12} className={classes.linkContainer}>
            {invoicesUrlList?.map((url, index) => {
              const fileNameWithUUID = url
                .slice(url.lastIndexOf('/') + 1)
                .replace('.pdf', '')
                .trim();
              const fileNameWithoutUUID = fileNameWithUUID.slice(0, -37).trim();
              const fileName = fileNameWithoutUUID || fileNameWithUUID || 'invoice';

              return (
                <Button variant="text" size="small" color="primary" key={index} href={url} className={classes.buttonText}>
                  <Grid item container xs={12}>
                    <Grid item container xs={10} alignContent="center">
                      <Typography className={classes.link}>{fileName}</Typography>
                    </Grid>
                    <Grid item container xs={2} justifyContent="flex-end">
                      <DownloadIcon />
                    </Grid>
                  </Grid>
                </Button>
              );
            })}
          </Grid>
        </Grid>
      </Popover>
    </>
  );
};

export default DownloadInvoices;
