import React, { useCallback } from 'react';
import BsForm from 'react-bootstrap/Form';
import Form from 'react-formal';
import DropdownList from 'react-widgets/DropdownList';
import { resolveLazy } from './FormFields';
import { getFieldMeta } from './schema';
const Message = (props) => {
    return (React.createElement(Form.Message, { for: props.for }, (errors) => (React.createElement("div", { className: "invalid-feedback ge-FormField" }, errors.join(', ')))));
};
function Check({ value, onChange, ...props }) {
    const realOnChange = useCallback((e) => {
        onChange(e.target.checked);
    }, [onChange]);
    return React.createElement(BsForm.Check, { ...props, checked: value, onChange: realOnChange });
}
const FormField = React.forwardRef(function FormField({ children, as, ...props }, ref) {
    return (React.createElement(Form.Field, { ref: ref, ...props }, (innerProps, meta) => {
        if (typeof children === 'function')
            return children(innerProps);
        const { ...fieldProps } = innerProps;
        const schema = resolveLazy(meta.schema);
        const whitelist = schema._whitelist && schema._whitelist.list;
        const fieldMeta = getFieldMeta(schema);
        const Component = fieldMeta?.Component;
        const field = fieldMeta?.field;
        let Input = as || Component;
        if (!Input) {
            if (whitelist && whitelist.size > 0) {
                Input = DropdownList;
                fieldProps.data = Array.from(whitelist);
                // fieldProps.textField = String;
            }
            else if (schema.type === 'boolean') {
                Input = Check;
            }
            else {
                Input = BsForm.Control;
            }
        }
        return (React.createElement(React.Fragment, null,
            React.createElement(Input, { ...fieldProps }, children),
            field?.description ? (React.createElement(BsForm.Text, { muted: true }, field.description)) : null,
            React.createElement(Message, { for: props.name })));
    }));
});
export default Object.assign(FormField, {
    Message,
});
//# sourceMappingURL=FormField.js.map