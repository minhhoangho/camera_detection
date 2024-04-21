import MenuItem from '@mui/material/MenuItem';
import { InputLabel, Select } from '@mui/material';
import React from 'react';
import classNames from 'classnames';

export type OptionProps = {
  value: string;
  label: string;
};

export type SelectProps = {
  name: string;
  options: OptionProps[];
  multiple?: boolean;
  label?: string;
  isRequired?: boolean;
  className?: string;
  selectElementClassName?: string;
  value?: string;
  labelClassName?: string;
  onSelectChange?: (e?: any) => void;
  errorMessage?: string;
};

export const SelectField = ({
  label,
  name,
  onSelectChange,
  value,
  options,
  multiple = false,
  errorMessage,
  isRequired = false,
  labelClassName,
  className,
  selectElementClassName,
}: SelectProps) => {
  return (
    <div className={classNames('relative w-full mb-1', className)}>
      <InputLabel className={classNames('', labelClassName)}>
        {label} {isRequired && <sup className="text-red-500 text-xs">*</sup>}
      </InputLabel>
      <Select
        multiple={multiple}
        name={name}
        value={value}
        label={label}
        onChange={onSelectChange}
        className={classNames('relative w-full', selectElementClassName)}
      >
        {options.map((option: OptionProps) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
      {errorMessage && (
        <span className="text-rose-500 text-xs">{errorMessage}</span>
      )}
    </div>
  );
};
