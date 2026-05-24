import React from 'react';
import * as yup from 'yup';
interface FormFieldsProps {
    schema: yup.ObjectSchema<any>;
}
export declare function resolveLazy<T extends yup.Schema<any>>(schema: T & {
    resolve?: (opts: any) => T;
}): T;
export declare function isYupArray(s: yup.Schema<unknown>): s is yup.ArraySchema<any, any>;
export declare function isYupObject(s: yup.Schema<any>): s is yup.ObjectSchema<any>;
export default function FormFields({ schema }: FormFieldsProps): React.JSX.Element;
export {};
//# sourceMappingURL=FormFields.d.ts.map