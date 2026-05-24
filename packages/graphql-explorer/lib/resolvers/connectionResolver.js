/**
 * This resolvers follows the relay connection specification:
 * https://relay.dev/graphql/connections.htm
 */
import * as g from 'graphql';
import React from 'react';
import ConnectionSection from '../ConnectionSection';
import { isNode } from '../helpers';
const CONNECTION_ARGS = new Set(['first', 'after', 'last', 'before']);
function isEdge(type, nodeType) {
    type = g.getNullableType(type);
    if (!(type instanceof g.GraphQLObjectType))
        return false;
    const { node, cursor } = type.getFields();
    const realNodeType = g.getNullableType(node.type);
    return (node &&
        cursor &&
        // cursor must be a string
        g.getNullableType(cursor.type) === g.GraphQLString &&
        // node type must be a node type
        realNodeType instanceof g.GraphQLObjectType &&
        isNode(realNodeType) &&
        // node type must be the expected node type, if set
        (!nodeType || g.getNullableType(node.type) === nodeType));
}
/**
 * checks whether the specified object is a connection
 */
function isConnection(type) {
    if (!(type instanceof g.GraphQLObjectType))
        return false;
    const { pageInfo, edges } = type.getFields();
    if (!pageInfo || !edges)
        return false;
    const pageInfoType = g.getNullableType(pageInfo.type);
    const edgesType = g.getNullableType(edges.type);
    if (!(edgesType instanceof g.GraphQLList))
        return false;
    const edgeType = g.getNullableType(edgesType.ofType);
    return (pageInfoType instanceof g.GraphQLObjectType &&
        pageInfoType.name === 'PageInfo' &&
        isEdge(edgeType));
}
function getConnectionNodeType(type) {
    const fields = type.getFields();
    const edgesType = g.getNullableType(fields.edges.type);
    const edgeType = edgesType.ofType;
    const nodeType = edgeType.getFields().node.type;
    return g.getNullableType(nodeType);
}
const connectionResolver = (config) => ({
    check: isConnection,
    Section: (props) => (React.createElement(ConnectionSection, { ...props, itemType: getConnectionNodeType(props.type) })),
    getObjectFragment: (type) => {
        const nodeType = getConnectionNodeType(type);
        const nodeFragment = config.queryBuilder.getObjectTypeFragment(nodeType, config.queryBuilder.getListableScalarFields(nodeType));
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
//# sourceMappingURL=connectionResolver.js.map