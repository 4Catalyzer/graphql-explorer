export declare class FetchSchemaIntrospector {
    protected getInit: (query: string) => RequestInit & {
        url: string;
    };
    constructor(getInit: (query: string) => RequestInit & {
        url: string;
    });
    introspect(): Promise<import("graphql").GraphQLSchema>;
}
//# sourceMappingURL=introspection.d.ts.map