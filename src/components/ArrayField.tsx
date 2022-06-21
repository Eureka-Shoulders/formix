import { observer } from 'mobx-react-lite';
import useArrayField from '../hooks/useArrayField';

// TODO: discuss about the best way to handle this types
export interface ArrayHelpers {
  values: unknown[];
  push(item: unknown): void;
  remove(index: number): void;
}

interface ArrayFieldProps {
  name: string;
  children: (arrayHelpers: ArrayHelpers) => React.ReactNode;
}

/**
 * A component that helps you render multiple fields that represents a list of fields.
 * @param name The name of the field.
 * @param children A function that receives the array helpers to add, remove and get the values.
 * It must return a React node.
 */
function ArrayField(props: ArrayFieldProps) {
  const { name, children } = props;
  const { values, helpers } = useArrayField(name);

  return <>{children({ values, ...helpers })}</>;
}

export default observer(ArrayField);
