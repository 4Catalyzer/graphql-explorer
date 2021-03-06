// False positive; this class is not a component.
/* eslint-disable react-hooks/rules-of-hooks */

import { gql } from '@apollo/client';
import { useMutation } from '@apollo/react-hooks';
// eslint-disable-next-line max-classes-per-file
import * as g from 'graphql';
import startCase from 'lodash/startCase';
import { useMemo } from 'react';

import QueryBuilder, {
  QueryOptions,
  QueryPayload,
  ResolveableQueryBuilder,
} from './QueryBuilder';
import config from './config';
import { getScalarFragmentForType, unwrapNull } from './helpers';

export default class MutationQueryBuilder implements ResolveableQueryBuilder {
  container: QueryBuilder<g.GraphQLObjectType>;

  queryable = true as const;

  defaultArgValue: Record<string, any>;

  constructor(public fieldName: string, data: any) {
    this.container = {
      fragmentType: config.schema.getMutationType()!,
      getQuery: (fragment) => fragment,
      getResult: (d) => d,
      title: 'Mutation',
      variables: {},
    };

    if (this.field.args.length === 1) {
      this.defaultArgValue = {
        [this.field.args[0].name]: data,
      };
    } else {
      this.defaultArgValue = data;
    }
  }

  variables = {};

  get parentType() {
    return this.container.fragmentType;
  }

  get field() {
    return this.parentType.getFields()[this.fieldName];
  }

  get fieldType() {
    // we know all mutations return an object
    return unwrapNull(this.field.type) as g.GraphQLObjectType<unknown>;
  }

  get fragmentType() {
    return this.fieldType;
  }

  get args() {
    return this.field.args;
  }

  get title() {
    return startCase(this.field.name);
  }

  getVariablesString(variables?: Record<string, any>) {
    // XXX: REVISIT
    if (!variables || Object.keys(variables).length === 0) return '';

    const variablesString = Object.entries(variables)
      .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
      .join(', ');

    return `(${variablesString})`;
  }

  getSubFields() {
    // adding id for apollo cache compliance
    const subfields = Object.values(this.fieldType.getFields())
      .filter((f) => f.args.length === 0 && !f.name.endsWith('Edge'))
      .map((f) => {
        const type = unwrapNull(f.type);
        if (type instanceof g.GraphQLObjectType)
          return `
            ${f.name} {
              __typename
              ${getScalarFragmentForType(type)}
            }
          `;
        return f.name;
      })
      .join('\n');

    return `{
      __typename
      ${subfields}
    }`;
  }

  getQuery() {
    const subFields = this.getSubFields();
    const inputDefs = this.field.args
      .map((i) => `$${i.name}: ${i.type}`)
      .join(', ');
    const inputs = this.field.args
      .map((i) => `${i.name}: $${i.name}`)
      .join(', ');

    const fullFragment = `mutation(${inputDefs}) {
        mutation: ${this.field.name}(${inputs}) ${subFields}
      }`;
    return this.container.getQuery(fullFragment);
  }

  useQuery({ onCompleted, ...options }: QueryOptions = {}): QueryPayload {
    const queryString = useMemo(() => this.getQuery(), []);
    const query = useMemo(() => gql(queryString), [queryString]);

    const [mutate, { data, ...result }] = useMutation(query, {
      ...options,
      fetchPolicy: 'no-cache',
      onCompleted: onCompleted && ((d) => onCompleted(this.getResult(d))),
    });

    return {
      ...result,
      data: data && this.getResult(data),
      execute: (variables) => mutate({ variables }),
    };
  }

  getResult(data: unknown) {
    const parentData = this.container.getResult(data);
    return parentData.mutation;
  }

  getScalarFragment() {
    return getScalarFragmentForType(this.fragmentType);
  }
}
