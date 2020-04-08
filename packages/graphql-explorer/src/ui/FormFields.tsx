import React, { useCallback, useMemo } from 'react';
import Button from 'react-bootstrap/Button';
import BsForm from 'react-bootstrap/Form';
import Form from 'react-formal';
import NestedForm from 'react-formal/lib/NestedForm';
import * as yup from 'yup';

import FormField from './FormField';

interface FormFieldsProps {
  schema: yup.ObjectSchema<any>;
}

export function resolveLazy<T extends yup.Schema<any>>(schema: T): T {
  return schema.constructor.name === 'Lazy'
    ? // eslint-disable-next-line no-underscore-dangle
      (schema as any)._resolve()
    : schema;
}

export function isYupArray(
  s: yup.Schema<unknown>,
): s is yup.ArraySchema<unknown> {
  // eslint-disable-next-line no-underscore-dangle
  return (s as any)._type === 'array';
}

export function isYupObject(s: yup.Schema<any>): s is yup.ObjectSchema<any> {
  // eslint-disable-next-line no-underscore-dangle
  return (s as any)._type === 'object';
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
  const subType = resolveLazy((schema as any)._subType as yup.Schema<any>);

  const renderContent = useCallback(
    ({ value, arrayHelpers }: FieldArrayContentProps<any>) => (
      <div>
        {(value || []).map((i, idx) => (
          <div
            className="ge-FormFields-field-array-container"
            // eslint-disable-next-line react/no-array-index-key
            key={idx}
          >
            <FormField name={`${name}[${idx}]`} />
            <Button
              onClick={() => arrayHelpers.remove(i)}
              variant="danger"
              className="ge-FormFields-field-array-button"
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

const FormLabel = ({ children }: { children: React.ReactNode }) => (
  <BsForm.Label className="ge-FormFields-label">
    <b>{children}</b>
  </BsForm.Label>
);

export default function FormFields({ schema }: FormFieldsProps) {
  const renderField = useCallback(
    (field: yup.Schema<unknown>, fieldName: string) => {
      // eslint-disable-next-line no-param-reassign
      field = resolveLazy(field);
      if (isYupArray(field)) {
        return <FieldArray events="blur" schema={field} name={fieldName} />;
      }
      if (isYupObject(field)) {
        return (
          <>
            <NestedForm name={fieldName}>
              <FormFields schema={field} />
            </NestedForm>
            <FormField.Message for={fieldName} />
          </>
        );
      }

      return <FormField name={fieldName} />;
    },
    [],
  );

  const shouldShowLabel = useMemo(
    () => Object.keys(schema.fields).length > 1,
    [schema.fields],
  );

  const fields = useMemo(
    () =>
      Object.entries(schema.fields).map(([fieldName, field]) => (
        <BsForm.Group controlId={fieldName}>
          <div className="d-flex">
            {shouldShowLabel && <FormLabel>{fieldName}</FormLabel>}
            <div className="d-flex flex-column flex-grow-1">
              {renderField(field, fieldName)}
            </div>
          </div>
        </BsForm.Group>
      )),
    [renderField, schema.fields, shouldShowLabel],
  );

  return <>{fields}</>;
}
