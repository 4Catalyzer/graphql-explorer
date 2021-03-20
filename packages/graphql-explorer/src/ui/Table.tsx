import React, { useCallback } from 'react';
import BsTable from 'react-bootstrap/Table';

interface Props {
  clickable?: boolean;
  children: React.ReactNode;
  header?: React.ReactNode;
  fixed?: boolean;
}

function Table({ clickable, children, header, fixed }: Props) {
  return (
    <BsTable
      striped
      borderless
      hover={clickable}
      size="sm"
      style={{ cursor: clickable ? 'pointer' : undefined }}
      className={fixed ? 'ge-Table-fixed' : undefined}
    >
      {header && (
        <thead>
          <tr>{header}</tr>
        </thead>
      )}
      <tbody>{children}</tbody>
    </BsTable>
  );
}

interface TableRowProps<T> {
  onClick?: (item: T) => any;
  data: T;
  children: React.ReactNode;
}

function TableRow<T>({ onClick, data, children }: TableRowProps<T>) {
  const handleClick = useCallback(() => onClick!(data), [data, onClick]);

  return <tr onClick={onClick ? handleClick : undefined}>{children}</tr>;
}

export default Object.assign(Table, { Row: TableRow });
