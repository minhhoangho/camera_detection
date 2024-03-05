import React from 'react';
import classNames from 'classnames';

const FontIcon = ({
  disabled,
  className,
  status,
  iconName = '',
  onClick,
}: {
  disabled: boolean;
  className: string;
  status: string;
  iconName: string;
  onClick: any;
}) => {
  return (
    <i
      onClick={!disabled ? onClick : null}
      className={classNames(`opleicon-${iconName}`, className, status, {
        disabled,
      })}
    />
  );
};

export default FontIcon;
