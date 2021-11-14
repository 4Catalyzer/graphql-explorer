import * as g from 'graphql';
import { FetchSchemaIntrospector } from 'graphql-explorer/lib/introspection';
import { useEffect, useState } from 'react';

import { ConnectionParams } from './ConnectionParamsPage';

type State =
  | { status: 'error'; message: string }
  | { status: 'loading' }
  | { status: 'resolved'; schema: g.GraphQLSchema };

// an example of how it's possible to clean the schema before passing it to
// graphql explorer
function cleanSchema(schema: g.GraphQLSchema) {
  const mutationFields = schema.getMutationType()?.getFields() || {};
  Object.entries(mutationFields).forEach(([mutationName, mutation]) => {
    if (mutationName.toLowerCase().endsWith('orerror')) {
      delete mutationFields[mutationName];
    }
    // eslint-disable-next-line no-param-reassign
    mutation.args = mutation.args.filter((a) => a.name !== 'clientMutationId');
  });

  Object.values(schema.getTypeMap()).forEach((type) => {
    if (g.isInputObjectType(type) || g.isObjectType(type)) {
      const argFields = type.getFields();
      delete argFields.clientMutationId;
    }
  });
}

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
        cleanSchema(schema);
        setState({ status: 'resolved', schema });
      } catch (error: any) {
        setState({ status: 'error', message: error.message });
      }
    }
    getSchema();
  }, [params]);

  return state;
}
