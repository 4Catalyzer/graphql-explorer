import * as g from 'graphql';
import { ConfigurationInterface } from '../logic/Configuration';
import { TypeResolver } from '../logic/resolvers';
declare const objectResolver: (config: ConfigurationInterface) => TypeResolver<g.GraphQLObjectType>;
export default objectResolver;
//# sourceMappingURL=objectResolver.d.ts.map