import { Box } from '@mui/material';

export function PublicLayout({ children }: Props): React.ReactElement {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flex: 1,
          flexDirection: 'column',
          overflowY: 'auto',
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
