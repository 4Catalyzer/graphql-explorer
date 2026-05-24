import * as g from 'graphql';

import ObjectSection from '../ObjectSection';
import { ConfigurationInterface } from '../logic/Configuration';
import { TypeResolver } from '../logic/resolvers';

const objectResolver: (
  config: ConfigurationInterface,
) => TypeResolver<g.GraphQLObjectType> = () => ({
  check: (t) => g.isObjectType(t),
  Section: ObjectSection,
});

export default objectResolver;
