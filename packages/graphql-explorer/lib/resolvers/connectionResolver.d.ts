/**
 * This resolvers follows the relay connection specification:
 * https://relay.dev/graphql/connections.htm
 */
import * as g from 'graphql';
import { ConfigurationInterface } from '../logic/Configuration';
import { TypeResolver } from '../logic/resolvers';
declare const connectionResolver: (config: ConfigurationInterface) => TypeResolver<g.GraphQLObjectType>;
export default connectionResolver;
//# sourceMappingURL=connectionResolver.d.ts.map