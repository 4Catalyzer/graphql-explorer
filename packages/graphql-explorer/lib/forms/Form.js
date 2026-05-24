import React from 'react';
import Button from 'react-bootstrap/Button';
import BsForm from 'react-bootstrap/Form';
import FormBase from 'react-formal';
import FormField from './FormField';
import FormFields from './FormFields';
function Form(props) {
    return React.createElement(FormBase, { as: BsForm, ...props });
}
export default Object.assign(Form, {
    Field: FormField,
    Fields: FormFields,
    Submit: (props) => (React.createElement("div", { className: "mt-3" },
        React.createElement(FormBase.Submit, { as: Button, ...props }))),
});
//# sourceMappingURL=Form.js.map