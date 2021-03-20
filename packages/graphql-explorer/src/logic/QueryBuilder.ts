import * as g from 'graphql';
import isArray from 'lodash/isArray';
import isPlainObject from 'lodash/isPlainObject';

import { EnumValue } from '../forms/schema';
import { isNode } from '../helpers';
import { ConfigurationInterface } from './Configuration';

export default class QueryBuilder {
  constructor(protected config: ConfigurationInterface) {}

  /**
   * returns a fragment for a type, if possible, otherwise null
   */
  getFragment(type: g.GraphQLNullableType) {
    const getObjectFragment = this.config.resolveType(type)?.getObjectFragment;
    if (getObjectFragment) return getObjectFragment(type);

    if (this.isScalarType(type)) {
      return '';
    }
    if (g.isObjectType(type)) {
      return `{
        ${this.getObjectTypeFragment(type, this.getSimpleScalarFields(type))}
      }`;
    }
    if (g.isListType(type)) {
      const itemType = g.getNullableType(type.ofType);
      if (this.isScalarType(itemType)) {
        return '';
      }
      if (g.isObjectType(itemType)) {
        return `{
          ${this.getObjectTypeFragment(
            itemType,
            this.getListableScalarFields(itemType),
          )}
        }`;
      }
    }
    return undefined;
  }

  /**
   * like getFragment, but it returns also child fragments for object fields
   */
  getNestedFragment(type: g.GraphQLObjectType) {
    const objectFragments = Object.values(type.getFields())
      .map((field) => {
        if (field.args.length !== 0) return '';
        const fragment = this.getFragment(g.getNullableType(field.type));
        if (!fragment) return '';
        return `${field.name} ${fragment}`;
      })
      .filter(Boolean);
    return `{
      ${this.getObjectTypeFragment(type, objectFragments)}
    }`;
  }

  /**
   * return all scalar fields that have no arguments
   */
  getSimpleScalarFields(type: g.GraphQLObjectType) {
    return Object.values(type.getFields())
      .filter((f) => {
        const fieldType = g.getNamedType(f.type);
        return this.isScalarType(fieldType) && f.args.length === 0;
      })
      .map((f) => f.name);
  }

  DEFAULT_LIST_FIELDS = new Set(['title', 'name', 'id']);

  filterListFields(field: string) {
    return this.DEFAULT_LIST_FIELDS.has(field) || field.endsWith('Id');
  }

  /**
   * given a type, returns only a set of common fields (name, title, id). This
   * is useful when having to display many objects, like in a table
   * @param max the maximum number of fields in the fragment
   */
  getListableScalarFields(
    type: g.GraphQLObjectType,
    filterFields = this.filterListFields.bind(this),
    max = 4,
  ) {
    const getListFragments = this.config.resolveType(type)?.getListFragments;
    if (getListFragments) return getListFragments(type);

    const simpleScalarFields = this.getSimpleScalarFields(type)
      .filter(filterFields)
      .slice(0, max);

    if (isNode(type)) {
      return simpleScalarFields;
    }
    const simpleNodeFields = Object.values(type.getFields())
      .map((field) => ({ field, fType: field.type as g.GraphQLObjectType }))
      .filter(({ fType }) => g.isObjectType(fType) && isNode(fType))
      .filter(({ field }) => field.args.length === 0)
      .map(({ fType, field }) => {
        const subFragment = this.getObjectTypeFragment(
          fType,
          ['id', 'name', 'title'].filter((f) => f in fType.getFields()),
        );
        return `${field.name} { ${subFragment} }`;
      });
    // let's go a little deeper otherwise
    return [...simpleScalarFields, ...simpleNodeFields];
  }

  /**
   * given a type, returns a GraphQL fragment string with the defined fields
   */
  getObjectTypeFragment(type: g.GraphQLObjectType, fragments: string[]) {
    const fragmentFields = fragments.join('\n');

    return `... on ${type.name} {
      __typename
      ${fragmentFields}
    }`;
  }

  serializeInputValue(input: any): string {
    if (
      typeof input === 'string' ||
      typeof input === 'number' ||
      typeof input === 'boolean' ||
      input === null
    ) {
      return JSON.stringify(input);
    }
    if (isArray(input)) {
      const arrayItems = input
        .map((i) => this.serializeInputValue(i))
        .join(', ');
      return `[${arrayItems}]`;
    }
    if (isPlainObject(input)) {
      const objectItems = Object.entries(input)
        .filter(([, v]) => v !== undefined)
        .map(([k, v]) => `${k}: ${this.serializeInputValue(v)}`)
        .join(', ');
      return `{${objectItems}}`;
    }
    if (input instanceof EnumValue) {
      return input.toString();
    }

    throw new Error(`invalid type for input: ${input}`);
  }

  serializeArgs(args: Obj) {
    const serializedArgs = Object.entries(args)
      .filter(([, v]) => v !== undefined)
      .map(([k, v]) => `${k}: ${this.serializeInputValue(v)}`)
      .join(', ');

    return serializedArgs && `(${serializedArgs})`;
  }

  isScalarType(type: g.GraphQLNullableType) {
    return g.isScalarType(type) || g.isEnumType(type);
  }
}