import { GraphQLNonNull } from 'graphql';
import React, { useCallback, useMemo, useState } from 'react';
import Button from 'react-bootstrap/Button';
import BsForm from 'react-bootstrap/Form';
import Form, { NestedForm } from 'react-formal';
import * as yup from 'yup';

import { SchemaMeta } from '../schema';
import FormField from './FormField';

interface FormFieldsProps {
  schema: yup.ObjectSchema<any>;
}

export function resolveLazy<T extends yup.Schema<any>>(
  schema: T & { resolve?: (opts: any) => T },
): T {
  return schema.resolve ? schema.resolve({}) : schema;
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

type BaseFieldArrayProps = React.ComponentProps<typeof Form.FieldArray>;
type FieldArrayProps = Omit<BaseFieldArrayProps, 'children'> & {
  schema: yup.ArraySchema<any>;
};

function FieldArray({ schema, name, ...props }: FieldArrayProps) {
  // eslint-disable-next-line no-underscore-dangle
  const subType = resolveLazy((schema as any)._subType as yup.Schema<any>);

  const renderContent: BaseFieldArrayProps['children'] = useCallback(
    (value, helpers) => (
      <div>
        {(value || []).map((i, idx) => (
          <div
            className="ge-FormFields-field-array-container"
            // eslint-disable-next-line react/no-array-index-key
            key={idx}
          >
            <FormField name={`${name}[${idx}]`} />
            <Button
              onClick={() => helpers.remove(i)}
              variant="danger"
              className="ge-FormFields-field-array-button"
            >
              -
            </Button>
          </div>
        ))}
        <Button
          // eslint-disable-next-line no-underscore-dangle
          onClick={() => helpers.add(subType.default())}
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

function NestedFormFields({
  schema,
  fieldName,
}: {
  schema: yup.ObjectSchema<any>;
  fieldName: string;
}) {
  const gqlType = (schema.meta() as SchemaMeta).field.type;
  const isRequired = gqlType instanceof GraphQLNonNull;

  const [expanded, setExpanded] = useState(isRequired);
  const expand = useCallback(() => setExpanded(true), [setExpanded]);

  if (!expanded) {
    return (
      <div>
        <Button onClick={expand}>+</Button>
      </div>
    );
  }

  return (
    <NestedForm name={fieldName}>
      {/* eslint-disable-next-line @typescript-eslint/no-use-before-define */}
      <FormFields schema={schema} />
    </NestedForm>
  );
}

export default function FormFields({ schema }: FormFieldsProps) {
  const renderField = useCallback(
    (field: yup.Schema<unknown>, fieldName: string) => {
      // eslint-disable-next-line no-param-reassign
      field = resolveLazy(field);
      // schema.meta() is undefined for root objects
      const { Component } = field.meta() as SchemaMeta;

      // we use the array and nested helpers only if a component is not specified
      if (!Component) {
        if (isYupArray(field)) {
          return <FieldArray schema={field} name={fieldName} />;
        }
        if (isYupObject(field)) {
          return (
            <>
              <NestedFormFields schema={field} fieldName={fieldName} />
              <FormField.Message for={fieldName} />
            </>
          );
        }
      }

      return <FormField name={fieldName} />;
    },
    [],
  );

  // hide the label IFF the current type has only one field, and this field
  // is an object type - to reduce nesting
  const shouldShowLabel = useMemo(() => {
    const subFields = Object.values(schema.fields);
    if (subFields.length > 1) return true;
    const [subField] = subFields;
    return !(subField && isYupObject(subField));
  }, [schema.fields]);

  const fields = useMemo(
    () =>
      Object.entries(schema.fields).map(([fieldName, field]) => (
        <BsForm.Group key={fieldName} controlId={fieldName}>
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
