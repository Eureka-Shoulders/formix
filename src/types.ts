import { AnySchema, ObjectSchema } from 'yup';
import { ZodType } from 'zod';

export interface ArrayHelpers {
  values: unknown[];
  push(item: unknown): void;
  remove(index: number): void;
}

export type PathParam = Array<string | number> | string;

export interface FormixProps<T extends object> {
  initialValues: T;
  children: React.ReactNode;
  yupSchema?: ObjectSchema<any>;
  zodSchema?: ZodType<any, any, any>;
  onSubmit(values: T): Promise<void> | void;
}

export type MultiSchema = ObjectSchema<any> | ZodType<any, any, any>;
export type ValidationLib = 'yup' | 'zod';
