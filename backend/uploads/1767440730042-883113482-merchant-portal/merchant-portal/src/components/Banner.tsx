import { Box, Theme } from '@mui/material';
import { createStyles, makeStyles } from '@mui/styles';
import React, { ReactElement } from 'react';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    banner: {
      minHeight: theme.spacing(8),
      backgroundColor: theme.palette.success.light,
      color: theme.palette.success.dark,
      boxShadow: '0px 3px 6px #00000012',
    },
    warning: {
      minHeight: theme.spacing(8),
      backgroundColor: theme.palette.error.light,
      color: theme.palette.error.main,
      boxShadow: '0px 3px 6px #00000012',
    },
  }),
);

interface BannerPropTypes {
  contents: ReactElement;
  warning: boolean | undefined;
}

const Banner: React.FC<BannerPropTypes> = (props: BannerPropTypes) => {
  const classes = useStyles();
  const bannerClass = props.warning ? classes.warning : classes.banner;

  return (
    <Box className={bannerClass} p={2} display="flex" justifyContent="center" alignItems="center" width="100%">
      {props.contents}
    </Box>
  );
};

export default Banner;
