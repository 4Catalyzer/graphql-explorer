import React from 'react';
interface Props {
    clickable?: boolean;
    children: React.ReactNode;
    header?: React.ReactNode;
    fixed?: boolean;
}
declare function Table({ clickable, children, header, fixed }: Props): React.JSX.Element;
interface TableRowProps<T> {
    onClick?: (item: T) => any;
    data: T;
    children: React.ReactNode;
}
declare function TableRow<T>({ onClick, data, children }: TableRowProps<T>): React.JSX.Element;
declare const _default: typeof Table & {
    Row: typeof TableRow;
};
export default _default;
//# sourceMappingURL=Table.d.ts.map