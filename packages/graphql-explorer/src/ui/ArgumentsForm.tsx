import * as g from 'graphql';
import React, { ReactNode } from 'react';

import { getSchemaFromArguments } from '../schema';
import Form from './Form';

interface Props {
  args: g.GraphQLArgument[];
  children?: ReactNode;

  [idx: string]: any;
}

export default function ArgumentsForm({ args, children, ...props }: Props) {
  const schema = getSchemaFromArguments(args);

  return (
    <Form schema={schema} defaultValue={schema.default()} {...props}>
      <Form.Fields schema={schema} />
      {children}
      <Form.Submit>Submit</Form.Submit>
    </Form>
  );
}
