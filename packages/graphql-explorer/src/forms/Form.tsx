import React from 'react';
import Button from 'react-bootstrap/Button';
import BsForm from 'react-bootstrap/Form';
import FormBase from 'react-formal';

import FormField from './FormField';
import FormFields from './FormFields';

function Form(props: Obj) {
  return <FormBase as={BsForm} {...props} />;
}

export default Object.assign(Form, {
  Field: FormField,
  Fields: FormFields,
  Submit: (props: React.ComponentProps<typeof Button>) => (
    <FormBase.Submit as={Button} {...props} />
  ),
});
