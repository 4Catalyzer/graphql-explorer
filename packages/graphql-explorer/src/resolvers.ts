import {
  GraphQLArgument,
  GraphQLField,
  GraphQLInputField,
  GraphQLInputType,
  GraphQLNamedType,
  GraphQLObjectType,
} from 'graphql';

import FieldQueryBuilder from './FieldQueryBuilder';
import QueryBuilder, { ResolveableQueryBuilder } from './QueryBuilder';
import config from './config';
import { unwrapNull } from './helpers';

export function selectQueryForType(type: GraphQLNamedType, item: any) {
  for (const Class of config.rootQueryBuilders) {
    if (Class.check(type)) {
      return new Class(type.name, item);
    }
  }

  return null;
}

export function selectQueryForField(
  container: QueryBuilder<GraphQLObjectType>,
  fieldName: string,
  object: any,
): ResolveableQueryBuilder {
  const { fragmentType } = container;
  let newContainer = container;

  const newRootQuery = selectQueryForType(fragmentType, object);
  if (newRootQuery) {
    newContainer = {
      getQuery: (...args) => newRootQuery.getQuery(...args),
      getResult: (data) => newRootQuery.getResult(data),
      fragmentType,
      title: newRootQuery.title,
      variables: newRootQuery.variables,
    };
  }

  const field = fragmentType.getFields()[fieldName];
  const fieldType = unwrapNull(field.type);

  for (const Class of config.fieldQueryBuilders) {
    if (Class.check(fieldType)) {
      return new Class(newContainer, fieldName);
    }
  }

  return new FieldQueryBuilder(newContainer, fieldName);
}

export function selectPanelForQueryBuilder(
  queryBuilder: ResolveableQueryBuilder,
) {
  return config.panels.get(queryBuilder.constructor as any);
}

export function selectInputField(
  type: GraphQLInputType,
  field: GraphQLArgument | GraphQLInputField,
) {
  for (const { check, Component, getSchema } of config.inputFields) {
    if (check(type, field)) return { Component, getSchema };
  }
  return null;
}

export function selectFieldRenderer(field: GraphQLField<any, any>) {
  for (const { check, Component } of config.fieldRenderers) {
    if (check(field)) return Component;
  }
  return null;
}
