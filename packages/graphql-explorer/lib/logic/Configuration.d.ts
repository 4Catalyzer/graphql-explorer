import { ApolloClient } from '@apollo/client';
import * as g from 'graphql';
import SchemaBuilder from '../forms/schema';
import QueryBuilder from './QueryBuilder';
import { FieldResolver, InputFieldResolver, TypeResolver } from './resolvers';
type QueryFunc = (fragment: string, item: Obj<any>, type: g.GraphQLNamedType) => Promise<any>;
type MutationDefinition = {
    mutation: g.GraphQLField<any, any>;
    defaultValue: Obj<any> | undefined;
};
export interface ConfigurationInterface {
    schema: g.GraphQLSchema;
    resolveType: (type: g.GraphQLNullableType) => TypeResolver<g.GraphQLNullableType> | undefined;
    resolveInputField: (type: g.GraphQLInputType, field: g.GraphQLArgument | g.GraphQLInputField) => InputFieldResolver | undefined;
    resolveField: (type: g.GraphQLObjectType, field: g.GraphQLField<any, any>) => FieldResolver | undefined;
    getMutationsForType: (type: g.GraphQLNullableType, item: Obj) => MutationDefinition[];
    queryBuilder: QueryBuilder;
    schemaBuilder: SchemaBuilder;
    resolveQuery: (type: g.GraphQLNullableType) => QueryFunc | undefined;
    rootQuery: (fragment: string) => Promise<any>;
    nodeQuery: QueryFunc;
    mutate: (fragment: string, variables: Obj) => Promise<any>;
}
export default class Configuration implements ConfigurationInterface {
    schema: g.GraphQLSchema;
    protected client: ApolloClient;
    queryBuilder: QueryBuilder;
    schemaBuilder: SchemaBuilder;
    typeResolvers: TypeResolver<any>[];
    inputFieldResolvers: InputFieldResolver[];
    fieldResolvers: FieldResolver[];
    constructor(schema: g.GraphQLSchema, client: ApolloClient);
    resolveType(type: g.GraphQLNullableType): TypeResolver<any> | undefined;
    resolveInputField(type: g.GraphQLInputType, field: g.GraphQLArgument | g.GraphQLInputField): InputFieldResolver | undefined;
    resolveField(type: g.GraphQLObjectType, field: g.GraphQLField<any, any>): FieldResolver | undefined;
    resolveQuery(type: g.GraphQLNamedType): ((fragment: string, item: Obj<any>, type: g.GraphQLNamedType) => Promise<any>) | undefined;
    serializeError(error: any): Error;
    rootQuery(fragment: string): Promise<Obj<any> | undefined>;
    nodeQuery(fragment: string, item: Obj<any>, type: g.GraphQLNamedType): Promise<any>;
    mutate(fragment: string, variables: Obj): Promise<unknown>;
    getMutationsForNode(type: g.GraphQLObjectType, item: Obj): {
        mutation: g.GraphQLField<any, any, any>;
        defaultValue: Obj<any> | undefined;
    }[];
    getMutationsForType(type: g.GraphQLObjectType, item: Obj): {
        mutation: g.GraphQLField<any, any, {
            [key: string]: any;
        }>;
        defaultValue: Obj<any> | undefined;
    }[];
}
export {};
//# sourceMappingURL=Configuration.d.ts.map