import { GraphQLScalarType } from 'graphql';

import { JsonInput, jsonField } from './JsonInput';
import config from './config';

const JSON_TYPES = new Set(['JSON', 'JSONObject']);

export function addCommonFields() {
  config.addInputField({
    check: (type) =>
      type instanceof GraphQLScalarType && JSON_TYPES.has(type.name),
    getSchema: jsonField,
    Component: JsonInput,
  });
}
