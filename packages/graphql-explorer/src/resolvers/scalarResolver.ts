import * as g from 'graphql';

import ScalarSection from '../ScalarSection';
import { ConfigurationInterface } from '../logic/Configuration';
import { TypeResolver } from '../logic/resolvers';

const scalarResolver: (
  config: ConfigurationInterface,
) => TypeResolver<g.GraphQLScalarType> = (config) => ({
  check: (t) => config.queryBuilder.isScalarType(t),
  Section: ScalarSection,
});

export default scalarResolver;
