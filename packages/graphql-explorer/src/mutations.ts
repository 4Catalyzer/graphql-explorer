import {
  GraphQLField,
  GraphQLInputField,
  GraphQLInputObjectType,
  GraphQLObjectType,
  GraphQLScalarType,
  GraphQLString,
} from 'graphql';
import camelCase from 'lodash/camelCase';
import startCase from 'lodash/startCase';

import config from './config';
import { getScalarFragmentForType, unwrapNull } from './helpers';

export interface MutationDefinition {
  mutation: GraphQLField<any, any>;
  entityId: string | undefined;
  inputFields: GraphQLInputField[];
  title: string;
}

export function getMutationsForType(
  type: GraphQLObjectType,
): MutationDefinition[] {
  const mutations = Object.values(
    config.schema.getMutationType()!.getFields(),
  );
  // TODO make this customizable
  const idArgName = `${camelCase(type.name)}Id`;

  return mutations
    .filter(m => !m.name.endsWith('OrError'))
    .map(mutation => {
      let entityId: string | undefined;
      let inputFields: GraphQLInputField[];

      const inputArg = mutation.args.find(
        a =>
          a.name === 'input' &&
          unwrapNull(a.type) instanceof GraphQLInputObjectType,
      );

      if (inputArg) {
        const inputType = unwrapNull(inputArg.type) as GraphQLInputObjectType;
        inputFields = Object.values(inputType.getFields()).filter(
          f => f.name !== 'clientMutationId',
        );

        const matchingField = Object.values(inputType.getFields()).filter(
          a => unwrapNull(a.type) === GraphQLString && a.name === idArgName,
        );
        entityId = matchingField && matchingField.map(a => a.name)[0];
      } else {
        inputFields = mutation.args;
      }

      return {
        mutation,
        entityId,
        inputFields,
        title: startCase(mutation.name),
      };
    })
    .filter(m => type === config.schema.getQueryType() || m.entityId);
}

export function getMutationString(mutation: GraphQLField<any, any>) {
  // TODO improve
  const mutationType = unwrapNull(mutation.type);
  const fragment: string[] = [];
  const inputDefs = mutation.args.map(i => `$${i.name}: ${i.type}`).join(', ');
  const inputs = mutation.args.map(i => `${i.name}: $${i.name}`).join(', ');

  if (mutationType instanceof GraphQLObjectType) {
    for (const field of Object.values(mutationType.getFields())) {
      if (field.name === 'clientMutationId') continue;

      const fieldType = unwrapNull(field.type);
      if (fieldType instanceof GraphQLObjectType) {
        fragment.push(`${field.name} {
          ${getScalarFragmentForType(fieldType)}
        }`);
      } else if (fieldType instanceof GraphQLScalarType) {
        fragment.push(field.name);
      }
    }
  }

  return `mutation(${inputDefs}) {
    ${mutation.name}(${inputs}) {
      __typename
      ${fragment.join('\n')}
    }
  }`;
}
