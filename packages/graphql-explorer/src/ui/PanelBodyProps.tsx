import { ResolveableQueryBuilder } from '../QueryBuilder';

export default interface PanelBodyProps<
  TData,
  TQueryBuilder extends ResolveableQueryBuilder = ResolveableQueryBuilder
> {
  queryBuilder: TQueryBuilder;
  queryProps?: ReturnType<TQueryBuilder['useQuery']>;
  onSelect: (q: ResolveableQueryBuilder) => void;
  data: TData;
}
