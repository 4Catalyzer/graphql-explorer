import * as g from 'graphql';
import React, { ReactNode, useMemo } from 'react';
import { Schema } from 'yup';

import Form from './Form';
import { isYupObject, resolveLazy } from './FormFields';
import { useExplorer } from '../ExplorerContext';

interface Props extends Record<string, any> {
  args: g.GraphQLArgument[];
  children?: ReactNode;
  defaultValue?: Record<string, any>;
}

function generateDefaultValue(_schema: Schema, defaultValue: any) {
  const schema = resolveLazy(_schema);
  let obj = schema.getDefault();

  if (!isYupObject(schema)) {
    return defaultValue === undefined ? obj : defaultValue;
  }

  Object.keys(schema.fields)
    .filter((k) => defaultValue[k] !== undefined)
    .forEach((k) => {
      if (!obj) {
        obj = {};
      }
      obj[k] = defaultValue[k];
      if (typeof obj[k] === 'object') {
        obj[k] = generateDefaultValue(schema.fields[k] as any, obj[k]);
      }
    });

  return obj;
}

export default function ArgumentsForm({
  args,
  children,
  defaultValue = {},
  ...props
}: Props) {
  const { schemaBuilder } = useExplorer();
  const schema = schemaBuilder.getSchemaFromArguments(args);
  const fullDefaultValue = useMemo(
    () => generateDefaultValue(schema, defaultValue),
    [defaultValue, schema],
  );

  return (
    <Form schema={schema as any} defaultValue={fullDefaultValue} {...props}>
      <Form.Fields schema={schema as any} />
      {children}
      <Form.Submit>Submit</Form.Submit>
    </Form>
  );
}
