import * as g from 'graphql';
import * as yup from 'yup';
// yup 1.x deep-clones spec.meta when cloning schemas (e.g. on .required()).
// GraphQL field/type objects crash during this clone. Store meta in a WeakMap
// keyed by schema instance so yup never attempts to clone it.
const fieldMetaMap = new WeakMap();
export function getFieldMeta(schema) {
    return fieldMetaMap.get(schema);
}
function setFieldMeta(schema, meta) {
    fieldMetaMap.set(schema, meta);
    return schema;
}
function makeRequired(type, schema) {
    if (type instanceof g.GraphQLList) {
        // array's `required` semantic requires the array to not be empty
        return schema.default([]);
    }
    return schema.required();
}
export default class SchemaBuilder {
    config;
    inputObjectCache = {};
    enumObjectCache = {};
    constructor(config) {
        this.config = config;
    }
    getSchemaFromType(type, field) {
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
            return setFieldMeta(yup.bool().default(false), { field });
        }
        // treat all the other scalar types as string
        if (type instanceof g.GraphQLScalarType) {
            return setFieldMeta(yup.string().default(undefined).transform((v) => (v === '' ? undefined : v)), { field });
        }
        if (type instanceof g.GraphQLEnumType) {
            if (!(type.name in this.enumObjectCache)) {
                this.enumObjectCache[type.name] = type.getValues().map((e) => e.value);
            }
            return setFieldMeta(yup.mixed().oneOf(this.enumObjectCache[type.name]), { field });
        }
        if (type instanceof g.GraphQLList) {
            const innerType = this.getSchemaFromType(type.ofType, field);
            return setFieldMeta(yup.array(innerType), { field });
        }
        if (type instanceof g.GraphQLInputObjectType) {
            if (!this.inputObjectCache[type.name]) {
                const objectFields = {};
                Object.values(type.getFields()).forEach((subField) => {
                    objectFields[subField.name] = yup.lazy(() => this.getSchemaFromType(subField.type, subField));
                });
                const schema = yup
                    .object(objectFields)
                    .default(undefined);
                this.inputObjectCache[type.name] = setFieldMeta(schema, { field });
            }
            return this.inputObjectCache[type.name];
        }
        throw new Error(`unsupported type ${type}`);
    }
    getSchemaFromArguments(args) {
        const subFields = {};
        for (const argument of args) {
            subFields[argument.name] = this.getSchemaFromType(argument.type, argument);
        }
        return yup.object(subFields);
    }
}
//# sourceMappingURL=schema.js.map