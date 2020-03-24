import ApolloClient from 'apollo-boost';
import config from 'graphql-explorer/lib/config';
import { addCommonFields } from 'graphql-explorer/lib/inputFields';
import addRelayTypes from 'graphql-explorer/lib/relay';
import { deserializeQueryBuilder } from 'graphql-explorer/lib/serialization';
import FieldPanel from 'graphql-explorer/lib/ui/FieldPanel';
import Panels from 'graphql-explorer/lib/ui/Panels';
import RootQueryPanel from 'graphql-explorer/lib/ui/RootQueryPanel';
import qs from 'query-string';
import React, { ComponentProps, useEffect, useMemo, useState } from 'react';
import Navbar from 'react-bootstrap/Navbar';

import ConnectionParamsPanel, {
  ConnectionParams,
} from './ConnectionParamsPanel';
import useSchema from './useSchema';

type Location = 'ROOT_QUERY' | { query: string };

type PanelProps = ComponentProps<typeof RootQueryPanel>;

function App() {
  const [connectionParams, setConnectionParams] = useState<ConnectionParams>({
    uri: 'https://api.graph.cool/simple/v1/swapi',
  });

  const client = useMemo(
    () => (connectionParams ? new ApolloClient(connectionParams) : null),
    [connectionParams],
  );

  const schemaState = useSchema(connectionParams);
  const [configured, setConfigured] = useState(false);
  useEffect(() => {
    if (schemaState.status === 'resolved') {
      const { schema } = schemaState;
      config.setSchema(schema);
      addCommonFields();
      addRelayTypes();

      setConfigured(true);
    }
  }, [schemaState]);

  const location: Location = useMemo(() => {
    const queryString = qs.parse(window.location.search);
    if (typeof queryString.query === 'string')
      return { query: queryString.query };

    return 'ROOT_QUERY';
  }, []);

  const rootPanel = useMemo(() => {
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
  }, [location]);

  if (!connectionParams) {
    return (
      <ConnectionParamsPanel
        connectionParams={connectionParams}
        onChange={setConnectionParams}
      />
    );
  }

  if (!configured) {
    return <div>LOADING SCHEMA</div>;
  }

  return (
    <>
      <Navbar bg="dark" variant="dark">
        <Navbar.Brand>GraphQL Explorer</Navbar.Brand>
      </Navbar>
      <div
        style={{
          position: 'fixed',
          width: '100%',
          top: '5rem',
          bottom: '1rem',
        }}
      >
        <Panels RootPanel={rootPanel} client={client!} />
      </div>
    </>
  );
}

export default App;
