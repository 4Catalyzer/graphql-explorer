// eslint-disable-next-line max-classes-per-file
import * as g from 'graphql';
import * as yup from 'yup';
import type { ArraySchema, ObjectSchema, Schema } from 'yup';

import { ConfigurationInterface } from '../logic/Configuration';

export interface SchemaMeta {
  field: g.GraphQLInputField;
  Component?: React.ElementType<any>;
}

function makeRequired(type: g.GraphQLInputType, schema: Schema<any>) {
  if (type instanceof g.GraphQLList) {
    // array's `required` semantic requires the array to not be empty
    return (schema as ArraySchema<any, any>).default([]);
  }

  return schema.required();
}

export default class SchemaBuilder {
  inputObjectCache: Record<string, ObjectSchema<any>> = {};

  enumObjectCache: Record<string, string[]> = {};

  constructor(protected config: ConfigurationInterface) {}

  getSchemaFromType(
    type: g.GraphQLInputType,
    field: g.GraphQLArgument | g.GraphQLInputField,
  ): Schema<any> {
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
      return yup
        .bool()
        .meta({ field })
        .default(false) as unknown as Schema<any>;
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
      if (!(type.name in this.enumObjectCache)) {
        this.enumObjectCache[type.name] = type.getValues().map((e) => e.value);
      }
      return yup
        .mixed()
        .oneOf(this.enumObjectCache[type.name])
        .meta({ field });
    }

    if (type instanceof g.GraphQLList) {
      const innerType = this.getSchemaFromType(
        (type as g.GraphQLList<g.GraphQLInputType>).ofType,
        field,
      );
      return yup.array(innerType).meta({ field });
    }

    if (type instanceof g.GraphQLInputObjectType) {
      if (!this.inputObjectCache[type.name]) {
        const objectFields: ObjectSchema<any>['fields'] = {};
        Object.values(type.getFields()).forEach((subField) => {
          objectFields[subField.name] = yup.lazy(() =>
            this.getSchemaFromType(subField.type, subField),
          );
        });
        this.inputObjectCache[type.name] = yup
          .object(objectFields)
          .meta({ field })
          .default(undefined) as unknown as ObjectSchema<any>;
      }

      return this.inputObjectCache[type.name];
    }

    throw new Error(`unsupported type ${type}`);
  }

  getSchemaFromArguments(
    args: readonly (g.GraphQLArgument | g.GraphQLInputField)[],
  ) {
    const subFields: { [idx: string]: Schema<any> } = {};

    for (const argument of args) {
      subFields[argument.name] = this.getSchemaFromType(
        argument.type,
        argument,
      );
    }

    return yup.object(subFields);
  }
}
