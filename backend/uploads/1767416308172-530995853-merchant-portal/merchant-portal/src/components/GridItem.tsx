import { Grid, Theme, Typography } from '@mui/material';
import { createStyles, makeStyles } from '@mui/styles';
import React from 'react';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    gridItem: {
      marginBottom: theme.spacing(1),
      marginTop: theme.spacing(1),
    },
    nameWrapper: {
      display: 'flex',
      paddingRight: 8,
      marginBottom: 3,
      marginTop: 3,
    },
    name: {
      letterSpacing: 1.5,
      textTransform: 'uppercase',
    },
    alertName: {
      letterSpacing: 1.5,
      color: theme.palette.error.main,
      fontSize: 12,
      textTransform: 'uppercase',
    },
  }),
);

export interface GridItemProps {
  name: string;
  value?: React.ReactElement;
  alert?: boolean;
  cy?: string;
}

const GridItem: React.FC<GridItemProps> = (props: GridItemProps) => {
  const classes = useStyles();
  return (
    <Grid tabIndex={0} container item xs={12} className={classes.gridItem} justifyContent="center" data-cy={props.cy}>
      <Grid item xs={12} sm={6} lg={4} className={classes.nameWrapper}>
        <Typography variant="label1" className={props.alert ? classes.alertName : classes.name}>
          {props.name}
        </Typography>
      </Grid>
      <Grid container item xs={12} sm={6} lg={8} alignItems="center">
        {props.value}
      </Grid>
    </Grid>
  );
};

export default GridItem;
