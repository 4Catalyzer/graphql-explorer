import * as g from 'graphql';
import { ConfigurationInterface } from '../logic/Configuration';
import { TypeResolver } from '../logic/resolvers';
declare const listResolver: (config: ConfigurationInterface) => TypeResolver<g.GraphQLList<g.GraphQLType>>;
export default listResolver;
//# sourceMappingURL=listResolver.d.ts.map