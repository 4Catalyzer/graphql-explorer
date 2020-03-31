import { HttpLink } from 'apollo-link-http';
import { GraphQLSchema } from 'graphql';
import { introspectSchema } from 'graphql-tools';
import { useEffect, useState } from 'react';

type State =
  | { status: 'error'; message: string }
  | { status: 'loading' }
  | { status: 'resolved'; schema: GraphQLSchema };

export default function useSchema(
  options: ConstructorParameters<typeof HttpLink>[0],
) {
  const [state, setState] = useState<State>({ status: 'loading' });

  useEffect(() => {
    async function getSchema() {
      const link = new HttpLink(options);
      try {
        setState({ status: 'loading' });
        const schema = await introspectSchema(link);
        setState({ status: 'resolved', schema });
      } catch (error) {
        setState({ status: 'error', message: error.message });
      }
    }
    getSchema();
  }, [options]);

  return state;
}
