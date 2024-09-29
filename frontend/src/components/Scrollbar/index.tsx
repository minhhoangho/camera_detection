import React, { FC, ReactNode } from 'react';
import { Scrollbars } from 'react-custom-scrollbars-2';
import { Box } from '@mui/material';

type ScrollbarProps = {
  className?: string;
  children?: ReactNode;
  onScroll?: (e: Event) => void;
} & Record<string, any>;

export const Scrollbar: FC<ScrollbarProps> = ({
  className,
  children,
  onScroll,
  ...rest
}) => {
  return (
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    <Scrollbars
      className={className}
      onScroll={onScroll}
      autoHide
      universal
      renderThumbVertical={() => {
        return (
          <Box
            sx={{
              width: 5,
              background: ``,
              borderRadius: `DAE3E5`,
            }}
          />
        );
      }}
      {...rest}
    >
      {children}
    </Scrollbars>
  );
};
