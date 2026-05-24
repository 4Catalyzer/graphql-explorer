import * as g from "graphql";
import * as yup from "yup";

import { ConfigurationInterface } from "../logic/Configuration";

export interface SchemaMeta {
  field: g.GraphQLArgument | g.GraphQLInputField;
  Component?: React.ElementType<any>;
}

// yup 1.x deep-clones spec.meta when cloning schemas (e.g. on .required()).
// GraphQL field/type objects crash during this clone. Store meta in a WeakMap
// keyed by schema instance so yup never attempts to clone it.
const fieldMetaMap = new WeakMap<yup.Schema<any>, SchemaMeta>();

export function getFieldMeta(schema: yup.Schema<any>): SchemaMeta | undefined {
  return fieldMetaMap.get(schema);
}

function setFieldMeta<T extends yup.Schema<any>>(
  schema: T,
  meta: SchemaMeta,
): T {
  fieldMetaMap.set(schema, meta);
  return schema;
}

function makeRequired(type: g.GraphQLInputType, schema: yup.Schema<any>) {
  if (type instanceof g.GraphQLList) {
    // array's `required` semantic requires the array to not be empty
    return (schema as yup.ArraySchema<any, any>).default([]);
  }

  return schema.required();
}

export default class SchemaBuilder {
  inputObjectCache: Record<string, yup.ObjectSchema<any>> = {};

  enumObjectCache: Record<string, string[]> = {};

  constructor(protected config: ConfigurationInterface) {}

  getSchemaFromType(
    type: g.GraphQLInputType,
    field: g.GraphQLArgument | g.GraphQLInputField,
  ): yup.Schema<any> {
    const customInput = this.config.resolveInputField(type, field);
    if (customInput) {
      const schema = customInput.getSchema(type);
      return setFieldMeta(schema, { Component: customInput.Component, field });
    }

    if (type instanceof g.GraphQLNonNull) {
      const innerSchema = this.getSchemaFromType(type.ofType, field);
      const schema = makeRequired(type.ofType, innerSchema);
      return setFieldMeta(schema, { field });
    }

    if (type === g.GraphQLInt) {
      return setFieldMeta(yup.number().integer(), { field });
    }
    if (type === g.GraphQLFloat) {
      return setFieldMeta(yup.number(), { field });
    }
    if (type === g.GraphQLBoolean) {
      return setFieldMeta(
        yup.bool().default(false) as unknown as yup.Schema<any>,
        { field },
      );
    }
    // treat all the other scalar types as string
    if (type instanceof g.GraphQLScalarType) {
      return setFieldMeta(
        yup
          .string()
          .default(undefined)
          .transform((v) => (v === "" ? undefined : v)),
        { field },
      );
    }

    if (type instanceof g.GraphQLEnumType) {
      if (!(type.name in this.enumObjectCache)) {
        this.enumObjectCache[type.name] = type.getValues().map((e) => e.value);
      }
      return setFieldMeta(yup.mixed().oneOf(this.enumObjectCache[type.name]), {
        field,
      });
    }

    if (type instanceof g.GraphQLList) {
      const innerType = this.getSchemaFromType(
        (type as g.GraphQLList<g.GraphQLInputType>).ofType,
        field,
      );
      return setFieldMeta(yup.array(innerType), { field });
    }

    if (type instanceof g.GraphQLInputObjectType) {
      if (!this.inputObjectCache[type.name]) {
        const objectFields: yup.ObjectSchema<any>["fields"] = {};
        Object.values(type.getFields()).forEach((subField) => {
          objectFields[subField.name] = yup.lazy(() =>
            this.getSchemaFromType(subField.type, subField),
          );
        });
        const schema = yup
          .object(objectFields)
          .default(undefined) as unknown as yup.ObjectSchema<any>;
        this.inputObjectCache[type.name] = setFieldMeta(schema, { field });
      }

      return this.inputObjectCache[type.name];
    }

    throw new Error(`unsupported type ${type}`);
  }

  getSchemaFromArguments(
    args: readonly (g.GraphQLArgument | g.GraphQLInputField)[],
  ) {
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
