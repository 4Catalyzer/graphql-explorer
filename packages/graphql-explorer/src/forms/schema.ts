// eslint-disable-next-line max-classes-per-file
import * as g from 'graphql';
import * as yup from 'yup';

import { ConfigurationInterface } from '../logic/Configuration';

export type YupSchemaWithRequired =
  | yup.StringSchema
  | yup.ObjectSchema
  | yup.NumberSchema
  | yup.MixedSchema
  | yup.BooleanSchema
  | yup.NotRequiredArraySchema<any>;

export interface SchemaMeta {
  field: g.GraphQLInputField;
  Component?: React.ElementType<any>;
}

export class EnumValue {
  constructor(public value: string) {}

  toString() {
    return this.value;
  }
}

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

export default class SchemaBuilder {
  constructor(protected config: ConfigurationInterface) {}

  getSchemaFromType(
    type: g.GraphQLInputType,
    field: g.GraphQLArgument | g.GraphQLInputField,
  ): YupSchemaWithRequired {
    // TODO re-add custom inputs
    const customInput = this.config.resolveInputField(type, field);
    if (customInput) {
      return customInput
        .getSchema(type)
        .meta({ Component: customInput.Component, field });
    }

    if (type instanceof g.GraphQLNonNull) {
      const innerSchema = this.getSchemaFromType(type.ofType, field);
      return makeRequired(type.ofType, innerSchema).meta({ field });
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
      return (
        yup
          .string()
          .meta({ field })
          .default(undefined)
          // explicitly set empty strings as undefined
          .transform((v) => (v === '' ? undefined : v))
      );
    }

    if (type instanceof g.GraphQLEnumType) {
      // the reason we us EnumValue is because during serialization, the enum
      // values don't have quotes, like strings do, so we box it in a specific
      // class to make sure it gets serialized properly. see `serializeInputValue`
      return yup
        .mixed()
        .oneOf(type.getValues().map((e) => new EnumValue(e.value)))
        .meta({ field, isEnum: true });
    }

    if (type instanceof g.GraphQLList) {
      const innerType = this.getSchemaFromType(
        (type as g.GraphQLList<g.GraphQLInputType>).ofType,
        field,
      );
      return yup.array(innerType).meta({ field });
    }

    if (type instanceof g.GraphQLInputObjectType) {
      if (!INPUT_OBJECT_CACHE[type.name]) {
        const objectFields: yup.ObjectSchemaDefinition<any> = {};
        Object.values(type.getFields()).forEach((subField) => {
          objectFields[subField.name] = yup.lazy(() =>
            this.getSchemaFromType(subField.type, subField),
          );
        });
        INPUT_OBJECT_CACHE[type.name] = yup
          .object(objectFields)
          .meta({ field })
          .default(undefined);
      }

      return INPUT_OBJECT_CACHE[type.name];
    }

    throw new Error(`unsupported type ${type}`);
  }

  getSchemaFromArguments(args: (g.GraphQLArgument | g.GraphQLInputField)[]) {
    const subFields: { [idx: string]: yup.Schema<any> } = {};

    for (const argument of args) {
      subFields[argument.name] = this.getSchemaFromType(
        argument.type,
        argument,
      );
    }

    return yup.object(subFields);
  }
}
