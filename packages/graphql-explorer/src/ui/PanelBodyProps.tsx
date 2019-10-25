import FieldQueryBuilder from '../FieldQueryBuilder';

export default interface PanelBodyProps<
  TData,
  TQueryBuilder extends FieldQueryBuilder = FieldQueryBuilder
> {
  queryBuilder: TQueryBuilder;
  queryProps?: ReturnType<TQueryBuilder['useQuery']>;
  onSelect: (q: FieldQueryBuilder) => void;
  data: TData;
}
