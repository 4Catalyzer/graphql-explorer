// False positive; this class is not a component.
/* eslint-disable react-hooks/rules-of-hooks */

import { QueryHookOptions, useQuery } from '@apollo/react-hooks';
import { gql } from 'apollo-boost';
// eslint-disable-next-line max-classes-per-file
import * as g from 'graphql';
import startCase from 'lodash/startCase';
import { useMemo } from 'react';

import QueryBuilder from './QueryBuilder';
import {
  getCommonScalarFragmentForType,
  getScalarFragmentForType,
  unwrapNull,
} from './helpers';

type FragmentFieldType =
  | g.GraphQLObjectType
  | g.GraphQLScalarType
  | g.GraphQLEnumType;

export default class FieldQueryBuilder
  implements QueryBuilder<FragmentFieldType> {
  constructor(
    public container: QueryBuilder<g.GraphQLObjectType>,
    public fieldName: string,
  ) {}

  get parentType() {
    return this.container.fragmentType;
  }

  get field() {
    return this.parentType.getFields()[this.fieldName];
  }

  get fieldType() {
    return unwrapNull(this.field.type);
  }

  get fragmentType() {
    const { fieldType } = this;

    return fieldType instanceof g.GraphQLList
      ? (unwrapNull(fieldType.ofType) as FragmentFieldType)
      : (fieldType as FragmentFieldType);
  }

  get args() {
    return this.field.args;
  }

  get title() {
    return `${startCase(this.parentType.name)} ${startCase(this.field.name)}`;
  }

  getVariablesString(variables?: {}) {
    if (!variables || Object.keys(variables).length === 0) return '';

    const variablesString = Object.entries(variables)
      .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
      .join(', ');

    return `(${variablesString})`;
  }

  getSubFields(fragment: string) {
    const { fieldType } = this;
    const type =
      fieldType instanceof g.GraphQLList
        ? unwrapNull(fieldType.ofType)
        : fieldType;

    if (
      type instanceof g.GraphQLObjectType ||
      type instanceof g.GraphQLInterfaceType
    ) {
      // adding id for apollo cache compliance
      return ` {
          __typename
          ${type.getFields().id ? 'id' : ''}
          ${fragment}
        }`;
    }

    if (
      type instanceof g.GraphQLScalarType ||
      type instanceof g.GraphQLEnumType
    ) {
      return '';
    }

    throw new Error(`not supported: ${type}`);
  }

  getQuery(fragment: string, variables?: {}) {
    const subFields = this.getSubFields(fragment);
    const variablesString = this.getVariablesString(variables);
    const fullFragment = `field: ${this.fieldName}${variablesString} ${subFields}`;
    return this.container.getQuery(fullFragment);
  }

  useQuery(
    fragment: string,
    { variables, onCompleted, ...options }: QueryHookOptions = {},
  ) {
    const queryString = useMemo(() => this.getQuery(fragment, variables), [
      fragment,
      variables,
    ]);

    const query = useMemo(() => gql(queryString), [queryString]);

    const { fetchMore: _, data, ...result } = useQuery(query, {
      ...options,
      onCompleted: onCompleted && ((d) => onCompleted(this.getResult(d))),
    });

    return {
      ...result,
      query,
      data: data && this.getResult(data),
    };
  }

  getResult(data: object) {
    const parentData = this.container.getResult(data);
    return parentData.field;
  }

  getScalarFragment() {
    if (this.fragmentType instanceof g.GraphQLObjectType) {
      if (this.fieldType instanceof g.GraphQLList) {
        return getCommonScalarFragmentForType(this.fragmentType);
      }

      return getScalarFragmentForType(this.fragmentType);
    }

    return '';
  }
}
