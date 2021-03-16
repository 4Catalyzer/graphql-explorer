/**
 * This resolvers follows the relay connection specification:
 * https://relay.dev/graphql/connections.htm
 */

import * as g from 'graphql';
import React from 'react';

import ConnectionSection from '../ConnectionSection';
import { isNode } from '../helpers';
import { ConfigurationInterface } from '../logic/Configuration';
import { TypeResolver } from '../logic/resolvers';

const CONNECTION_ARGS = new Set(['first', 'after', 'last', 'before']);

function isEdge(type: g.GraphQLType, nodeType?: g.GraphQLType) {
  // eslint-disable-next-line no-param-reassign
  type = g.getNullableType(type);
  if (!(type instanceof g.GraphQLObjectType)) return false;
  const { node, cursor } = type.getFields();

  const realNodeType = g.getNullableType(node.type);

  return (
    node &&
    cursor &&
    // cursor must be a string
    g.getNullableType(cursor.type) === g.GraphQLString &&
    // node type must be a node type
    realNodeType instanceof g.GraphQLObjectType &&
    isNode(realNodeType) &&
    // node type must be the expected node type, if set
    (!nodeType || g.getNullableType(node.type) === nodeType)
  );
}

/**
 * checks whether the specified object is a connection
 */
function isConnection(type: g.GraphQLType): type is g.GraphQLObjectType {
  if (!(type instanceof g.GraphQLObjectType)) return false;

  const { pageInfo, edges } = type.getFields();

  if (!pageInfo || !edges) return false;

  const pageInfoType = g.getNullableType(pageInfo.type);
  const edgesType = g.getNullableType(edges.type);

  if (!(edgesType instanceof g.GraphQLList)) return false;

  const edgeType = g.getNullableType(edgesType.ofType);

  return (
    pageInfoType instanceof g.GraphQLObjectType &&
    pageInfoType.name === 'PageInfo' &&
    isEdge(edgeType)
  );
}

function getConnectionNodeType(type: g.GraphQLObjectType) {
  const fields = type.getFields();
  const edgesType = g.getNullableType(fields.edges.type) as g.GraphQLList<any>;
  const edgeType = edgesType.ofType as g.GraphQLObjectType;
  const nodeType = edgeType.getFields().node.type;
  return g.getNullableType(nodeType) as g.GraphQLObjectType;
}

const connectionResolver: (
  config: ConfigurationInterface,
) => TypeResolver<g.GraphQLObjectType> = (config) => ({
  check: isConnection,
  Section: (props) => (
    <ConnectionSection
      {...props}
      itemType={getConnectionNodeType(props.type)}
    />
  ),
  getObjectFragment: (type: g.GraphQLObjectType) => {
    const nodeType = getConnectionNodeType(type);
    const nodeFragment = config.queryBuilder.getObjectTypeFragment(
      nodeType,
      config.queryBuilder.getListableScalarFields(nodeType),
    );
    return `{
        edges {
          node {
            ${nodeFragment}
          }
        }
        pageInfo {
          endCursor
          hasNextPage
        }
      }`;
  },
  getDefaultArgs: () => ({ first: 10 }),
  getFormArgs: (args) => args.filter((arg) => !CONNECTION_ARGS.has(arg.name)),
});

export default connectionResolver;
