import { QueryHookOptions } from '@apollo/react-hooks';
import { ApolloError } from 'apollo-boost';
import * as g from 'graphql';

import Serializeable from './serialization';

let variableIncrementId = 0;
export function getVariableId() {
  return `v${variableIncrementId++}`;
}

/**
 * base interface for all query builders
 */
export default interface QueryBuilder<T extends g.GraphQLType>
  extends Partial<Serializeable> {
  getQuery(fragment: string, fragmentVarDefs?: string[]): string;
  getResult(data: any): any;
  readonly variables: Record<string, any>;
  fragmentType: T;

  title: string;
}

export type QueryOptions = Omit<QueryHookOptions, 'variables' | 'skip'>;
export type QueryPayload = {
  data: any;
  error?: ApolloError;
  loading: boolean;
  called: boolean;
  execute: (variables: any) => void;
  refetch?: () => void;
};

export interface ResolveableQueryBuilder
  extends QueryBuilder<g.GraphQLObjectType> {
  args: g.GraphQLArgument[];

  useQuery(options?: QueryOptions): QueryPayload;
  defaultArgValue?: Record<string, any>;
}
