import {
  makeAutoObservable,
  runInAction,
  toJS,
  IObservableArray,
  action,
} from 'mobx';
import { ValidationLib, FieldHelpers, FieldMeta, FieldProps } from './types';
import { get, set } from './utils';
import { ZodError } from 'zod';
import { ObjectSchema, ValidationError } from 'yup';
import { ArrayHelpers } from './types';

export default class FormixStore<T extends object, Schema> {
  private _isSubmitting = false;
  private _initialValues: T;
  private _values: T;
  private _errors: Partial<T> = {};
  private _toucheds: Partial<T> = {};
  private _fields: string[] = [];
  private _validationSchema?: Schema;
  private _validationLib?: ValidationLib;
  private _onSubmit: (values: T) => Promise<void> | void;

  constructor(
    initialValues: T,
    onSubmit: (values: T) => void,
    validationSchema?: Schema,
    validationLib?: ValidationLib
  ) {
    makeAutoObservable<FormixStore<T, Schema>, '_onSubmit'>(
      this,
      {
        _onSubmit: false,
      },
      { autoBind: true }
    );

    this._initialValues = initialValues;
    this._values = initialValues;
    this._onSubmit = onSubmit;
    this._validationSchema = validationSchema;
    this._validationLib = validationLib;
  }

  setIsSubmitting(bool: boolean) {
    this._isSubmitting = bool;
  }

  private handleChange<T extends HTMLInputElement>(
    event: React.ChangeEvent<T>
  ) {
    this.setFieldValue(event.target.name, event.target.value);
  }

  private handleBlur<T extends HTMLInputElement>(event: React.FocusEvent<T>) {
    set(this._toucheds, event.target.name, true);
    this.validate();
  }

  async submitForm() {
    this.setIsSubmitting(true);
    this.touchAll();
    await this.validate();

    if (this.isValid) await this._onSubmit(this.values);

    this.setIsSubmitting(false);
  }

  registerField(name: string) {
    set(this._errors, name, null);
    set(this._toucheds, name, false);
    this._fields.push(name);
    this.validate();
  }

  setFieldValue<Value>(name: string, value: Value) {
    set(this._values, name, value);
    this.validate();
  }

  getFieldProps<Value, Element extends HTMLInputElement>(
    name: string
  ): FieldProps<Value, Element> {
    const field = {
      name,
      value: this.getValue<Value>(name),
      onChange: this.handleChange,
      onBlur: this.handleBlur,
    };

    return field;
  }

  getFieldMeta<Value>(name: string): FieldMeta<Value> {
    const meta = {
      initialValue: this.getInitialValue<Value>(name),
      value: this.getValue<Value>(name),
      error: this.getError(name),
      touched: this.getTouched(name),
    };

    return meta;
  }

  getFieldHelpers<Value>(name: string): FieldHelpers<Value> {
    const helpers = {
      setValue: (value: Value) => this.setFieldValue<Value>(name, value),
    };

    return helpers;
  }

  getArrayHelpers<Value = unknown>(name: string): Omit<ArrayHelpers, 'values'> {
    const push = action((value: Value) => {
      const array = get(this._values, name) as IObservableArray<Value>;
      array.push(value);
      this.validate();
    });

    const remove = action((index: number) => {
      const array = get(this._values, name) as IObservableArray<Value>;
      array.spliceWithArray(index, 1);
      this.validate();
    });

    const helpers = {
      push,
      remove,
    };

    return helpers;
  }

  getValue<Value>(name: string): Value {
    return get(this._values, name);
  }

  getInitialValue<Value>(name: string): Value {
    return get(this._initialValues, name);
  }

  /**
   * Errors
   */

  getError(name: string): string {
    return get(this._errors, name);
  }

  setError(name: string, error: string | null) {
    if (this.getError(name) === undefined) return;

    return set(this._errors, name, error);
  }

  clearErrors() {
    this._fields.forEach((field) => {
      if (this.getError(field)) {
        this.setError(field, null);
      }
    });
  }

  getTouched(name: string): boolean {
    return !!get(this._toucheds, name);
  }

  touchAll() {
    this._fields.forEach((field) => {
      set(this._toucheds, field, true);
    });
  }

  async validate() {
    if (!this._validationSchema) return;

    /**
     * Yup Validation
     */
    if (this._validationLib === 'yup') {
      if (this._validationSchema instanceof ObjectSchema) {
        try {
          await this._validationSchema.validate(this._values, {
            abortEarly: false,
          });

          if (!this.isValid) {
            this.clearErrors();
          }
        } catch (error) {
          if (error instanceof ValidationError) {
            this._fields.forEach((field) => {
              const innerError = (error as ValidationError).inner.find(
                (err) => err.path === field
              );

              runInAction(() => {
                if (innerError) {
                  this.setError(field, innerError.message);
                } else {
                  this.setError(field, null);
                }
              });
            });
          }
        }
      }
    }

    /**
     * Zod Validation
     */
    if (this._validationLib === 'zod') {
      let zod;

      try {
        zod = await import('zod');

        if (this._validationSchema instanceof zod.ZodType) {
          try {
            this._validationSchema.parse(toJS(this._values));
            if (!this.isValid) {
              this.clearErrors();
            }
          } catch (error) {
            if (error instanceof zod.ZodError) {
              this._fields.forEach((field) => {
                const innerError = (error as ZodError).errors.find(
                  (err) => err.path.join('.') === field
                );

                runInAction(() => {
                  if (innerError) {
                    this.setError(field, innerError.message);
                  } else {
                    this.setError(field, null);
                  }
                });
              });
            }
          }
        }
      } catch (error) {
        throw new Error(
          'You have to install zod before using it as validator!'
        );
      }
    }
  }

  get initialValues() {
    return this._initialValues;
  }

  get values() {
    return toJS(this._values);
  }

  get isSubmitting() {
    return this._isSubmitting;
  }

  get isValid() {
    let isValid = true;

    this._fields.forEach((field) => {
      if (this.getError(field) !== null) {
        isValid = false;
      }
    });

    return isValid;
  }
}
