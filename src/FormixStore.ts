import {
  makeAutoObservable,
  runInAction,
  toJS,
  IObservableArray,
  action,
} from 'mobx';
import { ValidationLib } from './types';
import { get } from './utils';
import { ZodError } from 'zod';
import { ObjectSchema, ValidationError } from 'yup';
import { ArrayHelpers } from './types';
import FieldStore from './FieldStore';

// TODO: disabled status on meta
// TODO: setDisabled(field, boolean)
export default class FormixStore<T extends Record<string, unknown>, Schema> {
  private _isSubmitting = false;
  private _initialValues: T;
  private _values: T;
  private _validationSchema?: Schema;
  private _validationLib?: ValidationLib;
  private _validateTimeout?: number;
  private _onSubmit: (values: T) => Promise<void> | void;

  private _fields: Map<string, FieldStore<unknown>> = new Map();

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

  async submitForm() {
    this.setIsSubmitting(true);
    this.touchAll();
    await this.validate();

    if (this.isValid) {
      await this._onSubmit(this.values);
    }

    this.setIsSubmitting(false);
  }

  resetForm() {
    this._fields.forEach((field) => {
      field.resetField();
    });
    this.clearErrors();
  }

  registerField<Value>(name: string) {
    const initialValue = this.getInitialValue<Value>(name);
    const field = new FieldStore<Value>(
      { name, initialValue },
      this.enqueueValidation
    );

    this._fields.set(name, field);
    this.enqueueValidation();

    return field;
  }

  setFieldValue<Value>(name: string, value: Value) {
    const field = this._fields.get(name);

    if (!field) {
      return console.warn(`Field ${name} does not exist`);
    }

    field.setValue(value);
    this.enqueueValidation();
  }

  getFieldProps(name: string) {
    const field = this._fields.get(name);

    if (!field) {
      return console.error(`Field ${name} does not exist`);
    }

    return field.fieldProps;
  }

  getFieldMeta(name: string) {
    const field = this._fields.get(name);

    if (!field) {
      return console.error(`Field ${name} does not exist`);
    }

    return field.fieldMeta;
  }

  getFieldHelpers(name: string) {
    const field = this._fields.get(name);

    if (!field) {
      return console.error(`Field ${name} does not exist`);
    }

    return field.fieldHelpers;
  }

  getArrayHelpers<Value = unknown>(name: string): Omit<ArrayHelpers, 'values'> {
    const push = action((value: Value) => {
      const array = get(this._values, name) as IObservableArray<Value>;
      array.push(value);
      this.enqueueValidation();
    });

    const remove = action((index: number) => {
      const array = get(this._values, name) as IObservableArray<Value>;
      array.spliceWithArray(index, 1);
      this.enqueueValidation();
    });

    const helpers = {
      push,
      remove,
    };

    return helpers;
  }

  getInitialValue<Value>(name: string): Value {
    return get(this._initialValues, name);
  }

  /**
   * Errors
   */

  clearErrors() {
    this._fields.forEach((field) => {
      if (field.error) {
        field.setError(null);
      }
    });
  }

  touchAll() {
    this._fields.forEach((field) => {
      field.setTouched(true);
    });
  }

  async validate() {
    if (!this._validationSchema) return;

    clearTimeout(this._validateTimeout);

    console.log('validating...');

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
                (err) => err.path === field.name
              );

              runInAction(() => {
                if (innerError) {
                  field.setError(innerError.message);
                } else {
                  field.setError(null);
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
                  (err) => err.path.join('.') === field.name
                );

                runInAction(() => {
                  if (innerError) {
                    field.setError(innerError.message);
                  } else {
                    field.setError(null);
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

  enqueueValidation() {
    clearTimeout(this._validateTimeout);
    this._validateTimeout = setTimeout(() => {
      this.validate();
    }, 700);
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
      if (field.error !== null) {
        isValid = false;
      }
    });

    return isValid;
  }
}
