import * as g from 'graphql';

export function unwrapNull(type: g.GraphQLType): g.GraphQLNullableType {
  return type instanceof g.GraphQLNonNull ? type.ofType : type;
}

/**
 * return all scalar fields that have no arguments
 */
export function getSimpleScalarFields(type: g.GraphQLObjectType) {
  return Object.values(type.getFields()).filter(
    f =>
      (unwrapNull(f.type) instanceof g.GraphQLScalarType ||
        unwrapNull(f.type) instanceof g.GraphQLEnumType) &&
      f.args.length === 0,
  );
}

/**
 * given a type, returns a GraphQL fragment string with all "simple" scalars
 */
export function getScalarFragmentForType(type: g.GraphQLObjectType) {
  const fields = getSimpleScalarFields(type);
  const fragmentFields = fields.map(f => f.name).join('\n');

  return `... on ${type.name} {
    __typename
    ${fragmentFields}
  }`;
}

const COMMON_FIELDS = new Set(['title', 'name', 'id']);

/**
 * given a type, returns only a set of common fields (name, title, id). This
 * is useful when having to display many objects, like in a table
 * @param max the maximum number of fields in the fragment
 */
export function getCommonScalarFragmentForType(
  type: g.GraphQLObjectType,
  max = 4,
) {
  if (!(type instanceof g.GraphQLObjectType)) return '';

  const fields = getSimpleScalarFields(type);
  const fragmentFields = fields
    .filter(f => COMMON_FIELDS.has(f.name) || f.name.endsWith('Id'))
    .map(f => f.name)
    .slice(0, max)
    .join('\n');

  return `... on ${type.name} {
    __typename
    ${fragmentFields}
  }`;
}
