import * as g from 'graphql';

import QueryBuilder from './QueryBuilder';
import config from './config';

export default class RootQueryBuilder
  implements QueryBuilder<g.GraphQLObjectType> {
  public fragmentType = config.schema.getQueryType()!;

  variables = {};

  getQuery(fragment: string, fragmentVarDefs: string[]) {
    const varDefinitionsString =
      fragmentVarDefs.length === 0 ? '' : `(${fragmentVarDefs.join(', ')})`;
    return `query${varDefinitionsString} {
      ${fragment}
    }`;
  }

  getResult(data: Record<string, unknown>) {
    return data;
  }

  get title() {
    return 'Root Query';
  }
}
