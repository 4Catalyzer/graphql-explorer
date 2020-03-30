// False positive; this class is not a component.
/* eslint-disable react-hooks/rules-of-hooks */

import { GraphQLObjectType, GraphQLType } from 'graphql';
import { useCallback, useState } from 'react';

import FieldQueryBuilder from '../FieldQueryBuilder';
import { QueryOptions, QueryPayload } from '../QueryBuilder';
import { getCommonScalarFragmentForType } from '../helpers';
import { getConnectionNodeType, isConnection } from './helpers';

interface Connection<T = any> {
  edges: {
    node: T;
  }[];

  pageInfo: {
    endCursor: string;
    hasNextPage: boolean;
  };
}

function getNodes<T>(connection: Connection<T>): T[] {
  return connection.edges.map((e) => e.node);
}

function mergeConnections<T>(
  prev: Connection<T>,
  next: Connection<T>,
): Connection<T> {
  return {
    edges: [...getNodes(prev), ...getNodes(next)].map((node) => ({ node })),
    pageInfo: next.pageInfo,
  };
}

export default class ConnectionQueryBuilder extends FieldQueryBuilder {
  paginationArgs = new Set(['first', 'after', 'last', 'before']);

  get nodeType() {
    return getConnectionNodeType(this.fieldType as GraphQLObjectType);
  }

  get fragmentType() {
    return this.nodeType;
  }

  getQuery(fragment: string, fragmentVarDefs: string[] = []) {
    const connectionFragment = `
      edges {
        node {
          ${fragment}
        }
      }
      pageInfo {
        endCursor
        hasNextPage
      }
    `;
    return super.getQuery(connectionFragment, fragmentVarDefs);
  }

  get args() {
    return this.field.args.filter((f) => !this.paginationArgs.has(f.name));
  }

  getRealResult(connection: Connection) {
    return getNodes(connection);
  }

  useQuery(
    options: QueryOptions = {},
  ): QueryPayload & { hasNextPage?: boolean; fetchMore?: () => void } {
    const [data, setData] = useState<Connection | null>(null);

    const { data: _, execute: executeQuery, ...result } = super.useQuery({
      onCompleted: (nextData) => {
        if (this.variables[this.variableMap.after]) {
          // assumes that nextData is set /shrug
          setData(mergeConnections(data!, nextData!));
        } else {
          setData(nextData);
        }
      },
      ...options,
    });

    const execute = useCallback(
      (variables: Record<string, any>) => {
        executeQuery({ ...variables, first: 15 });
      },
      [executeQuery],
    );

    const fetchMore = useCallback(() => {
      execute({
        ...this.variables,
        after: data!.pageInfo.endCursor,
      });
    }, [data, execute]);

    return {
      hasNextPage: data ? data.pageInfo.hasNextPage : false,
      fetchMore,
      data: data && this.getRealResult(data),
      execute,
      ...result,
    };
  }

  getScalarFragment() {
    return getCommonScalarFragmentForType(this.fragmentType);
  }

  static check(type: GraphQLType) {
    return isConnection(type);
  }
}
