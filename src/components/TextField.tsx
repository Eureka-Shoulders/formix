import { observer } from 'mobx-react-lite';
import { InputHTMLAttributes } from 'react';
import useField from '../hooks/useField';

/**
 * A component that renders a input field connected to Formix context
 * and only needs a name to work properly.
 * @param props The props of HTML input element.
 */
function TextField(
  props: InputHTMLAttributes<HTMLInputElement> & { name: string }
) {
  const { name, ...rest } = props;
  const { field } = useField<string>(name);

  return <input {...rest} {...field} />;
}

export default observer(TextField);
