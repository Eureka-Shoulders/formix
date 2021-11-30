import { createContext, useContext } from 'react';
import FormixStore from './FormixStore';

// TODO: improve types
export const FormContext = createContext<FormixStore<any> | null>(null);

/**
 * A hook to access the FormixStore from a React component.
 *
 * Only works if the component is a child of a Formix.
 * @returns A FormixStore instance
 */
export function useFormixContext() {
  const context = useContext(FormContext);

  if (!context)
    throw new Error(
      'useFormixContext() must be called inside a Formix component!'
    );

  return context;
}
