import { useMutation } from '@apollo/react-hooks';
import { gql } from 'apollo-boost';
import React, { useCallback, useMemo } from 'react';
import Modal from 'react-bootstrap/Modal';
import Spinner from 'react-bootstrap/Spinner';

import { MutationDefinition, getMutationString } from '../mutations';
import { getSchemaFromArguments } from '../schema';
import Form from './Form';
import JsonAlert from './JsonAlert';

interface Props extends MutationDefinition {
  entity: Record<string, any>;
  show: boolean;
  onClose: () => void;
}

export default function MutationModal({
  title,
  mutation,
  inputFields,
  entity,
  show,
  onClose,
}: Props) {
  const mutationString = useMemo(() => gql(getMutationString(mutation)), [
    mutation,
  ]);
  const [mutate, { data, called, loading, error }] = useMutation(
    mutationString,
  );
  const handleSubmit = useCallback(input => mutate({ variables: { input } }), [
    mutate,
  ]);
  const formSchema = useMemo(() => getSchemaFromArguments(inputFields), [
    inputFields,
  ]);
  const defaultValue = useMemo(() => {
    const obj = formSchema.default();
    // TODO make this customizable
    Object.keys(formSchema.fields)
      .filter(k => entity[k] !== undefined)
      .forEach(k => {
        obj[k] = entity[k];
      });
    return obj;
  }, [entity, formSchema]);
  const resultPanel = useMemo(() => {
    if (loading) return <Spinner animation="border" />;
    if (error) return <JsonAlert variant="danger" content={error} />;
    if (data) return <JsonAlert variant="success" content={data} />;
    return null;
  }, [data, error, loading]);
  return (
    <>
      <Modal show={show} onHide={onClose} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>{title}</Modal.Title>
        </Modal.Header>
        <Form
          schema={formSchema}
          defaultValue={defaultValue}
          onSubmit={handleSubmit}
        >
          {mutation.description && (
            <>
              <Modal.Body>{mutation.description}</Modal.Body>
              <Modal.Footer />
            </>
          )}
          <Modal.Body>
            <Form.Fields schema={formSchema} />
          </Modal.Body>
          {resultPanel && (
            <>
              <Modal.Footer />
              <Modal.Body>{resultPanel}</Modal.Body>
            </>
          )}
          <Modal.Footer>
            <Form.Submit disabled={(called && !error) || loading}>
              Submit
            </Form.Submit>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
}
