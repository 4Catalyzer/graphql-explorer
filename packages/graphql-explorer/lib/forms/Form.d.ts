import React from 'react';
import Button from 'react-bootstrap/Button';
import FormFields from './FormFields';
interface FormComponentProps extends Record<string, any> {
}
declare function Form(props: FormComponentProps): React.ReactElement;
declare const _default: typeof Form & {
    Field: React.ForwardRefExoticComponent<import("./FormField").Props & React.RefAttributes<any>> & {
        Message: (props: {
            for: string;
        }) => React.JSX.Element;
    };
    Fields: typeof FormFields;
    Submit: (props: React.ComponentProps<typeof Button>) => React.JSX.Element;
};
export default _default;
//# sourceMappingURL=Form.d.ts.map