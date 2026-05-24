import * as g from 'graphql';
import { ConfigurationInterface } from './Configuration';
export default class QueryBuilder {
    protected config: ConfigurationInterface;
    constructor(config: ConfigurationInterface);
    /**
     * returns a fragment for a type, if possible, otherwise null
     */
    getFragment(type: g.GraphQLNullableType): string | undefined;
    /**
     * like getFragment, but it returns also child fragments for object fields
     */
    getNestedFragment(type: g.GraphQLObjectType): string;
    /**
     * return all scalar fields that have no arguments
     */
    getSimpleScalarFields(type: g.GraphQLObjectType): string[];
    DEFAULT_LIST_FIELDS: Set<string>;
    filterListFields(field: string): boolean;
    /**
     * given a type, returns only a set of common fields (name, title, id). This
     * is useful when having to display many objects, like in a table
     * @param max the maximum number of fields in the fragment
     */
    getListableScalarFields(type: g.GraphQLObjectType, filterFields?: (field: string) => boolean, max?: number): string[];
    /**
     * given a type, returns a GraphQL fragment string with the defined fields
     */
    getObjectTypeFragment(type: g.GraphQLObjectType, fragments: string[]): string;
    serializeInputValue(input: any, argType: g.GraphQLInputType): string;
    serializeArgsInline(args: Obj, argDefinitions: readonly g.GraphQLArgument[]): string;
    serializeVariableDefinitions(argNames: string[], argDefinitions: readonly g.GraphQLArgument[]): {
        assignments: string;
        definitions: string;
    };
    isScalarType(type: g.GraphQLNullableType): type is g.GraphQLEnumType | g.GraphQLScalarType<unknown, unknown>;
}
//# sourceMappingURL=QueryBuilder.d.ts.map