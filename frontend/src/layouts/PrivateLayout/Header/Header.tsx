import { useTheme } from '@mui/material/styles';
import { AppBar, Box, IconButton, Toolbar } from '@mui/material';
import { Stack } from '@mui/system';
import MenuIcon from '@mui/icons-material/Menu';
import { AccountPopover } from './components/AccountPopover';
import { NotificationPopover } from './components/NotificationPopover';
import { useResponsive } from '../../../shared/hooks/use-responsive';
import { bgBlur } from '../../../theme/css';
type Props = {
  onOpenNav: () => void;
};
export function Header({ onOpenNav }: Props) {
  const theme = useTheme();
  const lgUp = useResponsive('up', 'lg');
  return (
    <AppBar
      sx={{
        boxShadow: 'none',
        height: 80,
        zIndex: theme.zIndex.appBar + 1,
        // backgroundColor: theme.palette.background.default,
        ...bgBlur({
          color: theme.palette.background.default,
        }),
        transition: theme.transitions.create(['height'], {
          duration: theme.transitions.duration.shorter,
        }),
        ...(lgUp && {
          width: `calc(100% - ${280 + 1}px)`,
          height: 80,
        }),
      }}
    >
      <Toolbar
        sx={{
          height: 1,
          px: { lg: 5 },
        }}
      >
        {!lgUp && (
          <IconButton onClick={onOpenNav} sx={{ mr: 1 }}>
            <MenuIcon/>
          </IconButton>
        )}
        <Box sx={{ flexGrow: 1 }} />
        <Stack direction="row" alignItems="center" spacing={1}>
          <NotificationPopover />
          <AccountPopover />
        </Stack>
      </Toolbar>
    </AppBar>
  );
}
