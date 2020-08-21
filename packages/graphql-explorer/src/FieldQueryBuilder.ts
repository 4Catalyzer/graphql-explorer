// False positive; this class is not a component.
/* eslint-disable react-hooks/rules-of-hooks */

import { gql, useLazyQuery } from '@apollo/client';
import * as g from 'graphql';
import mapKeys from 'lodash/mapKeys';
import startCase from 'lodash/startCase';
import { useCallback, useMemo } from 'react';

import QueryBuilder, {
  QueryOptions,
  QueryPayload,
  ResolveableQueryBuilder,
  getVariableId,
} from './QueryBuilder';
import {
  getCommonScalarFragmentForType,
  getScalarFragmentForType,
  unwrapNull,
} from './helpers';

export default class FieldQueryBuilder implements ResolveableQueryBuilder {
  queryable = true;

  variableMap: Record<string, string>;

  variables: Record<string, any> = {};

  constructor(
    public container: QueryBuilder<g.GraphQLObjectType>,
    public fieldName: string,
  ) {
    this.variableMap = {};
    this.field.args.forEach((a) => {
      const varId = getVariableId();
      this.variableMap[a.name] = varId;
    });
  }

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
      ? (unwrapNull(fieldType.ofType) as g.GraphQLObjectType)
      : (fieldType as g.GraphQLObjectType);
  }

  get args() {
    return this.field.args;
  }

  get title() {
    return `${startCase(this.parentType.name)} ${startCase(this.field.name)}`;
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
      return `{
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

  getQuery(fragment: string, fragmentVarDefs: string[] = []) {
    const subFields = this.getSubFields(fragment);

    const varDefs: string[] = [...fragmentVarDefs];
    const vars: string[] = [];
    this.field.args.forEach((a) => {
      const varId = this.variableMap[a.name];
      varDefs.push(`$${varId}: ${a.type}`);
      vars.push(`${a.name}: $${varId}`);
    });
    const variablesString = vars.length === 0 ? '' : `(${vars.join(', ')})`;

    const fullFragment = `field: ${this.fieldName}${variablesString} ${subFields}`;
    return this.container.getQuery(fullFragment, varDefs);
  }

  useQuery({ onCompleted, ...options }: QueryOptions = {}): QueryPayload {
    const fragment = this.getScalarFragment();
    const queryString = useMemo(() => this.getQuery(fragment), [fragment]);
    // const [skip, setSkip] = useState(true);

    const query = useMemo(() => gql(queryString), [queryString]);

    const [load, { fetchMore: _, data, refetch, ...result }] = useLazyQuery(
      query,
      {
        ...options,
        // variables: { ...this.variables, ...this.container.variables },
        fetchPolicy: 'no-cache',
        nextFetchPolicy: 'no-cache',
        // skip,
        onCompleted:
          onCompleted &&
          ((d) => {
            if (d !== undefined) onCompleted(this.getResult(d));
          }),
      },
    );

    const execute = useCallback(
      (variables: Record<string, any>) => {
        this.variables = mapKeys(variables, (_v, k) => this.variableMap[k]);
        const allVariables = {
          ...this.variables,
          ...this.container.variables,
        };
        load({ variables: allVariables });
      },
      [load],
    );

    return {
      ...result,
      data: data && this.getResult(data),
      execute,
      refetch,
    };
  }

  getResult(data: Record<string, any>) {
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
