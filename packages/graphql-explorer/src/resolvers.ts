import {
  GraphQLInputType,
  GraphQLNamedType,
  GraphQLObjectType,
} from 'graphql';

import config from './config';
import FieldQueryBuilder from './FieldQueryBuilder';
import { unwrapNull } from './helpers';
import QueryBuilder from './QueryBuilder';

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
): FieldQueryBuilder {
  const { fragmentType } = container;
  let newContainer = container;

  const newRootQuery = selectQueryForType(fragmentType, object);
  if (newRootQuery) {
    newContainer = {
      getQuery: fragment => newRootQuery.getQuery(fragment),
      getResult: data => newRootQuery.getResult(data),
      fragmentType,
      title: newRootQuery.title,
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

export function selectPanelForQueryBuilder(queryBuilder: FieldQueryBuilder) {
  return config.panels.get(queryBuilder.constructor as any);
}

export function selectInputField(type: GraphQLInputType) {
  for (const { check, Component, getSchema } of config.inputFields) {
    if (check(type)) return { Component, getSchema };
  }
  return null;
}