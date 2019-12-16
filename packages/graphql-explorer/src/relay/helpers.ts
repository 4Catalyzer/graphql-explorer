import * as g from 'graphql';

import { unwrapNull } from '../helpers';

export function isNode(type: g.GraphQLObjectType) {
  return !!type.getInterfaces().find(i => i.name === 'Node');
}

/**
 * checks whether the specified object is a connection
 * @param type the type to check
 * @param nodeType if specified, checks that the connection contains node of the specified type
 */
export function isEdge(type: g.GraphQLType, nodeType?: g.GraphQLType) {
  // eslint-disable-next-line no-param-reassign
  type = unwrapNull(type);
  if (!(type instanceof g.GraphQLObjectType)) return false;
  const { node, cursor } = type.getFields();

  const realNodeType = unwrapNull(node.type);

  return (
    node &&
    cursor &&
    // cursor must be a string
    unwrapNull(cursor.type) === g.GraphQLString &&
    // node type must be a node type
    realNodeType instanceof g.GraphQLObjectType &&
    isNode(realNodeType) &&
    // node type must be the expected node type, if set
    (!nodeType || unwrapNull(node.type) === nodeType)
  );
}

export function isConnection(type: g.GraphQLType) {
  if (!(type instanceof g.GraphQLObjectType)) return false;

  const { pageInfo, edges } = type.getFields();

  if (!pageInfo || !edges) return false;

  const pageInfoType = unwrapNull(pageInfo.type);
  const edgesType = unwrapNull(edges.type);

  if (!(edgesType instanceof g.GraphQLList)) return false;

  const edgeType = unwrapNull(edgesType.ofType);

  return (
    pageInfoType instanceof g.GraphQLObjectType &&
    pageInfoType.name === 'PageInfo' &&
    isEdge(edgeType)
  );
}

export function getConnectionNodeType(type: g.GraphQLObjectType) {
  const fields = type.getFields();
  const edgesType = unwrapNull(fields.edges.type) as g.GraphQLList<any>;
  const edgeType = edgesType.ofType as g.GraphQLObjectType;
  return edgeType.getFields().node.type as g.GraphQLObjectType;
}
