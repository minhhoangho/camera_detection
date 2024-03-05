import React from "react";
import { Controller } from "react-hook-form";
import { Checkbox, CheckboxProps } from 'src/components/Checkbox';


type Props = {
  name: string,
  control: any,
} & CheckboxProps


const FormCheckbox = ({ name, control, ...restInput }: Props) => (
  <Controller
    name={name}
    control={control}
    render={({ field, fieldState: { error } }) => (
      <Checkbox
        onInputChange={field.onChange}
        errorMessage={error?.message}
        {...field}
        {...restInput}
      />
    )}
  />
);

export { FormCheckbox };
