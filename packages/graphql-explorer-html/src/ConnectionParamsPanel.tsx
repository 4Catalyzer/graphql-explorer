import { JsonInput, jsonField } from 'graphql-explorer/lib/JsonInput';
import React from 'react';
import Form from 'react-formal';
import * as yup from 'yup';

const schema = yup.object({
  uri: yup
    .string()
    .default('https://api.graph.cool/simple/v1/swapi')
    .required(),
  headers: jsonField().default({}),
});

export type ConnectionParams = yup.InferType<typeof schema>;

interface Props {
  connectionParams?: ConnectionParams;
  onChange: (v: ConnectionParams) => void;
}

export default function ConnectionParamsPanel({
  connectionParams,
  onChange,
}: Props) {
  return (
    <Form
      defaultValue={connectionParams ?? schema.default()}
      onSubmit={onChange}
      schema={schema}
    >
      <Form.Field name="uri" />
      <Form.Field name="headers" as={JsonInput} />
      <p style={{ color: 'red' }}>
        <Form.Message for="" />
      </p>
      <Form.Submit>SUBMIT</Form.Submit>
    </Form>
  );
}
