import { useEffect } from 'react';
import { useFormixContext } from './formixContext';

export default function useField(name: string) {
  const formix = useFormixContext();

  useEffect(() => {
    formix.registerField(name);
  }, []);

  return {
    field: formix.getFieldProps(name),
    meta: formix.getFieldMeta(name),
    helpers: formix.getFieldHelpers(name),
  };
}
