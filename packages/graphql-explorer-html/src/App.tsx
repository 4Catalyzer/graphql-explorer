import { ApolloClient, InMemoryCache } from '@apollo/client';
import { GraphQLSchema } from 'graphql';
import Explorer from 'graphql-explorer/lib/Explorer';
import ExplorerConfiguration from 'graphql-explorer/lib/logic/Configuration';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import Spinner from 'react-bootstrap/Spinner';

import ConnectionParamsPage, {
  ConnectionParams,
} from './ConnectionParamsPage';
import useSchema from './useSchema';

const CACHE_KEY = 'graphql-explorer-connection';

function App() {
  const [connectionParams, setConnectionParams] = useState<
    ConnectionParams | undefined
  >(() => {
    const cachedValue = window.localStorage.getItem(CACHE_KEY);
    return cachedValue ? JSON.parse(cachedValue) : undefined;
  });
  useEffect(() => {
    if (connectionParams) {
      window.localStorage.setItem(CACHE_KEY, JSON.stringify(connectionParams));
    }
  }, [connectionParams]);
  const client = useMemo(
    () =>
      connectionParams
        ? new ApolloClient({ ...connectionParams, cache: new InMemoryCache() })
        : null,
    [connectionParams],
  );

  const schemaState = useSchema(connectionParams);
  const [schema, setSchema] = useState<GraphQLSchema>();
  const [state, setState] = useState<'error' | 'loading' | 'resolved'>(
    'loading',
  );
  const handleSubmitConnection = useCallback(
    (params: any) => {
      setState('loading');
      setConnectionParams(params);
    },
    [setState, setConnectionParams],
  );
  useEffect(() => {
    if (schemaState.status === 'resolved') {
      setSchema(schemaState.schema);
      setState('resolved');
    }
    if (schemaState.status === 'error') {
      setState('error');
    }
  }, [schemaState, setSchema]);

  const explorerConfig = useMemo(() => {
    if (!schema || !client) return undefined;
    return new ExplorerConfiguration(schema, client);
  }, [client, schema]);

  if (!connectionParams) {
    return (
      <ConnectionParamsPage
        connectionParams={connectionParams}
        onChange={handleSubmitConnection}
      />
    );
  }

  if (state === 'loading' || !explorerConfig) {
    return (
      <div style={{ margin: '100px auto', width: 500 }}>
        <Spinner animation="border" />
        <h3>Loading Schema</h3>
      </div>
    );
  }
  if (state === 'error') {
    return (
      <div style={{ margin: '100px auto', width: 500 }}>
        <h3>There was an error loading the schema</h3>
        <Button onClick={() => setConnectionParams(undefined)}>
          Edit connection parameters
        </Button>
      </div>
    );
  }

  return (
    <>
      <Navbar bg="dark" variant="dark">
        <Navbar.Brand>GraphQL Explorer</Navbar.Brand>
        <Nav className="mr-auto">
          <Nav.Link onClick={() => setConnectionParams(undefined)}>
            Change schema
          </Nav.Link>
        </Nav>
      </Navbar>
      <div
        style={{
          position: 'fixed',
          width: '100%',
          top: '5rem',
          bottom: '1rem',
        }}
      >
        <Explorer config={explorerConfig} />
      </div>
    </>
  );
}

export default App;
