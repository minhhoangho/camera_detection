import { forwardRef } from 'react';
import { Icon } from '@iconify/react';

import Box from '@mui/material/Box';

// ----------------------------------------------------------------------

// eslint-disable-next-line react/display-name
export const Iconify = forwardRef(
  (
    {
      icon,
      width = 20,
      height = 20,
      sx,
      ...other
    }: {
      icon: string;
      width?: number;
      height?: number;
      color?: string;
      sx?: object;
      className?: string,
      onClick?: () => void,
    },
    ref,
  ) => (
    <Box
      ref={ref}
      component={Icon}
      className="component-iconify"
      icon={icon}
      sx={{ width, height, ...sx }}
      {...other}
    />
  ),
);
