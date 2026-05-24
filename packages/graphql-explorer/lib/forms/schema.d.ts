import * as g from 'graphql';
import * as yup from 'yup';
import { ConfigurationInterface } from '../logic/Configuration';
export interface SchemaMeta {
    field: g.GraphQLArgument | g.GraphQLInputField;
    Component?: React.ElementType<any>;
}
export declare function getFieldMeta(schema: yup.Schema<any>): SchemaMeta | undefined;
export default class SchemaBuilder {
    protected config: ConfigurationInterface;
    inputObjectCache: Record<string, yup.ObjectSchema<any>>;
    enumObjectCache: Record<string, string[]>;
    constructor(config: ConfigurationInterface);
    getSchemaFromType(type: g.GraphQLInputType, field: g.GraphQLArgument | g.GraphQLInputField): yup.Schema<any>;
    getSchemaFromArguments(args: readonly (g.GraphQLArgument | g.GraphQLInputField)[]): yup.ObjectSchema<{
        [x: string]: any;
    }, yup.AnyObject, {
        [x: string]: any;
    }, "">;
}
//# sourceMappingURL=schema.d.ts.map