import { makeAutoObservable } from 'mobx';

class FieldStore<T> {
  private _name: string;
  private _initialValue: T;
  private _value: T;
  private _touched = false;
  private _error: string | null = null;

  constructor(
    properties: { name: string; initialValue: T },
    private enqueueValidation: () => void
  ) {
    makeAutoObservable(this, {}, { autoBind: true });

    this._name = properties.name;
    this._initialValue = properties.initialValue;
    this._value = properties.initialValue;
  }

  setValue(value: T) {
    this._value = value;
  }

  setTouched(value: boolean) {
    this._touched = value;
  }

  setError(error: string | null) {
    this._error = error;
  }

  resetField() {
    this.setValue(this.initialValue);
    this.setTouched(false);
  }

  /**
   * Event Handlers
   */

  private handleBlur() {
    this.setTouched(true);
    this.enqueueValidation();
  }

  private handleChange<Element extends HTMLInputElement>(
    event: React.ChangeEvent<Element>
  ) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.setValue(event.target.value as any);
  }

  /**
   * Getters
   */

  get name() {
    return this._name;
  }

  get value() {
    return this._value;
  }

  get touched() {
    return this._touched;
  }

  get error() {
    return this._error;
  }

  get initialValue() {
    return this._initialValue;
  }

  get fieldProps() {
    return {
      name: this.name,
      value: this.value,
      onChange: this.handleChange,
      onBlur: this.handleBlur,
    };
  }

  get fieldMeta() {
    return {
      initialValue: this._initialValue,
      value: this._value,
      error: this._error,
      touched: this._touched,
    };
  }

  get fieldHelpers() {
    return {
      setValue: this.setValue,
      resetField: this.resetField,
    };
  }
}

export default FieldStore;
