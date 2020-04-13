import FieldQueryBuilder from './FieldQueryBuilder';
import config from './config';

export default interface Serializeable {
  serialize: () => any;
}

interface SerializedData {
  className: string;
  fragmentTypeName: string;
  data: any;
}

export function serializeQueryBuilder(
  queryBuilder: FieldQueryBuilder & Serializeable,
) {
  const payload: SerializedData = {
    className: queryBuilder.constructor.name,
    fragmentTypeName: queryBuilder.fragmentType.name,
    data: queryBuilder.serialize(),
  };

  return btoa(JSON.stringify(payload));
}

export function deserializeQueryBuilder(
  value: string,
): FieldQueryBuilder & Serializeable {
  const { className, fragmentTypeName, data } = JSON.parse(
    atob(value),
  ) as SerializedData;

  const Class = config.rootQueryBuilders.find((C) => C.name === className);

  if (!Class) {
    throw new Error(`${className} not registered`);
  }

  return new Class(fragmentTypeName, data);
}
