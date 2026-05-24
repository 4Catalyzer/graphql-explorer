import { gql } from '@apollo/client';
import * as g from 'graphql';
import camelCase from 'lodash/camelCase';
import SchemaBuilder from '../forms/schema';
import { isNode } from '../helpers';
import QueryBuilder from './QueryBuilder';
import connectionResolver from '../resolvers/connectionResolver';
import jsonInputResolver from '../resolvers/jsonInputResolver';
import listResolver from '../resolvers/listResolver';
import objectResolver from '../resolvers/objectResolver';
import scalarResolver from '../resolvers/scalarResolver';
export default class Configuration {
    schema;
    client;
    queryBuilder;
    schemaBuilder;
    typeResolvers = [
        listResolver(this),
        connectionResolver(this),
        objectResolver(this),
        scalarResolver(this),
    ];
    inputFieldResolvers = [jsonInputResolver(this)];
    fieldResolvers = [];
    constructor(schema, client) {
        this.schema = schema;
        this.client = client;
        this.queryBuilder = new QueryBuilder(this);
        this.schemaBuilder = new SchemaBuilder(this);
    }
    resolveType(type) {
        return this.typeResolvers.find((r) => r.check(type));
    }
    resolveInputField(type, field) {
        return this.inputFieldResolvers.find((r) => r.check(type, field));
    }
    resolveField(type, field) {
        return this.fieldResolvers.find((r) => r.check(type, field));
    }
    resolveQuery(type) {
        if (type.name === this.schema.getQueryType().name) {
            return this.rootQuery.bind(this);
        }
        if (g.isObjectType(type) && isNode(type)) {
            return this.nodeQuery.bind(this);
        }
        return undefined;
    }
    serializeError(error) {
        return new Error(JSON.stringify(error, undefined, 2));
    }
    async rootQuery(fragment) {
        console.log('executing', fragment);
        try {
            const response = await this.client.query({
                query: gql(fragment),
                fetchPolicy: 'no-cache',
            });
            return response.data;
        }
        catch (err) {
            console.warn(err);
            throw this.serializeError(err);
        }
    }
    async nodeQuery(fragment, item, type) {
        const { args } = this.schema.getQueryType().getFields().node;
        const input = { id: item.id };
        const nodeArgs = this.queryBuilder.serializeArgsInline(input, args);
        const data = await this.rootQuery(`{
      node ${nodeArgs} {
        ... on ${type.name} ${fragment}
      }
    }`);
        return data?.node;
    }
    async mutate(fragment, variables) {
        console.log('executing', fragment);
        try {
            const response = await this.client.mutate({
                mutation: gql(fragment),
                fetchPolicy: 'no-cache',
                variables,
            });
            return response.data;
        }
        catch (err) {
            console.warn(err);
            throw this.serializeError(err);
        }
    }
    getMutationsForNode(type, item) {
        const idArgName = `${camelCase(type.name)}Id`;
        const mutationType = this.schema.getMutationType();
        const mutations = Object.values(mutationType?.getFields() || {});
        return mutations
            .map((mutation) => {
            let fields = mutation.args;
            let parentField;
            if (fields.length === 1) {
                parentField = fields[0].name;
                const onlyField = g.getNullableType(fields[0].type);
                if (g.isInputObjectType(onlyField)) {
                    fields = Object.values(onlyField.getFields());
                }
            }
            const idField = fields.find((f) => g.isScalarType(g.getNullableType(f.type)) && f.name === idArgName);
            let defaultValue;
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
    getMutationsForType(type, item) {
        const resolver = this.resolveType(type);
        if (resolver?.getMutations) {
            return resolver.getMutations(type, item);
        }
        const mutationType = this.schema.getMutationType();
        if (!mutationType)
            return [];
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
//# sourceMappingURL=Configuration.js.map