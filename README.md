# formix

A Formik inspired form library that uses MobX under the hood and update only the changed fields.

## Example

```tsx
import { Formix, TextField } from '@euk-labs/formix';

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
