import { observer } from 'mobx-react-lite';
import { InputHTMLAttributes } from 'react';
import useField from './useField';

function TextField(
  props: InputHTMLAttributes<HTMLInputElement> & { name: string }
) {
  const { name, ...rest } = props;
  const { field } = useField(name);

  return <input {...rest} {...field} />;
}

export default observer(TextField);
