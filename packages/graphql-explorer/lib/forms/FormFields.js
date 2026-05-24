import { GraphQLNonNull } from 'graphql';
import React, { useCallback, useMemo, useState } from 'react';
import Button from 'react-bootstrap/Button';
import BsForm from 'react-bootstrap/Form';
import Form, { NestedForm } from 'react-formal';
import FormField from './FormField';
import { getFieldMeta } from './schema';
export function resolveLazy(schema) {
    return schema.resolve ? schema.resolve({}) : schema;
}
export function isYupArray(s) {
    return s.type === 'array';
}
export function isYupObject(s) {
    return s.type === 'object';
}
function FieldArray({ schema, name, ...props }) {
    const subType = resolveLazy(schema.innerType);
    const renderContent = useCallback((value, helpers) => (React.createElement("div", null,
        (value || []).map((i, idx) => (React.createElement("div", { className: "ge-FormFields-field-array-container", key: idx },
            React.createElement(FormField, { name: `${name}[${idx}]` }),
            React.createElement(Button, { onClick: () => helpers.remove(i), variant: "danger", size: "sm", className: "ge-FormFields-field-array-button" }, "-")))),
        React.createElement(Button, { onClick: () => helpers.push(subType.getDefault()) }, "+"))), [name, subType]);
    return (React.createElement(Form.FieldArray, { name: name, ...props }, renderContent));
}
const FormLabel = ({ children }) => (React.createElement(BsForm.Label, { className: "ge-FormFields-label" },
    React.createElement("b", null, children)));
function NestedFormFields({ schema, fieldName, }) {
    const gqlType = getFieldMeta(schema)?.field.type;
    const isRequired = gqlType instanceof GraphQLNonNull;
    const [expanded, setExpanded] = useState(isRequired);
    const expand = useCallback(() => setExpanded(true), [setExpanded]);
    if (!expanded) {
        return (React.createElement("div", null,
            React.createElement(Button, { onClick: expand }, "+")));
    }
    return (React.createElement(NestedForm, { name: fieldName },
        React.createElement(FormFields, { schema: schema })));
}
export default function FormFields({ schema }) {
    const renderField = useCallback((field, fieldName) => {
        field = resolveLazy(field);
        // getFieldMeta() returns undefined for root objects
        const Component = getFieldMeta(field)?.Component;
        // we use the array and nested helpers only if a component is not specified
        if (!Component) {
            if (isYupArray(field)) {
                return React.createElement(FieldArray, { schema: field, name: fieldName });
            }
            if (isYupObject(field)) {
                return (React.createElement(React.Fragment, null,
                    React.createElement(NestedFormFields, { schema: field, fieldName: fieldName }),
                    React.createElement(FormField.Message, { for: fieldName })));
            }
        }
        return React.createElement(FormField, { name: fieldName });
    }, []);
    // hide the label IFF the current type has only one field, and this field
    // is an object type - to reduce nesting
    const shouldShowLabel = useMemo(() => {
        const subFields = Object.values(schema.fields);
        if (subFields.length > 1)
            return true;
        const [subField] = subFields;
        return !(subField && isYupObject(subField));
    }, [schema.fields]);
    const fields = useMemo(() => Object.entries(schema.fields).map(([fieldName, field]) => (React.createElement(BsForm.Group, { key: fieldName, controlId: fieldName },
        React.createElement("div", { className: "d-flex" },
            shouldShowLabel && React.createElement(FormLabel, null, fieldName),
            React.createElement("div", { className: "d-flex flex-column flex-grow-1" }, renderField(field, fieldName)))))), [renderField, schema.fields, shouldShowLabel]);
    return React.createElement(React.Fragment, null, fields);
}
//# sourceMappingURL=FormFields.js.map