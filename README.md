# Formix

![npm](https://img.shields.io/npm/v/@euk-labs/formix)
![NPM](https://img.shields.io/npm/l/@euk-labs/formix)
![GitHub Workflow Status](https://img.shields.io/github/workflow/status/Eureka-Shoulders/formix/CI)
![npm](https://img.shields.io/npm/dw/@euk-labs/formix)

A Formik inspired form library that uses MobX under the hood and update only the changed fields.

## Example

### Creating your first input

```tsx
import { useField } from '@euk-labs/formix';
import { InputHTMLAttributes } from 'react';

function TextField(
  props: InputHTMLAttributes<HTMLInputElement> & { name: string }
) {
  const { name, ...rest } = props;
  const { field } = useField(name);

  return <input {...rest} {...field} />;
}
```

### Creating your first form

```tsx
import { Formix } from '@euk-labs/formix';
import { TextField } from './TextField';

const initialValues = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
};

function handleSubmit(values) {
  console.log(values);
}

function Form() {
  return (
    <Formix initialValues={initialValues} onSubmit={handleSubmit}>
      <TextField name="firstName" placeholder="First Name" />
      <TextField name="lastName" placeholder="Last Name" />
      <TextField name="email" placeholder="E-mail" />
      <TextField name="password" placeholder="Password" />

      <button type="submit">Submit</button>
    </Formix>
  );
}
```
