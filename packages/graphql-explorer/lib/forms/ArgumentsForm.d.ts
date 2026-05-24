import * as g from 'graphql';
import React, { ReactNode } from 'react';
interface Props extends Record<string, any> {
    args: readonly g.GraphQLArgument[];
    children?: ReactNode;
    defaultValue?: Record<string, any>;
}
export default function ArgumentsForm({ args, children, defaultValue, ...props }: Props): React.JSX.Element;
export {};
//# sourceMappingURL=ArgumentsForm.d.ts.map