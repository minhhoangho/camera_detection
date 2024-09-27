import { useTheme } from '@mui/material/styles';
import { useResponsive } from '../../../shared/hooks/use-responsive';
import { AppBar, Box, IconButton, Toolbar } from '@mui/material';
import { bgBlur } from '../../../theme/css';
import MenuIcon from '@mui/icons-material/Menu';
import { TextField, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { SearchBox } from './SearchBox';
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
        backgroundColor: 'transparent',
        transition: theme.transitions.create(['height'], {
          duration: theme.transitions.duration.shorter,
        }),
        ...(lgUp && {
          width: '100vw',
          height: 80,
        }),
        position: 'absolute'
      }}
    >
      <Toolbar
        sx={{
          height: 1,
          px: { lg: 5 },
        }}
      >
        {lgUp && (
          <IconButton onClick={onOpenNav} sx={{ mr: 1 }}>
            <MenuIcon/>
          </IconButton>
        )}
        <Box sx={{ flexGrow: 1 }}>
          <Box sx={{ flexGrow: 1 }}>
            <SearchBox/>
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
