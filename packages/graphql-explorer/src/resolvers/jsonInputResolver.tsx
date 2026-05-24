import * as g from 'graphql';

import { ConfigurationInterface } from '../logic/Configuration';
import { InputFieldResolver } from '../logic/resolvers';
import { JsonInput, jsonField } from '../ui/JsonInput';

const JSON_TYPES = new Set(['JSON', 'JSONObject']);

const jsonInputResolver: (
  config: ConfigurationInterface,
) => InputFieldResolver = () => ({
  check: (t) => g.isScalarType(t) && JSON_TYPES.has(t.name),
  Component: JsonInput,
  getSchema: jsonField,
});

export default jsonInputResolver;
