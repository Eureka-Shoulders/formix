import { Context, createContext, useContext } from 'react';
import FormixStore from './FormixStore';

export const FormContext = createContext({} as unknown);

/**
 * A hook to access the FormixStore from a React component.
 *
 * Only works if the component is a child of a Formix.
 * @returns A FormixStore instance
 */
export function useFormixContext<T extends object, Schema>() {
  const context = useContext(FormContext as Context<FormixStore<T, Schema>>);

  if (!context)
    throw new Error(
      'useFormixContext() must be called inside a Formix component!'
    );

  return context;
}
