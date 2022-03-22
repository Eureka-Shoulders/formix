import { makeAutoObservable, toJS, IObservableArray, action, flow } from 'mobx';
import {
  FieldHelpers,
  FieldMeta,
  FieldProps,
  ArrayHelpers,
  FormixProps,
  GenericError,
} from './types';
import { get, set } from './utils';

const VALIDATION_TIMEOUT = 300;

export default class FormixStore<T extends object> {
  private _isSubmitting = false;
  private _initialValues: T;
  private _values: T;
  private _errors: Partial<T> = {};
  private _toucheds: Partial<T> = {};
  private _disableds: Partial<T> = {};
  private _fields: string[] = [];
  private _validateFunc: FormixProps<T>['validate'];
  private _validateTimeout?: number;
  private _onSubmit: (values: T) => Promise<void> | void;

  constructor(initialValues: T, onSubmit: (values: T) => void) {
    makeAutoObservable<FormixStore<T>, '_onSubmit'>(
      this,
      {
        _onSubmit: false,
      },
      { autoBind: true }
    );

    this._initialValues = initialValues;
    this._values = initialValues;
    this._onSubmit = onSubmit;
  }

  setOnSubmitFunc(onSubmitFunc: FormixProps<T>['onSubmit']) {
    this._onSubmit = onSubmitFunc;
  }

  setValidateFunc(validateFunc: FormixProps<T>['validate']) {
    this._validateFunc = validateFunc;
    this.enqueueValidation();
  }

  setIsSubmitting(bool: boolean) {
    this._isSubmitting = bool;
  }

  setInitialValues(initialValues: T) {
    this._initialValues = initialValues;
    this.resetForm();
  }

  private handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    this.setFieldValue(event.target.name, event.target.value);
  }

  private handleBlur(event: React.FocusEvent<HTMLInputElement>) {
    set(this._toucheds, event.target.name, true);
    this.enqueueValidation();
  }

  async submitForm() {
    this.setIsSubmitting(true);
    this.touchAll();
    await this.validate();

    if (this.isValid) await this._onSubmit(this.values);

    this.setIsSubmitting(false);
  }

  resetForm() {
    this._values = toJS(this._initialValues);
    this.clearErrors();
    this.untouchAll();
  }

  registerField(name: string) {
    set(this._errors, name, null);
    set(this._toucheds, name, false);
    set(this._disableds, name, false);
    this._fields.push(name);
    this.enqueueValidation();
  }

  setFieldValue<Value>(name: string, value: Value) {
    set(this._values, name, value);
    this.enqueueValidation();
  }

  setFieldDisabled(name: string, disabled: boolean) {
    set(this._disableds, name, disabled);
  }

  getFieldProps<Value>(name: string): FieldProps<Value> {
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
      disabled: this.getDisabled(name),
    };

    return meta;
  }

  getFieldHelpers<Value>(name: string): FieldHelpers<Value> {
    const helpers = {
      setValue: (value: Value) => this.setFieldValue<Value>(name, value),
      setDisabled: (disabled: boolean) => this.setFieldDisabled(name, disabled),
    };

    return helpers;
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

  getDisabled(name: string): boolean {
    return !!get(this._disableds, name);
  }

  untouchAll() {
    this._fields.forEach((field) => {
      set(this._toucheds, field, false);
    });
  }

  touchAll() {
    this._fields.forEach((field) => {
      set(this._toucheds, field, true);
    });
  }

  validate = flow(function* (this: FormixStore<T>) {
    if (!this._validateFunc) return;

    clearTimeout(this._validateTimeout);

    const errors: GenericError[] = yield this._validateFunc(this.values);

    if (!errors.length && !this.isValid) {
      return this.clearErrors();
    }

    this.clearErrors();
    errors.forEach((error) => {
      let path = '';

      if (Array.isArray(error.path)) {
        path = error.path.join('.');
      } else {
        path = error.path;
      }

      this.setError(path, error.message);
    });
  });

  enqueueValidation() {
    clearTimeout(this._validateTimeout);
    this._validateTimeout = setTimeout(() => {
      this.validate();
    }, VALIDATION_TIMEOUT);
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
    return this._fields.every((field) => this.getError(field) === null);
  }
}
