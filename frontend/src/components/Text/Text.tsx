import { FC, ReactNode } from 'react';
import { styled } from '@mui/material/styles';
import clsx from 'clsx';

interface TextProps {
  className?: string;
  color?:
    | 'primary'
    | 'secondary'
    | 'error'
    | 'warning'
    | 'success'
    | 'info'
    | 'black';
  flex?: boolean;
  children?: ReactNode;
}

const TextWrapper = styled('span')(
  () => `
      display: inline-block;
      align-items: center;

      &.flexItem {
        display: inline-flex;
      }
      
      &.MuiText {

        &-black {
          color:'#000000'
        }

        &-primary {
          color: '#5569ff'
        }
        
        &-secondary {
          color:'#6E759F'
        }
        
        &-success {
          color: '#57CA22'
        }
        
        &-warning {
          color: '#FFA319'
        }
              
        &-error {
          color: '#FF1943'
        }
        
        &-info {
          color: '#33C2FF'
        }
      }
`,
);

export const Text: FC<TextProps> = ({
                                      // className,
                                      color = 'secondary',
                                      flex,
                                      children,
                                      ...rest
                                    }) => {
  return (
    <TextWrapper
      className={clsx('MuiText-' + color, { flexItem: flex })}
      {...rest}
    >
      {children}
    </TextWrapper>
  );
};



