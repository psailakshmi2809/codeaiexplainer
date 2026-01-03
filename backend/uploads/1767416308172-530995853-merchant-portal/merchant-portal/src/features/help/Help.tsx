import { Container, Grid } from '@mui/material';
import React, { useState, useEffect } from 'react';
import CustomerSupport from '../../components/CustomerSupport';
import UserTutorialsSection from '../../components/UserTutorialsSection';
import { useDispatch } from 'react-redux';
import { fetchOwningProduct } from './HelpActions';
import { Helmet } from 'react-helmet';

const Help: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [selected, setSelected] = useState('');
  const dispatch = useDispatch();

  useEffect(() => {
    if (activeStep === 0) {
      dispatch(fetchOwningProduct());
    }
  }, [activeStep]);
  const handleBack = () => {
    setActiveStep(prevActiveStep => prevActiveStep - 1);
    setSelected('');
  };
  const handleSelect = (value: string) => {
    setSelected(value);
  };
  let renderedStep = (
    <Grid container direction="row" justifyContent="center" alignItems="stretch">
      <Grid container item sm={8} md={6} lg={4} direction="column">
        <Grid item>
          <CustomerSupport />
        </Grid>
      </Grid>
    </Grid>
  );
  if (activeStep === 1) {
    renderedStep = <UserTutorialsSection handleBack={handleBack} handleClick={handleSelect} selected={selected} />;
  }
  return (
    <Container maxWidth={false}>
      <Helmet>
        <meta name="ai:viewId" content="help"></meta>
        <meta name="ai:viewDescription" content="Aptean Pay Merchant Portal - Help"></meta>
        <title>Aptean Pay Merchant Portal - Help</title>
      </Helmet>
      {renderedStep}
    </Container>
  );
};

export default Help;
