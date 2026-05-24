import React from 'react';
import * as yup from 'yup';
export declare const jsonField: () => yup.MixedSchema<{} | undefined, yup.AnyObject, undefined, "">;
interface JsonInputProps extends Record<string, any> {
    value: unknown;
}
export declare function JsonInput({ value, onChange, ...props }: JsonInputProps): React.JSX.Element;
export {};
//# sourceMappingURL=JsonInput.d.ts.map