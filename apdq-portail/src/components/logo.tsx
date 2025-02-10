import React from 'react';
import { Box, SxProps, Theme } from '@mui/material';

interface LogoProps {
  sx?: SxProps<Theme>;
}

const Logo: React.FC<LogoProps> = ({ sx }) => {
  return (
    <Box display='flex' alignItems='center' gap={2} sx={sx}>
      <img
        src='/src/assets/png/Logo.png'
        alt='Remorqueur Branche'
        style={{ width: '100%', height: '48px' }}
      />
    </Box>
  );
};

export default Logo;
