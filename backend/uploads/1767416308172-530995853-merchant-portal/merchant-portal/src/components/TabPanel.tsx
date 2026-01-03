import { Box } from '@mui/material';
import React from 'react';

interface TabPanelProps {
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = props => {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box>{children}</Box>}
    </div>
  );
};

export default TabPanel;
