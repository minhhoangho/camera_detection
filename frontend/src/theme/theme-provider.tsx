import { useMemo } from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import {
  createTheme,
  ThemeProvider as MUIThemeProvider,
} from '@mui/material/styles';
import { Theme } from '@mui/material';
import * as React from 'react';
import { overrides } from './overrides';
import { customShadows } from './custom-shadows';
import { shadows } from './shadows';
import { palette } from './palette';
import { typography } from './typography';

type Props = {
  children: React.ReactNode;
};
export function ThemeProvider({ children }: Props) {
  const memoizedValue: any = useMemo(
    () => ({
      palette: palette(),
      typography,
      shadows: shadows(),
      customShadows: customShadows(),
      shape: { borderRadius: 8 },
    }),
    [],
  );

  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  const theme: Theme = createTheme(memoizedValue);

  theme.components = overrides(theme);

  return (
    <MUIThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </MUIThemeProvider>
  );
}
