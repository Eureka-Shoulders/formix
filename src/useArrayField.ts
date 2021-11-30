import { useFormixContext } from './formixContext';

/**
 * A hook that helps you build array fields in your form.
 *
 * It provides a way to add and remove array fields.
 * @param name The name of the array field.
 */
export default function useArrayField(name: string) {
  const formix = useFormixContext();
  const values = formix.getValue(name);

  // TODO: improve this type
  function push(item: any) {
    formix.setFieldValue(name, [...values, item]);
  }

  function remove(index: number) {
    const newArray = [...values];
    newArray.splice(index, 1);
    formix.setFieldValue(name, newArray);
  }

  return {
    values,
    helpers: {
      push,
      remove,
    },
  };
}
