import { Box } from '@mui/material';
import * as React from 'react';
import { useResponsive } from '../../shared/hooks/use-responsive';


type Props = {
  children: React.ReactNode;
};

export function PublicLayout({ children }: Props): React.ReactElement {
  const lgUp = useResponsive('up', 'lg');
  return (
    <Box
      sx={{
        width: '100vw',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          height: '100%',
          flexDirection: { xs: 'column', lg: 'row' },
        }}
      >
        <Box
          sx={{
            flexGrow: 1,
            minHeight: 1,
            display: 'flex',
            flex: 1,
            flexDirection: 'column',
            overflowY: 'auto',
            ...(lgUp && {
              height: '100vh',
              width: `100vw`,
            }),
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}
