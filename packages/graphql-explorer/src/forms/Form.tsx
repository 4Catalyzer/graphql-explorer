import React from 'react';
import Button from 'react-bootstrap/Button';
import BsForm from 'react-bootstrap/Form';
import { Form as FormBase } from 'react-formal';

import FormField from './FormField';
import FormFields from './FormFields';

interface FormComponentProps extends Record<string, any> {} // eslint-disable-line @typescript-eslint/no-empty-object-type

function Form(props: FormComponentProps): React.ReactElement {
  return React.createElement(FormBase, { as: BsForm, ...props });
}

export default Object.assign(Form, {
  Field: FormField,
  Fields: FormFields,
  Submit: (props: React.ComponentProps<typeof Button>) => (
    <div className="mt-3">
      <FormBase.Submit as={Button} {...props} />
    </div>
  ),
});
