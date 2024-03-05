import { Scrollbars } from 'react-custom-scrollbars-2';
import { FC, ReactNode } from 'react';
import { Box } from '@mui/material';

type ScrollbarProps = {
  className?: string;
  children?: ReactNode;
} & Record<string, any>;

export const Scrollbar: FC<ScrollbarProps> = ({
  className,
  children,
  ...rest
}) => {
  return (
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    <Scrollbars
      className={className}
      autoHide
      universal
      renderThumbVertical={() => {
        return (
          <Box
            sx={{
              width: 5,
              background: ``,
              borderRadius: `DAE3E5`,
              // transition: `${theme.transitions.create(['background'])}`,
              //
              // '&:hover': {
              //   background: `${theme.colors.alpha.black[30]}`
              // }
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
