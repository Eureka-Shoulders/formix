import React from 'react';

export type PathParam = Array<string | number> | string;

export interface GenericError {
  message: string;
  path: PathParam;
}

export interface FormixProps<T extends object> {
  initialValues: T;
  enableReinitialize?: boolean;
  children: React.ReactNode;
  onSubmit(values: T): Promise<void> | void;
  validate?: (values: T) => Promise<GenericError[]> | GenericError[];
  validationDebounce?: number;
}

export interface FieldProps<T> {
  name: string;
  value: T;
  onChange(event: React.ChangeEvent): void;
  onBlur(event: React.FocusEvent): void;
}

export interface FieldMeta<T> {
  initialValue: T;
  value: T;
  error: string | null;
  touched: boolean;
}

export interface FieldHelpers<T> {
  setValue(value: T): void;
}

// TODO: discuss about the best way to handle this types
export interface ArrayHelpers {
  values: unknown[];
  push(item: unknown): void;
  remove(index: number): void;
}
