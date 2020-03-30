import ApolloClient from 'apollo-boost';
import config from 'graphql-explorer/lib/config';
import { addCommonFields } from 'graphql-explorer/lib/inputFields';
import addRelayTypes from 'graphql-explorer/lib/relay';
import { deserializeQueryBuilder } from 'graphql-explorer/lib/serialization';
import FieldPanel from 'graphql-explorer/lib/ui/FieldPanel';
import Panels from 'graphql-explorer/lib/ui/Panels';
import RootQueryPanel from 'graphql-explorer/lib/ui/RootQueryPanel';
import qs from 'query-string';
import React, {
  ComponentProps,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import Button from 'react-bootstrap/Button';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import Spinner from 'react-bootstrap/Spinner';

import ConnectionParamsPage, {
  ConnectionParams,
} from './ConnectionParamsPage';
import useSchema from './useSchema';

type Location = 'ROOT_QUERY' | { query: string };

type PanelProps = ComponentProps<typeof RootQueryPanel>;
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
    () => (connectionParams ? new ApolloClient(connectionParams) : null),
    [connectionParams],
  );

  const schemaState = useSchema(connectionParams);
  const [state, setState] = useState<'error' | 'loading' | 'resolved'>(
    'loading',
  );
  const handleSubmitConnection = useCallback(
    (params) => {
      setState('loading');
      setConnectionParams(params);
    },
    [setState, setConnectionParams],
  );
  useEffect(() => {
    if (schemaState.status === 'resolved') {
      config.setSchema(schemaState.schema);
      addCommonFields();
      addRelayTypes();
      setState('resolved');
    }
    if (schemaState.status === 'error') {
      setState('error');
    }
  }, [schemaState]);

  const location: Location = useMemo(() => {
    const { query } = qs.parse(window.location.search);
    if (typeof query === 'string') return { query };

    return 'ROOT_QUERY';
  }, []);

  const rootPanel = useMemo(() => {
    if (state !== 'resolved') return null;
    if (location === 'ROOT_QUERY')
      return ({ onPushPanel }: PanelProps) => (
        <RootQueryPanel onPushPanel={onPushPanel} />
      );

    const queryBuilder = deserializeQueryBuilder(location.query);
    return ({ onPushPanel }: PanelProps) => (
      <FieldPanel
        queryBuilder={queryBuilder}
        index={0}
        onPushPanel={onPushPanel}
      />
    );
  }, [location, state]);

  if (!connectionParams) {
    return (
      <ConnectionParamsPage
        connectionParams={connectionParams}
        onChange={handleSubmitConnection}
      />
    );
  }

  if (state === 'loading') {
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
        <Panels RootPanel={rootPanel!} client={client!} />
      </div>
    </>
  );
}

export default App;
