import React from 'react';
import { Controller } from 'react-hook-form';

import { Input, InputProps } from '../Input';


type FormInputProps = {
  name: string,
  control: any,
  onChange?: (e?: any) => void,
} & InputProps

export const FormInput = ({ name, control, onChange, ...restInput }: FormInputProps) => (
  <Controller
    name={name}
    control={control}
    render={({ field, fieldState: { error } }) => (
      <Input
        onInputChange={(e) => {
          field?.onChange?.(e);
          onChange?.(e);
        }}
        errorMessage={error?.message}
        {...field}
        {...restInput}
      />
    )}
  />
);
