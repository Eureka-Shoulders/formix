import FormContext from '../context';
import { CSSProperties, useEffect, useRef, useState } from 'react';
import FormixStore, { GenericError } from '../FormixStore';

export interface FormixProps<T extends object> {
  initialValues: T;
  enableReinitialize?: boolean;
  children: React.ReactNode;
  style?: CSSProperties;
  onSubmit(values: T): Promise<void> | void;
  validate?: (values: T) => Promise<GenericError[]> | GenericError[];
  validationDebounce?: number;
  formProps?: React.FormHTMLAttributes<HTMLFormElement>;
}

/**
 * A component that helps you with building forms. It provides a context that
 * you can use to access the form state and methods.
 * It receives the initial values to build the form and the onSubmit function to
 * handle the form submission.
 *
 * As optional parameter, you can pass a validate function that returns an array of errors.
 * @param props - The props of the component.
 */
export default function Formix<T extends object>(props: FormixProps<T>) {
  const { initialValues, validationDebounce, onSubmit, validate } = props;
  const [formix] = useState(() => new FormixStore<T>(initialValues, onSubmit));
  const isFirstMount = useRef(true);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    formix.submitForm();
  }

  useEffect(() => {
    formix.setValidateFunc(validate);
    formix.setValidationDebounce(validationDebounce || 0);
  }, [validate, validationDebounce]);

  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }

    formix.setOnSubmitFunc(onSubmit);

    if (props.enableReinitialize) {
      formix.setInitialValues(initialValues);
    }
  }, [initialValues, onSubmit]);

  return (
    <FormContext.Provider value={formix}>
      <form onSubmit={handleSubmit} style={props.style} {...props.formProps}>
        {props.children}
      </form>
    </FormContext.Provider>
  );
}
