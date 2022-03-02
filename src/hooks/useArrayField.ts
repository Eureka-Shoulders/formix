import useFormixContext from './useFormixContext';

/**
 * A hook that helps you build array fields in your form.
 *
 * It provides a way to add and remove array fields.
 * @param name The name of the array field.
 */
export default function useArrayField<T>(name: string) {
  const formix = useFormixContext();

  if (!formix) {
    throw new Error('useField must be used within a Formix component');
  }

  const values = formix.values[name] as T[];
  const helpers = formix.getArrayHelpers<T>(name);

  return {
    values,
    helpers,
  };
}
