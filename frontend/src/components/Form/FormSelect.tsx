import { Controller } from 'react-hook-form';
import React from 'react';
import { SelectField, SelectProps } from '../Select';

type FormSelectProps = {
  name: string;
  control: any;
  onChange?: (e?: any) => void;
} & SelectProps;

export const FormSelect = ({
  name,
  control,
  onChange,
  label,
  options,
  ...rest
}: FormSelectProps) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <SelectField
          onSelectChange={(e) => {
            field?.onChange?.(e);
            onChange?.(e);
          }}
          label={label}
          options={options}
          errorMessage={error?.message}
          {...field}
          {...rest}
        />
      )}
    />
  );
};
