import { Box } from '@mui/material';
import { Header } from './Header';
import * as React from 'react';
import { useResponsive } from '../../shared/hooks/use-responsive';
import { Sidebar } from './Sidebar';


type Props = {
  children: React.ReactNode;
};

export function PublicLayout({ children }: Props): React.ReactElement {
  const lgUp = useResponsive('up', 'lg');

  const [collapsed, setCollapsed] = React.useState<boolean>(false);
  console.log('collapsedcollapsedcollapsed ', collapsed);
  return (
    <Box
    sx={{
      width: '100vw'
    }}
    >
      <Header onOpenNav={() => setCollapsed(true)} />
      <Box
        sx={{
          display: 'flex',
          height: '100%',
          flexDirection: { xs: 'column', lg: 'row' },
        }}
      >
        <Sidebar
          open={collapsed} onClose={() => setCollapsed(false)} />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            minHeight: 1,
            display: 'flex',
            flex: 1,
            flexDirection: 'column',
            overflowY: 'auto',
            ...(lgUp && {
              px: 2,
              py: `${88}px`,
              minWidth: `100vw`,
            }),
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>

  );
}
