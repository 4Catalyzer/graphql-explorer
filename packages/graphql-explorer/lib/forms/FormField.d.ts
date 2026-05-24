import React from 'react';
import Form from 'react-formal';
export interface Props {
    children?: React.ReactNode | ((innerProps: any) => React.ReactNode);
    as?: typeof Form.Field;
    name: string;
}
declare const _default: React.ForwardRefExoticComponent<Props & React.RefAttributes<any>> & {
    Message: (props: {
        for: string;
    }) => React.JSX.Element;
};
export default _default;
//# sourceMappingURL=FormField.d.ts.map