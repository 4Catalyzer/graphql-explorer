import { GraphQLObjectType, GraphQLType } from 'graphql';
import { useCallback, useEffect, useRef, useState } from 'react';
import { QueryHookOptions } from '@apollo/react-hooks';

import FieldQueryBuilder from '../FieldQueryBuilder';
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
  return connection.edges.map(e => e.node);
}

function mergeConnections<T>(
  prev: Connection<T>,
  next: Connection<T>,
): Connection<T> {
  return {
    edges: [...getNodes(prev), ...getNodes(next)].map(node => ({ node })),
    pageInfo: next.pageInfo,
  };
}

function usePrevious<T>(value: T) {
  const ref = useRef<T>();
  useEffect(() => {
    ref.current = value;
  });

  return ref.current;
}

export default class ConnectionQueryBuilder extends FieldQueryBuilder {
  paginationArgs = new Set(['first', 'after', 'last', 'before']);

  get nodeType() {
    return getConnectionNodeType(this.fieldType as GraphQLObjectType);
  }

  get fragmentType() {
    return this.nodeType;
  }

  getQuery(fragment: string, variables?: Record<string, any>) {
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
    return super.getQuery(connectionFragment, variables);
  }

  get args() {
    return this.field.args.filter(f => !this.paginationArgs.has(f.name));
  }

  getRealResult(connection: Connection) {
    return getNodes(connection);
  }

  useQuery(
    fragment: string,
    { variables, ...options }: QueryHookOptions<Connection> = {},
  ) {
    const [data, setData] = useState<Connection | null>(null);
    const oldVariables = usePrevious(variables);
    const forceUpdate = useState()[1];
    const endCursorRef = useRef<string | null>(null);

    if (variables !== oldVariables) {
      endCursorRef.current = null;
    }

    const { data: _, ...result } = super.useQuery(fragment, {
      variables: {
        ...variables,
        first: 15,
        after: endCursorRef.current,
      },
      onCompleted: nextData => {
        if (endCursorRef.current) {
          // assumes that nextData is set /shrug
          setData(mergeConnections(data!, nextData!));
        } else {
          setData(nextData);
        }
      },
      ...options,
    });

    const fetchMore = useCallback(() => {
      endCursorRef.current = data!.pageInfo.endCursor;
      forceUpdate(undefined);
    }, [data, forceUpdate]);

    return {
      hasNextPage: data && data.pageInfo.hasNextPage,
      fetchMore,
      data: data && this.getRealResult(data),
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
