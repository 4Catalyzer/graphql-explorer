import * as g from 'graphql';
import { JsonInput, jsonField } from '../ui/JsonInput';
const JSON_TYPES = new Set(['JSON', 'JSONObject']);
const jsonInputResolver = () => ({
    check: (t) => g.isScalarType(t) && JSON_TYPES.has(t.name),
    Component: JsonInput,
    getSchema: jsonField,
});
export default jsonInputResolver;
//# sourceMappingURL=jsonInputResolver.js.map