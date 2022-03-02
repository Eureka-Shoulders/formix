import { useEffect, useState } from 'react';
import FieldStore from '../FieldStore';
import useFormixContext from './useFormixContext';

/**
 * A hook that helps you build custom fields in your form.
 *
 * It provides the properties of the field and a way to update its value.
 * @param name The name of the array field.
 */
export default function useField<T>(name: string) {
  const formix = useFormixContext();
  const [field, setField] = useState<FieldStore<T> | null>(null);

  if (!formix) {
    throw new Error('useField must be used within a Formix component');
  }

  useEffect(() => {
    setField(formix.registerField(name));
  }, []);

  return {
    field: field?.fieldProps,
    meta: field?.fieldMeta,
    helpers: field?.fieldHelpers,
  };
}
