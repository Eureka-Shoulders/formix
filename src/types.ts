import React from 'react';

export type PathParam = Array<string | number> | string;

export interface FormixProps<T extends object, Schema extends object> {
  initialValues: T;
  children: React.ReactNode;
  yupSchema?: Schema;
  zodSchema?: Schema;
  onSubmit(values: T): Promise<void> | void;
}

export type ValidationLib = 'yup' | 'zod';

export interface FieldProps<T, Element> {
  name: string;
  value: T;
  onChange(event: React.ChangeEvent<Element>): void;
  onBlur(event: React.FocusEvent<Element>): void;
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
