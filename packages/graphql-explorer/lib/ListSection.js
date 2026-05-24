import * as g from 'graphql';
import isPlainObject from 'lodash/isPlainObject';
import startCase from 'lodash/startCase';
import React, { useCallback, useMemo } from 'react';
import { useExplorer } from './ExplorerContext';
import Panel from './Panel';
import PanelContainer, { usePanelContext } from './ui/PanelContainer';
import Table from './ui/Table';
export function ListSectionBase({ items, itemType }) {
    const explorer = useExplorer();
    const isScalar = explorer.queryBuilder.isScalarType(itemType);
    const { pushPanel } = usePanelContext();
    const baseFragment = useMemo(() => explorer.queryBuilder.getFragment(itemType), [explorer.queryBuilder, itemType]);
    const handleItemClick = useMemo(() => {
        if (g.isListType(itemType))
            return undefined;
        if (baseFragment === undefined)
            return undefined;
        const resolvedQuery = explorer.resolveQuery(itemType);
        if (!resolvedQuery) {
            return (item) => {
                const title = startCase(itemType.name);
                const newPanel = (React.createElement(Panel, { title: title, type: itemType, execute: () => Promise.resolve(item), formArgs: [], allowSubFragment: false }));
                pushPanel(newPanel);
            };
        }
        return (item) => {
            const title = startCase(itemType.name);
            const newPanel = (React.createElement(Panel, { title: title, type: itemType, execute: async (_, fragment = baseFragment) => {
                    const resp = await resolvedQuery(fragment, item, itemType);
                    return resp;
                }, formArgs: [], allowSubFragment: true }));
            pushPanel(newPanel);
        };
    }, [baseFragment, explorer, itemType, pushPanel]);
    const isClickable = !!handleItemClick;
    const fetchedFields = useMemo(() => {
        if (g.isObjectType(itemType) && !!items[0]) {
            const cols = Object.keys(items[0]).filter((c) => c !== 'id' && c !== '__typename');
            return cols;
        }
        return [];
    }, [itemType, items]);
    const header = useMemo(() => {
        if (fetchedFields.length === 0)
            return null;
        return fetchedFields.map((col) => React.createElement("th", { key: col }, col));
    }, [fetchedFields]);
    const printObject = (obj) => {
        const otherKeys = Object.keys(obj).filter((o) => o !== 'id' && o !== '__typename');
        return otherKeys.length > 0 ? obj[otherKeys[0]] : obj.id;
    };
    const getRowContent = useCallback((item) => {
        if (isScalar)
            return React.createElement("td", null, item);
        if (fetchedFields.length === 0)
            return React.createElement("td", null, "\u2014");
        return fetchedFields.map((f) => (React.createElement("td", { key: f }, isPlainObject(item[f]) ? printObject(item[f]) : item[f])));
    }, [fetchedFields, isScalar]);
    const rows = useMemo(() => items.map((item, index) => {
        return (React.createElement(Table.Row, { key: index, data: item, onClick: handleItemClick }, getRowContent(item)));
    }), [getRowContent, handleItemClick, items]);
    if (g.isListType(itemType)) {
        return (React.createElement(PanelContainer.Body, null,
            React.createElement("h4", null, "Cannot display nested lists")));
    }
    if (items.length === 0) {
        return (React.createElement(PanelContainer.Body, null,
            React.createElement("h4", null, "No items found")));
    }
    return (React.createElement(PanelContainer.Body, null,
        React.createElement(Table, { clickable: isClickable, header: header, fixed: true }, rows)));
}
export default function ListSection({ item: items, type: listType, }) {
    const itemType = g.getNullableType(listType.ofType);
    return React.createElement(ListSectionBase, { items: items, itemType: itemType });
}
//# sourceMappingURL=ListSection.js.map