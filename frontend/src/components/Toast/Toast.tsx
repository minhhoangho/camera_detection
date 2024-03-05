import React from 'react';
import isEqual from 'lodash/isEqual';
import FontIcon from 'src/components/FontIcon';

const getIconName = type => {
  switch (type) {
    case 'success':
      return 'check-circle';
    case 'error':
      return 'x-circle';
    default:
      return 'check-circle';
  }
};

const getIconClassName = type => {
  switch (type) {
    case 'success':
      return 'tx-color-green-01';
    case 'error':
      return 'tx-color-red-01';
    default:
      return 'tx-color-green-01';
  }
};

const Toast = ({ type, message }) => {
  const iconName = getIconName(type);
  const iconClassName = getIconClassName(type);
  return (
    <div className="d-flex">
      <FontIcon iconName={iconName} className={`tx-24 ${iconClassName}`} />
      <span className="tx-color-black w-auto toast-content-component">{message}</span>
    </div>
  );
};

export default React.memo(Toast, isEqual);
