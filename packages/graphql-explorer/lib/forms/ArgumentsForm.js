import React, { useMemo } from 'react';
import { useExplorer } from '../ExplorerContext';
import Form from './Form';
import { isYupObject, resolveLazy } from './FormFields';
function generateDefaultValue(_schema, defaultValue) {
    const schema = resolveLazy(_schema);
    let obj = schema.getDefault();
    if (!isYupObject(schema)) {
        return defaultValue === undefined ? obj : defaultValue;
    }
    Object.keys(schema.fields)
        .filter((k) => defaultValue[k] !== undefined)
        .forEach((k) => {
        if (!obj) {
            obj = {};
        }
        obj[k] = defaultValue[k];
        if (typeof obj[k] === 'object') {
            obj[k] = generateDefaultValue(schema.fields[k], obj[k]);
        }
    });
    return obj;
}
export default function ArgumentsForm({ args, children, defaultValue = {}, ...props }) {
    const { schemaBuilder } = useExplorer();
    const schema = schemaBuilder.getSchemaFromArguments(args);
    const fullDefaultValue = useMemo(() => generateDefaultValue(schema, defaultValue), [defaultValue, schema]);
    return (React.createElement(Form, { schema: schema, defaultValue: fullDefaultValue, ...props },
        React.createElement(Form.Fields, { schema: schema }),
        children,
        React.createElement("div", { className: "d-flex justify-content-end" },
            React.createElement(Form.Submit, null, "Submit"))));
}
//# sourceMappingURL=ArgumentsForm.js.map