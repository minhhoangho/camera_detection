import React from "react";
import classNames from "classnames";
import { Tooltip } from '@mui/material';

export type CheckboxProps = {
  label: string,
  name: string,
  checked?: boolean,
  isRequired?: boolean,
  value?: boolean,
  tooltipContent?: string,
  className?: string,
  inputClassName?: string,
  checkboxClassName?: string,
  errorMessage?: string,
  disabled?:boolean,
  onBlur?: (e?: any) => void,
  onFocus?: (e?: any) => void,
  onInputChange?: (e?: any) => void,
}


// eslint-disable-next-line react/display-name
export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      label,
      name,
      checked,
      isRequired,
      value = false,
      tooltipContent = "",
      checkboxClassName,
      inputClassName,
      errorMessage,
      disabled,
      onBlur,
      onFocus,
      onInputChange,
      ...rest
    }: CheckboxProps,
    ref,
  ) => {
    return (
      <div>
        <div
          className={classNames(
            "inline-flex items-center cursor-pointer",
            checkboxClassName,
          )}
        >
          <Tooltip title={tooltipContent}>
            <input
              type="checkbox"
              className={classNames(
                "form-checkbox border-0 rounded text-blueGray-700 ml-1 w-5 h-5 cursor-pointer ease-linear transition-all duration-150",
                inputClassName,
              )}
              ref={ref}
              id={name}
              name={name}
              checked={checked}
              disabled={disabled}
              defaultChecked={value}
              onChange={(event) => onInputChange?.(event.target.checked)}
              onBlur={onBlur}
              onFocus={onFocus}
              {...rest}
            />
          </Tooltip>
          <label className="cursor-pointer" htmlFor={name}>
            {label && (
              <span className="ml-2 text-sm font-semibold text-blueGray-600">
                {label}
                {isRequired && <sup className="text-red-500 text-xs">*</sup>}
              </span>
            )}
          </label>
        </div>
        {errorMessage && (
          <span className="text-rose-500 text-xs">{errorMessage}</span>
        )}
      </div>
    );
  },
);
