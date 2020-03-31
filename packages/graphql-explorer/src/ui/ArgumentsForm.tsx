import * as g from 'graphql';
import React, { ReactNode, useMemo } from 'react';
import { ObjectSchema } from 'yup';

import { getSchemaFromArguments } from '../schema';
import Form from './Form';

interface Props {
  args: g.GraphQLArgument[];
  children?: ReactNode;
  defaultValue?: Record<string, any>;

  [idx: string]: any;
}

function generateDefaultValue(schema: ObjectSchema<any>, defaultValue: any) {
  let obj = schema.default();

  Object.keys(schema.fields)
    .filter((k) => defaultValue[k] !== undefined)
    .forEach((k) => {
      if (!obj) {
        obj = {};
      }
      obj[k] = defaultValue[k];
      if (typeof obj[k] === 'object') {
        obj[k] = generateDefaultValue(
          schema.fields[k] as ObjectSchema,
          obj[k],
        );
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
  const schema = getSchemaFromArguments(args);
  const fullDefaultValue = useMemo(
    () => generateDefaultValue(schema, defaultValue),
    [defaultValue, schema],
  );

  return (
    <Form schema={schema} defaultValue={fullDefaultValue} {...props}>
      <Form.Fields schema={schema} />
      {children}
      <Form.Submit>Submit</Form.Submit>
    </Form>
  );
}
