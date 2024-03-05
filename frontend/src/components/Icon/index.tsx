import React from 'react';
import IconInner from '../IconInner';


type IconType = {
  icon: string,
  size: number,
  className?:string,

}

function Icon(props: IconType) {
  const { icon = '', size = 11, className = '', ...otherProps } = props;
  return (
    <svg
      width={size}
      height={size}
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      className={`feather feather-${icon} ${className}`}
      {...otherProps}
    >
      <IconInner icon={icon} />
    </svg>
  );
}

export default Icon;
