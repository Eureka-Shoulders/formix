import { observer } from 'mobx-react-lite';
import React from 'react';
import { ArrayHelpers } from './types';
import useArrayField from './useArrayField';

interface ArrayFieldProps {
  name: string;
  children: (arrayHelpers: ArrayHelpers) => React.ReactNode;
}

function ArrayField(props: ArrayFieldProps) {
  const { name, children } = props;
  const { values, helpers } = useArrayField(name);

  return <>{children({ values, ...helpers })}</>;
}

export default observer(ArrayField);
