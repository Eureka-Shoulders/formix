import FormContext from '../context';
import { useMemo } from 'react';
import FormixStore from '../FormixStore';
import { FormixProps, ValidationLib } from '../types';

/**
 * A component that helps you with building forms. It provides a context that
 * you can use to access the form state and methods.
 * It receives the initial values to build the form and the onSubmit function to
 * handle the form submission.
 *
 * As optional parameter, you can pass a yup schema or a zod schema to validate
 * the form values. But you can use only one of them.
 * @param props - The props of the component.
 */
export default function Formix<T extends object, Schema extends object>(
  props: FormixProps<T, Schema>
) {
  const { initialValues, children, onSubmit, yupSchema, zodSchema } = props;

  if (yupSchema && zodSchema) {
    throw new Error('You can only use one schema at a time');
  }

  const formix = useMemo(
    () => {
      const validationSchema = yupSchema || zodSchema;
      let validationLib: ValidationLib | undefined = undefined;

      if (yupSchema) {
        validationLib = 'yup';
      }
      if (zodSchema) {
        validationLib = 'zod';
      }

      return new FormixStore<T, Schema>(
        initialValues,
        onSubmit,
        validationSchema,
        validationLib
      );
    },
    [] // eslint-disable-line
  );

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    formix.submitForm();
  }

  return (
    <FormContext.Provider value={formix}>
      <form onSubmit={handleSubmit}>{children}</form>
    </FormContext.Provider>
  );
}
