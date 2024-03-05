import React from 'react';
import classNames from 'classnames';

export type InputProps = {
  label?: string;
  name?: string;
  type?: string;
  placeholder: string;
  isRequired?: boolean;
  className?: string;
  inputClassName?: string;
  inputElementClassName?: string;
  value?: string;
  labelClassName?: string;
  onInputChange?: (e?: any) => void;
  errorMessage?: string;
  isTextarea?: boolean;
  autoComplete?: string;
};

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      name,
      placeholder,
      isRequired,
      className,
      inputElementClassName,
      value,
      labelClassName,
      onInputChange,
      errorMessage,
      isTextarea,
      autoComplete,
      ...rest
    }: InputProps,
    ref,
  ): React.ReactElement => (
    <div className={classNames('relative w-full ', className)}>
      {label && (
        <label
          className={classNames('block text-sm mb-2', labelClassName)}
          htmlFor={name}
        >
          {label} {isRequired && <sup className="text-red-500 text-xs">*</sup>}
        </label>
      )}
      {isTextarea ? (
        <textarea
          {...rest}
          ref={ref as React.RefObject<HTMLTextAreaElement>}
          style={{ border: '1px solid #e0e0e0' }}
          className="border-1 px-3 py-3 placeholder-blueGray-300 rounded-xl text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
          autoComplete={autoComplete}
          value={value ?? ''}
          onChange={(event) => onInputChange?.(event.target.value)}
          placeholder={placeholder}
        />
      ) : (
        <div className="position-relative w-full">
          <input
            {...rest}
            ref={ref}
            style={{ border: '1px solid #e0e0e0' }}
            className={classNames(
              'border-1 px-3 py-3 placeholder-blueGray-300 rounded-xl text-sm shadow-sm focus:outline-none focus:ring focus:border-0 w-full ease-linear transition-all duration-150',
              inputElementClassName,
            )}
            autoComplete={autoComplete}
            value={value ?? ''}
            onChange={(event) => onInputChange?.(event.target.value)}
            placeholder={placeholder}
          />
        </div>
      )}
      {errorMessage && (
        <span className={classNames('text-rose-500 text-xs')}>
          {errorMessage}
        </span>
      )}
    </div>
  ),
);

Input.displayName = 'Input';
