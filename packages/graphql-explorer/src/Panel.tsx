import { GraphQLArgument, GraphQLNonNull, GraphQLNullableType } from 'graphql';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button } from 'react-bootstrap';
import ListGroup from 'react-bootstrap/ListGroup';
import Spinner from 'react-bootstrap/Spinner';
import { MdClose } from 'react-icons/md';

import { useExplorer } from './ExplorerContext';
import ArgumentsForm from './forms/ArgumentsForm';
import PanelContainer, { usePanelContext } from './ui/PanelContainer';

interface Props {
  title: string;
  type: GraphQLNullableType;
  formArgs: GraphQLArgument[];
  defaultFormValue?: Obj | undefined;
  execute: (input: Obj, fragment?: string) => Promise<unknown>;
  allowSubFragment: boolean;
  canClose?: boolean;
}

export default function Panel({
  title,
  type,
  formArgs,
  execute,
  allowSubFragment,
  defaultFormValue,
  canClose = true,
}: Props) {
  const { closePanel, closeChildPanel } = usePanelContext();
  const waitToSubmit =
    formArgs.filter((a) => a.type instanceof GraphQLNonNull).length > 0;
  const [input, setInputBase] = useState<Obj | undefined>(
    waitToSubmit ? undefined : defaultFormValue,
  );
  const [item, setItem] = useState<any>();
  const [error, setError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const waitingForInput = waitToSubmit && !input;
  const setInput = useCallback(
    (newInput: Obj) => {
      setInputBase(newInput);
      closeChildPanel();
    },
    [closeChildPanel],
  );
  const explorer = useExplorer();

  useEffect(() => {
    async function fetchData() {
      if (waitingForInput) return; // wait to complete input
      setLoading(true);
      try {
        const newItem = await execute(input || {});
        setItem(newItem);
        setError(undefined);
        setLoading(false);
      } catch (ex) {
        setError(`${ex}`); // stringify so it can be rendered
        setItem(undefined);
        setLoading(false);
      }
    }
    fetchData();
  }, [execute, input, waitingForInput]);

  const executeQuery = useCallback(
    (fragment: string, newInput?: Obj) =>
      execute(newInput || input || {}, fragment),
    [execute, input],
  );

  const formContent = useMemo(() => {
    if (!formArgs || formArgs.length === 0) return null;
    return (
      <ArgumentsForm
        args={formArgs}
        onSubmit={setInput}
        defaultValue={defaultFormValue}
      />
    );
  }, [defaultFormValue, formArgs, setInput]);
  const mainSection = useMemo(() => {
    if (waitingForInput) return null;
    if (loading)
      return (
        <PanelContainer.Body>
          <div style={{ justifyContent: 'center', display: 'flex' }}>
            <Spinner
              animation="border"
              style={{ height: '3rem', width: '3rem' }}
            />
          </div>
        </PanelContainer.Body>
      );
    if (error)
      return (
        <ListGroup variant="flush">
          <ListGroup.Item variant="danger">
            <pre>
              <code>{error}</code>
            </pre>
          </ListGroup.Item>
        </ListGroup>
      );
    if (!item)
      return (
        <PanelContainer.Body>
          <h4>No item found</h4>
        </PanelContainer.Body>
      );

    const Section = explorer.resolveType(type)?.Section;
    if (!Section) return null;
    return (
      <Section
        item={item}
        type={type}
        executeQuery={allowSubFragment ? executeQuery : undefined}
        input={input}
      />
    );
  }, [
    allowSubFragment,
    error,
    executeQuery,
    explorer,
    input,
    item,
    loading,
    type,
    waitingForInput,
  ]);

  return (
    <>
      <PanelContainer.Header>
        {title}
        <div className="d-flex">
          {canClose && (
            <Button variant="light" onClick={closePanel}>
              <MdClose />
            </Button>
          )}
        </div>
      </PanelContainer.Header>
      {formContent && <PanelContainer.Body>{formContent}</PanelContainer.Body>}
      {mainSection}
    </>
  );
}
