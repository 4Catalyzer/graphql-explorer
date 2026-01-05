import React from 'react';
import Button from 'react-bootstrap/Button';
import BsForm from 'react-bootstrap/Form';
import FormBase from 'react-formal';
import type { ObjectSchema } from 'yup';

import FormField from './FormField';
import FormFields from './FormFields';

interface FormComponentProps extends Record<string, any> {
  schema: ObjectSchema<any>;
}

function Form(props: FormComponentProps) {
  return React.createElement(FormBase, { as: BsForm, ...props });
}

export default Object.assign(Form, {
  Field: FormField,
  Fields: FormFields,
  Submit: (props: React.ComponentProps<typeof Button>) => (
    <FormBase.Submit as={Button} {...props} />
  ),
});
