import * as g from 'graphql';

import config from './config';
import QueryBuilder from './QueryBuilder';

export default class RootQueryBuilder
  implements QueryBuilder<g.GraphQLObjectType> {
  public fragmentType = config.schema.getQueryType()!;

  getQuery(fragment: string) {
    return `query {
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
