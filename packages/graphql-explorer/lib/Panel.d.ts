import { GraphQLArgument, GraphQLNullableType } from 'graphql';
import React from 'react';
interface Props {
    title: string;
    type: GraphQLNullableType;
    formArgs: readonly GraphQLArgument[];
    defaultFormValue?: Obj | undefined;
    execute: (input: Obj, fragment?: string) => Promise<unknown>;
    allowSubFragment: boolean;
    canClose?: boolean;
}
export default function Panel({ title, type, formArgs, execute, allowSubFragment, defaultFormValue, canClose, }: Props): React.JSX.Element;
export {};
//# sourceMappingURL=Panel.d.ts.map