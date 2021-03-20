import * as g from 'graphql';

import ListSection from '../ListSection';
import { ConfigurationInterface } from '../logic/Configuration';
import { TypeResolver } from '../logic/resolvers';

const listResolver: (
  config: ConfigurationInterface,
) => TypeResolver<g.GraphQLList<g.GraphQLType>> = () => ({
  check: (t) => g.isListType(t),
  Section: ListSection,
});

export default listResolver;
