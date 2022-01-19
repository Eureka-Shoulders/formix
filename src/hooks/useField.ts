import { useEffect } from 'react';
import useFormixContext from './useFormixContext';

/**
 * A hook that helps you build custom fields in your form.
 *
 * It provides the properties of the field and a way to update its value.
 * @param name The name of the array field.
 */
export default function useField<
  T,
  Element extends HTMLInputElement = HTMLInputElement
>(name: string) {
  const formix = useFormixContext();

  if (!formix) {
    throw new Error('useField must be used within a Formix component');
  }

  useEffect(() => {
    formix.registerField(name);
  }, []);

  return {
    field: formix.getFieldProps<T, Element>(name),
    meta: formix.getFieldMeta(name),
    helpers: formix.getFieldHelpers(name),
  };
}
