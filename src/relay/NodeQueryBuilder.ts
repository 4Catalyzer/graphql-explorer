import { GraphQLObjectType, GraphQLType } from 'graphql';
import startCase from 'lodash/startCase';

import config from '../config';
import FieldQueryBuilder from '../FieldQueryBuilder';
import RootQueryBuilder from '../RootQueryBuilder';
import Serializeable from '../serialization';
import { isNode } from './helpers';

export default class NodeQueryBuilder extends FieldQueryBuilder
  implements Serializeable {
  public id: string;

  constructor(public nodeTypeName: string, public item: any) {
    super(new RootQueryBuilder(), 'node');
    if (!item.id) {
      throw new Error('must pass a valid item');
    }
    this.id = item.id;
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

  getQuery(fragment: string) {
    const nodeFragment = `
      ... on ${this.fragmentType.name} {
        ${fragment}
      }
  `;
    return super.getQuery(nodeFragment, { id: this.id });
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
