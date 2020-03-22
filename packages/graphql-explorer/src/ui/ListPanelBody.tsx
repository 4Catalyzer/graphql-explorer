import React, { useCallback, useMemo } from 'react';
import Table from 'react-bootstrap/Table';

import { selectQueryForType } from '../resolvers';
import Panel from './Panel';
import PanelBodyProps from './PanelBodyProps';

export default function ListPanelBody({
  queryBuilder,
  data,
  onSelect,
  queryProps,
}: PanelBodyProps<Record<string, any>[]>) {
  const firstItem = data[0];
  const isScalar = typeof firstItem !== 'object';

  const clickable = useMemo(
    () =>
      firstItem && !!selectQueryForType(queryBuilder.fragmentType, firstItem),
    [firstItem, queryBuilder.fragmentType],
  );

  const handleClick = useCallback(
    (i) => {
      const newRootQueryBuilder = selectQueryForType(
        queryBuilder.fragmentType,
        i,
      );
      if (newRootQueryBuilder) {
        onSelect(newRootQueryBuilder);
      }
    },
    [onSelect, queryBuilder.fragmentType],
  );
  if (data.length === 0) {
    return <Panel.Body>No Items Found</Panel.Body>;
  }
  let cols = isScalar
    ? ['name']
    : Object.keys(data[0]).filter((c) => c !== 'id' && c !== '__typename');
  if (cols.length === 0) {
    cols = Object.keys(data[0]);
  }
  return (
    <Panel.Body>
      <Table size="sm" striped borderless hover={clickable}>
        <thead>
          <tr>
            {cols.map((col) => (
              <th key={col}>{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item, idx) => (
            <tr
              // eslint-disable-next-line react/no-array-index-key
              key={`${queryProps!.query}${idx}`}
              onClick={() => clickable && handleClick(item)}
            >
              {cols.map((col) => (
                <td key={col}>{isScalar ? item : String(item[col])}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </Table>
    </Panel.Body>
  );
}
