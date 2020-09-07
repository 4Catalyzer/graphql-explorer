import { QueryHookOptions } from '@apollo/react-hooks';
import { GraphQLObjectType, GraphQLType } from 'graphql';
import mapKeys from 'lodash/mapKeys';
import startCase from 'lodash/startCase';

import FieldQueryBuilder from '../FieldQueryBuilder';
import { QueryPayload } from '../QueryBuilder';
import RootQueryBuilder from '../RootQueryBuilder';
import config from '../config';
import Serializeable from '../serialization';
import { isNode } from './helpers';

export default class NodeQueryBuilder
  extends FieldQueryBuilder
  implements Serializeable {
  public id: string;

  constructor(public nodeTypeName: string, public item: any) {
    super(new RootQueryBuilder(), 'node');
    if (!item.id) {
      throw new Error('must pass a valid item');
    }
    this.id = item.id;
    this.variables = mapKeys({ id: this.id }, (_v, k) => this.variableMap[k]);
  }

  get nodeType() {
    return config.schema.getType(this.nodeTypeName) as GraphQLObjectType;
  }

  get fragmentType() {
    return this.nodeType;
  }

  get args() {
    return [];
  }

  getQuery(fragment: string, fragmentVarDefs: string[] = []) {
    const nodeFragment = `
      ... on ${this.fragmentType.name} {
        ${fragment}
      }
  `;
    return super.getQuery(nodeFragment, fragmentVarDefs);
  }

  useQuery(options?: QueryHookOptions): QueryPayload {
    const { execute, ...payload } = super.useQuery(options);
    return {
      ...payload,
      execute: () => execute({ id: this.id }),
    };
  }

  get title() {
    return `${startCase(this.fragmentType.name)}`;
  }

  serialize() {
    return { id: this.id };
  }

  static check(type: GraphQLType) {
    return type instanceof GraphQLObjectType && isNode(type);
  }
}
