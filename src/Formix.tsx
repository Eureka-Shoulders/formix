import { useMemo } from 'react';
import { FormContext } from './formixContext';
import FormixStore from './FormixStore';
import { FormixProps, ValidationLib } from './types';

export default function Formix<T extends object>(props: FormixProps<T>) {
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

      return new FormixStore<T>(
        initialValues,
        onSubmit,
        validationSchema,
        validationLib
      );
    },
    [] // eslint-disable-line
  );

  function handleSubmit(event: any) {
    event.preventDefault();

    formix.submitForm();
  }

  return (
    <FormContext.Provider value={formix}>
      <form onSubmit={handleSubmit}>{children}</form>
    </FormContext.Provider>
  );
}
