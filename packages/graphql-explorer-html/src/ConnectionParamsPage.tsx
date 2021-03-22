import { JsonInput, jsonField } from 'graphql-explorer/lib/ui/JsonInput';
import React from 'react';
import Button from 'react-bootstrap/Button';
import BsForm from 'react-bootstrap/Form';
import Form from 'react-formal';
import * as yup from 'yup';

const schema = yup
  .object({
    uri: yup
      .string()
      .default('https://swapi-graphql.netlify.app/.netlify/functions/index')
      .required(),
    headers: jsonField().default({}) as yup.BaseSchema<Record<string, any>>,
  })
  .required();

export type ConnectionParams = yup.InferType<typeof schema>;

interface Props {
  connectionParams?: ConnectionParams;
  onChange: (v: ConnectionParams) => void;
}

export default function ConnectionParamsPage({
  connectionParams,
  onChange,
}: Props) {
  return (
    <Form
      defaultValue={connectionParams ?? schema.getDefault()}
      onSubmit={onChange}
      schema={schema}
      style={{
        width: '500px',
        margin: '100px auto',
      }}
    >
      <h3>Connect to a GraphQL Endpoint</h3>
      <BsForm.Group>
        <BsForm.Label>Graphql API url</BsForm.Label>
        <Form.Field as={BsForm.Control} name="uri" />
      </BsForm.Group>
      <BsForm.Group>
        <BsForm.Label>Headers</BsForm.Label>
        <Form.Field name="headers" as={JsonInput} />
      </BsForm.Group>
      <p style={{ color: 'red' }}>
        <Form.Message for="" />
      </p>
      <Form.Submit as={Button}>SUBMIT</Form.Submit>
    </Form>
  );
}
