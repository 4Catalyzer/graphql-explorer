import { QueryHookOptions } from '@apollo/react-hooks';
import * as g from 'graphql';
import startCase from 'lodash/startCase';

import { QueryPayload, ResolveableQueryBuilder } from './QueryBuilder';
import { unwrapNull } from './helpers';

export default class ObjectQueryBuilder implements ResolveableQueryBuilder {
  fragmentType: g.GraphQLObjectType;

  queryable = false;

  args: g.GraphQLArgument[] = [];

  constructor(fieldType: g.GraphQLType, private data: Record<string, any>) {
    const unwrappedFieldType = unwrapNull(fieldType) as g.GraphQLObjectType;
    this.fragmentType = unwrappedFieldType;
  }

  variables = {};

  get title() {
    return `${startCase(this.fragmentType.name)}`;
  }

  useQuery(_options?: QueryHookOptions): QueryPayload {
    return {
      data: this.data,
      loading: false,
      called: true,
      execute: () => null,
    };
  }

  getQuery(_fragment: string): string {
    throw new Error('Method not implemented.');
  }

  getResult(data: any) {
    return data;
  }
}
