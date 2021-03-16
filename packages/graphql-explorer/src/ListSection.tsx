import * as g from 'graphql';
import isPlainObject from 'lodash/isPlainObject';
import startCase from 'lodash/startCase';
import React, { useCallback, useMemo } from 'react';

import { useExplorer } from './ExplorerContext';
import Panel from './Panel';
import { SectionProps } from './logic/resolvers';
import PanelContainer, { usePanelContext } from './ui/PanelContainer';
import Table from './ui/Table';

interface ListSectionBaseProps {
  items: any[];
  itemType: g.GraphQLNullableType;
}

export function ListSectionBase({ items, itemType }: ListSectionBaseProps) {
  const explorer = useExplorer();
  const isScalar = explorer.queryBuilder.isScalarType(itemType);
  const { pushPanel } = usePanelContext();
  const baseFragment = useMemo(
    () => explorer.queryBuilder.getFragment(itemType),
    [explorer.queryBuilder, itemType],
  );

  const handleItemClick = useMemo(() => {
    if (g.isListType(itemType)) return undefined;
    if (baseFragment === undefined) return undefined;
    const resolvedQuery = explorer.resolveQuery(itemType);

    if (!resolvedQuery)
      return (item: any) => {
        const title = startCase(itemType.name);
        const newPanel = (
          <Panel
            title={title}
            type={itemType}
            execute={() => Promise.resolve(item)}
            formArgs={[]}
            allowSubFragment={false}
          />
        );
        pushPanel(newPanel);
      };

    return (item: any) => {
      const title = startCase(itemType.name);
      const newPanel = (
        <Panel
          title={title}
          type={itemType}
          execute={async (_, fragment = baseFragment) => {
            const resp: any = await resolvedQuery(fragment, item, itemType);
            return resp;
          }}
          formArgs={[]}
          allowSubFragment
        />
      );
      pushPanel(newPanel);
    };
  }, [baseFragment, explorer, itemType, pushPanel]);
  const isClickable = !!handleItemClick;

  const fetchedFields = useMemo(() => {
    if (g.isObjectType(itemType) && !!items[0]) {
      const cols = Object.keys(items[0]).filter(
        (c) => c !== 'id' && c !== '__typename',
      );
      return cols;
    }
    return [];
  }, [itemType, items]);

  const header = useMemo(() => {
    if (fetchedFields.length === 0) return null;
    return fetchedFields.map((col) => <th key={col}>{col}</th>);
  }, [fetchedFields]);

  const printObject = (obj: Obj) => {
    const otherKeys = Object.keys(obj).filter(
      (o) => o !== 'id' && o !== '__typename',
    );
    return otherKeys.length > 0 ? obj[otherKeys[0]] : obj.id;
  };

  const getRowContent = useCallback(
    (item: any) => {
      if (isScalar) return <td>{item}</td>;
      if (fetchedFields.length === 0) return <td>—</td>;
      return fetchedFields.map((f) => (
        <td key={f}>
          {isPlainObject(item[f]) ? printObject(item[f]) : item[f]}
        </td>
      ));
    },
    [fetchedFields, isScalar],
  );

  const rows = useMemo(
    () =>
      items.map((item, index) => {
        return (
          // eslint-disable-next-line react/no-array-index-key
          <Table.Row key={index} data={item} onClick={handleItemClick}>
            {getRowContent(item)}
          </Table.Row>
        );
      }),
    [getRowContent, handleItemClick, items],
  );

  if (g.isListType(itemType)) {
    return (
      <PanelContainer.Body>
        <h4>Cannot display nested lists</h4>
      </PanelContainer.Body>
    );
  }

  if (items.length === 0) {
    return (
      <PanelContainer.Body>
        <h4>No items found</h4>
      </PanelContainer.Body>
    );
  }

  return (
    <PanelContainer.Body>
      <Table clickable={isClickable} header={header} fixed>
        {rows}
      </Table>
    </PanelContainer.Body>
  );
}

export default function ListSection({
  item: items,
  type: listType,
}: SectionProps<any[], g.GraphQLList<g.GraphQLOutputType>>) {
  const itemType = g.getNullableType(listType.ofType);
  return <ListSectionBase items={items} itemType={itemType} />;
}
