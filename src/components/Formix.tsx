import FormContext from '../context';
import { useEffect, useRef, useState } from 'react';
import FormixStore from '../FormixStore';
import { FormixProps } from '../types';

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
  const { initialValues, enableReinitialize, children, onSubmit, validate } =
    props;
  const [formix] = useState(() => new FormixStore<T>(initialValues, onSubmit));
  const isFirstMount = useRef(true);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    formix.submitForm();
  }

  useEffect(() => {
    formix.setValidateFunc(validate);
  }, [validate]);

  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }

    if (enableReinitialize) {
      formix.setInitialValues(initialValues);
      formix.setOnSubmitFunc(onSubmit);
    }
  }, [initialValues, onSubmit]);

  return (
    <FormContext.Provider value={formix}>
      <form onSubmit={handleSubmit}>{children}</form>
    </FormContext.Provider>
  );
}
