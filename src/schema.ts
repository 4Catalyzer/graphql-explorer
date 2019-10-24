import * as g from 'graphql';
import * as yup from 'yup';

import { selectInputField } from './resolvers';

export type YupSchemaWithRequired =
  | yup.StringSchema
  | yup.ObjectSchema
  | yup.NumberSchema
  | yup.MixedSchema
  | yup.BooleanSchema
  | yup.ArraySchema<any>;

const INPUT_OBJECT_CACHE: Record<string, yup.ObjectSchema<any>> = {};

function makeRequired(
  type: g.GraphQLInputType,
  schema: YupSchemaWithRequired,
) {
  if (type instanceof g.GraphQLList) {
    // array's `required` semantic requires the array to not be empty
    return schema.default([]);
  }

  return schema.required();
}

export function getSchemaFromType(
  type: g.GraphQLInputType,
): YupSchemaWithRequired {
  const customInput = selectInputField(type);
  if (customInput) {
    return customInput
      .getSchema(type)
      .meta({ Component: customInput.Component });
  }

  if (type instanceof g.GraphQLNonNull) {
    const innerSchea = getSchemaFromType(type.ofType);
    return makeRequired(type.ofType, innerSchea);
  }

  if (type === g.GraphQLInt) {
    return yup.number().integer();
  }
  if (type === g.GraphQLFloat) {
    return yup.number();
  }
  if (type === g.GraphQLBoolean) {
    return yup.bool();
  }
  // treat all the other scalar types as string
  if (type instanceof g.GraphQLScalarType) {
    return yup.string();
  }

  if (type instanceof g.GraphQLEnumType) {
    return yup.string().oneOf(type.getValues().map(e => e.value));
  }

  if (type instanceof g.GraphQLList) {
    const innerType = getSchemaFromType(type.ofType);
    return yup.array(innerType);
  }

  if (type instanceof g.GraphQLInputObjectType) {
    if (!INPUT_OBJECT_CACHE[type.name]) {
      INPUT_OBJECT_CACHE[type.name] = yup.object({});

      Object.values(type.getFields()).forEach(field => {
        const subFieldYupType = getSchemaFromType(field.type).meta({
          field,
        });
        INPUT_OBJECT_CACHE[type.name].fields[field.name] = subFieldYupType;
      });
    }

    return INPUT_OBJECT_CACHE[type.name].default(undefined);
  }

  throw new Error(`unsupported type ${type}`);
}

export function getSchemaFromArguments(
  args: (g.GraphQLArgument | g.GraphQLInputField)[],
) {
  const subFields: { [idx: string]: yup.Schema<any> } = {};

  for (const argument of args) {
    subFields[argument.name] = getSchemaFromType(argument.type);
  }

  return yup.object(subFields);
}
