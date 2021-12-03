import { useEffect } from 'react';
import { useFormixContext } from './formixContext';

/**
 * A hook that helps you build custom fields in your form.
 *
 * It provides the properties of the field and a way to update its value.
 * @param name The name of the array field.
 */
export default function useField<T, Element extends HTMLInputElement>(
  name: string
) {
  const formix = useFormixContext();

  useEffect(() => {
    formix.registerField(name);
  }, []);

  return {
    field: formix.getFieldProps<T, Element>(name),
    meta: formix.getFieldMeta(name),
    helpers: formix.getFieldHelpers(name),
  };
}
