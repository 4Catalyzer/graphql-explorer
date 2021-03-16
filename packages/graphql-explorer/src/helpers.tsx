import * as g from 'graphql';

export function isNode(type: g.GraphQLObjectType) {
  return !!type.getInterfaces().find((i) => i.name === 'Node');
}
