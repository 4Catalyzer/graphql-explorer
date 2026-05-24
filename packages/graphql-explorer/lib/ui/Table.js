import React, { useCallback } from 'react';
import BsTable from 'react-bootstrap/Table';
function Table({ clickable, children, header, fixed }) {
    return (React.createElement(BsTable, { striped: true, borderless: true, hover: clickable, size: "sm", style: { cursor: clickable ? 'pointer' : undefined }, className: fixed ? 'ge-Table-fixed' : undefined },
        header && (React.createElement("thead", null,
            React.createElement("tr", null, header))),
        React.createElement("tbody", null, children)));
}
function TableRow({ onClick, data, children }) {
    const handleClick = useCallback(() => onClick(data), [data, onClick]);
    return React.createElement("tr", { onClick: onClick ? handleClick : undefined }, children);
}
export default Object.assign(Table, { Row: TableRow });
//# sourceMappingURL=Table.js.map