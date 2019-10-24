import React, { useCallback } from 'react';
import Button from 'react-bootstrap/Button';
import BsForm from 'react-bootstrap/Form';
import Form from 'react-formal';
import * as yup from 'yup';
import Layout from '@4c/layout';

import FormField from './FormField';

interface FormFieldsProps {
  schema: yup.ObjectSchema<any>;
}

function isYupArray(s: yup.Schema<any>): s is yup.ArraySchema<any> {
  // eslint-disable-next-line no-underscore-dangle
  return (s as any)._type === 'array';
}

interface FieldArrayContentProps<T> {
  value?: T[];
  arrayHelpers: any;
  name: string;
}

interface FieldArrayProps {
  schema: yup.ArraySchema<any>;
  name: string;
  events: string;
}

function FieldArray({ schema, name, ...props }: FieldArrayProps) {
  // eslint-disable-next-line no-underscore-dangle
  const subType = (schema as any)._subType as yup.Schema<any>;

  const renderContent = useCallback(
    ({ value, arrayHelpers }: FieldArrayContentProps<any>) => (
      <div>
        {(value || []).map((i, idx) => (
          <div
            css="position: relative; margin-bottom: .5rem"
            // eslint-disable-next-line react/no-array-index-key
            key={idx}
          >
            <FormField name={`${name}[${idx}]`} />
            <Button
              onClick={() => arrayHelpers.remove(i)}
              variant="danger"
              css="position: absolute; top: 0; right: 0"
            >
              -
            </Button>
          </div>
        ))}
        <Button
          // eslint-disable-next-line no-underscore-dangle
          onClick={() => arrayHelpers.add(subType.default())}
        >
          +
        </Button>
      </div>
    ),
    [name, subType],
  );

  return (
    <Form.FieldArray name={name} {...props}>
      {renderContent}
    </Form.FieldArray>
  );
}

export default function FormFields({ schema }: FormFieldsProps) {
  const fields = Object.entries(schema.fields).map(([fieldName, field]) => (
    <BsForm.Group controlId={fieldName}>
      <Layout>
        <BsForm.Label css="margin-right: 1rem">{fieldName}</BsForm.Label>
        <Layout direction="column" grow>
          {!isYupArray(field) ? (
            <FormField name={fieldName} />
          ) : (
            <FieldArray events="blur" schema={field} name={fieldName} />
          )}
        </Layout>
      </Layout>
    </BsForm.Group>
  ));

  return <>{fields}</>;
}
