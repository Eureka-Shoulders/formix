import { useFormixContext } from "./formixContext";

export default function useArrayField(name: string) {
  const formix = useFormixContext();
  const values = formix.getValue(name);

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
