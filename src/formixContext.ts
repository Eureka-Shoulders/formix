import { createContext, useContext } from 'react';
import FormixStore from './FormixStore';

// TODO: improve types
export const FormContext = createContext<FormixStore<any> | null>(null);

export function useFormixContext() {
  const context = useContext(FormContext);

  if (!context)
    throw new Error(
      'useFormixContext() must be called inside a Formix component!'
    );

  return context;
}
