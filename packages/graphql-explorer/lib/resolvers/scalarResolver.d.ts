import * as g from 'graphql';
import { ConfigurationInterface } from '../logic/Configuration';
import { TypeResolver } from '../logic/resolvers';
declare const scalarResolver: (config: ConfigurationInterface) => TypeResolver<g.GraphQLScalarType>;
export default scalarResolver;
//# sourceMappingURL=scalarResolver.d.ts.map