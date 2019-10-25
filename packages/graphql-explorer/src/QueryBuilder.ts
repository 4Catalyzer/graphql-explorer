import * as g from 'graphql';

import Serializeable from './serialization';

/**
 * base interface for all query builders
 */
export default interface QueryBuilder<T extends g.GraphQLType>
  extends Partial<Serializeable> {
  getQuery(fragment: string): string;
  getResult(data: any): any;
  fragmentType: T;

  title: string;
}
