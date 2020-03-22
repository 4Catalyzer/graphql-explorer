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
  field: g.GraphQLArgument | g.GraphQLInputField,
): YupSchemaWithRequired {
  const customInput = selectInputField(type, field);
  if (customInput) {
    return customInput
      .getSchema(type)
      .meta({ Component: customInput.Component, field });
  }

  if (type instanceof g.GraphQLNonNull) {
    const innerSchea = getSchemaFromType(type.ofType, field);
    return makeRequired(type.ofType, innerSchea).meta({ field });
  }

  if (type === g.GraphQLInt) {
    return yup.number().integer().meta({ field });
  }
  if (type === g.GraphQLFloat) {
    return yup.number().meta({ field });
  }
  if (type === g.GraphQLBoolean) {
    return yup.bool().meta({ field }).default(false);
  }
  // treat all the other scalar types as string
  if (type instanceof g.GraphQLScalarType) {
    return yup.string().meta({ field });
  }

  if (type instanceof g.GraphQLEnumType) {
    return yup
      .string()
      .oneOf(type.getValues().map((e) => e.value))
      .meta({ field });
  }

  if (type instanceof g.GraphQLList) {
    const innerType = getSchemaFromType(type.ofType, field);
    return yup.array(innerType).meta({ field });
  }

  if (type instanceof g.GraphQLInputObjectType) {
    if (!INPUT_OBJECT_CACHE[type.name]) {
      INPUT_OBJECT_CACHE[type.name] = yup.object({}).meta({ field });

      Object.values(type.getFields()).forEach((subField) => {
        const subFieldYupType = getSchemaFromType(subField.type, subField);
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
    subFields[argument.name] = getSchemaFromType(argument.type, argument);
  }

  return yup.object(subFields);
}
