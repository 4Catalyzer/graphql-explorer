import { GraphQLSchema } from 'graphql';
import { FetchSchemaIntrospector } from 'graphql-explorer/lib/introspection';
import { useEffect, useState } from 'react';

import { ConnectionParams } from './ConnectionParamsPage';

type State =
  | { status: 'error'; message: string }
  | { status: 'loading' }
  | { status: 'resolved'; schema: GraphQLSchema };

export default function useSchema(params?: ConnectionParams) {
  const [state, setState] = useState<State>({ status: 'loading' });

  useEffect(() => {
    async function getSchema() {
      if (!params) return;
      const { headers, uri } = params;
      try {
        setState({ status: 'loading' });
        const introspector = new FetchSchemaIntrospector((query) => ({
          url: uri,
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...headers },
          body: JSON.stringify({ query }),
        }));
        const schema = await introspector.introspect();
        setState({ status: 'resolved', schema });
      } catch (error) {
        setState({ status: 'error', message: error.message });
      }
    }
    getSchema();
  }, [params]);

  return state;
}
