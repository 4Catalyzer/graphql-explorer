/* eslint-disable no-console */
import { ApolloClient, gql } from '@apollo/client';
import * as g from 'graphql';
import camelCase from 'lodash/camelCase';

import SchemaBuilder from '../forms/schema';
import { isNode } from '../helpers';
import connectionResolver from '../resolvers/connectionResolver';
import jsonInputResolver from '../resolvers/jsonInputResolver';
import listResolver from '../resolvers/listResolver';
import objectResolver from '../resolvers/objectResolver';
import scalarResolver from '../resolvers/scalarResolver';
import QueryBuilder from './QueryBuilder';
import { FieldResolver, InputFieldResolver, TypeResolver } from './resolvers';

type QueryFunc = (
  fragment: string,
  item: Obj<any>,
  type: g.GraphQLNamedType,
) => Promise<any>;

type MutationDefinition = {
  mutation: g.GraphQLField<any, any>;
  defaultValue: Obj<any> | undefined;
};

export interface ConfigurationInterface {
  schema: g.GraphQLSchema;

  resolveType: (
    type: g.GraphQLNullableType,
  ) => TypeResolver<g.GraphQLNullableType> | undefined;

  resolveInputField: (
    type: g.GraphQLInputType,
    field: g.GraphQLArgument | g.GraphQLInputField,
  ) => InputFieldResolver | undefined;

  resolveField: (
    type: g.GraphQLObjectType,
    field: g.GraphQLField<any, any>,
  ) => FieldResolver | undefined;

  getMutationsForType: (
    type: g.GraphQLNullableType,
    item: Obj,
  ) => MutationDefinition[];

  queryBuilder: QueryBuilder;
  schemaBuilder: SchemaBuilder;

  resolveQuery: (type: g.GraphQLNullableType) => QueryFunc | undefined;

  rootQuery: (fragment: string) => Promise<any>;
  nodeQuery: QueryFunc;
  mutate: (fragment: string, variables: Obj) => Promise<any>;
}

export default class Configuration implements ConfigurationInterface {
  queryBuilder: QueryBuilder;

  schemaBuilder: SchemaBuilder;

  typeResolvers: TypeResolver<any>[] = [
    listResolver(this),
    connectionResolver(this),
    objectResolver(this),
    scalarResolver(this),
  ];

  inputFieldResolvers: InputFieldResolver[] = [jsonInputResolver(this)];

  fieldResolvers: FieldResolver[] = [];

  constructor(
    public schema: g.GraphQLSchema,
    protected client: ApolloClient<unknown>,
  ) {
    this.queryBuilder = new QueryBuilder(this);
    this.schemaBuilder = new SchemaBuilder(this);
  }

  resolveType(type: g.GraphQLNullableType) {
    return this.typeResolvers.find((r) => r.check(type));
  }

  resolveInputField(
    type: g.GraphQLInputType,
    field: g.GraphQLArgument | g.GraphQLInputField,
  ) {
    return this.inputFieldResolvers.find((r) => r.check(type, field));
  }

  resolveField(type: g.GraphQLObjectType, field: g.GraphQLField<any, any>) {
    return this.fieldResolvers.find((r) => r.check(type, field));
  }

  resolveQuery(type: g.GraphQLNamedType) {
    if (type.name === this.schema.getQueryType()!.name) {
      return this.rootQuery.bind(this);
    }
    if (g.isObjectType(type) && isNode(type)) {
      return this.nodeQuery.bind(this);
    }

    return undefined;
  }

  serializeError(error: any) {
    return new Error(JSON.stringify(error, undefined, 2));
  }

  async rootQuery(fragment: string) {
    console.log('executing', fragment);
    try {
      const response = await this.client.query({
        query: gql(fragment),
        fetchPolicy: 'no-cache',
      });
      return response.data;
    } catch (err) {
      console.warn(err);
      throw this.serializeError(err);
    }
  }

  async nodeQuery(fragment: string, item: Obj<any>, type: g.GraphQLNamedType) {
    const args = this.schema.getQueryType()!.getFields().node.args!;
    const input = { id: item.id };
    const nodeArgs = this.queryBuilder.serializeArgsInline(input, args);
    const data = await this.rootQuery(`{
      node ${nodeArgs} {
        ... on ${type.name} ${fragment}
      }
    }`);
    return data.node;
  }

  async mutate(fragment: string, variables: Obj) {
    console.log('executing', fragment);
    try {
      const response = await this.client.mutate({
        mutation: gql(fragment),
        fetchPolicy: 'no-cache',
        variables,
      });
      return response.data;
    } catch (err) {
      console.warn(err);
      throw this.serializeError(err);
    }
  }

  getMutationsForNode(type: g.GraphQLObjectType, item: Obj) {
    const idArgName = `${camelCase(type.name)}Id`;
    const mutationType = this.schema.getMutationType();
    const mutations = Object.values(mutationType?.getFields() || {});

    return mutations
      .map((mutation) => {
        let fields: g.GraphQLInputField[] = mutation.args;
        let parentField: string | undefined;

        if (fields.length === 1) {
          parentField = fields[0].name;
          const onlyField = g.getNullableType(fields[0].type);
          if (g.isInputObjectType(onlyField)) {
            fields = Object.values(onlyField.getFields());
          }
        }

        const idField = fields.find(
          (f) =>
            g.isScalarType(g.getNullableType(f.type)) && f.name === idArgName,
        );
        let defaultValue: Obj | undefined;
        if (idField) {
          defaultValue = { ...item, [idArgName]: item.id };
          if (parentField) {
            defaultValue = { [parentField]: defaultValue };
          }
        }

        return { mutation, defaultValue };
      })
      .filter(({ defaultValue }) => !!defaultValue);
  }

  getMutationsForType(type: g.GraphQLObjectType, item: Obj) {
    const resolver = this.resolveType(type);
    if (resolver?.getMutations) {
      return resolver.getMutations(type, item);
    }

    const mutationType = this.schema.getMutationType();
    const mutations = Object.values(mutationType?.getFields() || {});

    if (this.schema.getQueryType()?.name === type.name) {
      return mutations.map((mutation) => ({
        mutation,
        defaultValue: undefined,
      }));
    }

    if (isNode(type)) {
      return this.getMutationsForNode(type, item);
    }

    return [];
  }
}
