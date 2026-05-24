import * as g from 'graphql';
import isPlainObject from 'lodash/isPlainObject';
import sortBy from 'lodash/sortBy';
import startCase from 'lodash/startCase';
import React, { useMemo } from 'react';
import Accordion from 'react-bootstrap/Accordion';
import ListGroup from 'react-bootstrap/ListGroup';
import { MdExpandMore } from 'react-icons/md';
import { useExplorer } from './ExplorerContext';
import MutationSection from './MutationSection';
import Panel from './Panel';
import PanelContainer, { usePanelContext } from './ui/PanelContainer';
function FieldComponent({ title, canExecute, item }) {
    return (React.createElement(React.Fragment, null,
        React.createElement("b", null, title),
        !canExecute && `: ${item}`));
}
function ObjectSectionField({ type, field, fieldValue, executeQuery, }) {
    const title = startCase(field.name).toLowerCase();
    const fieldType = g.getNullableType(field.type);
    const hasValue = fieldValue !== undefined;
    const isObject = isPlainObject(fieldValue);
    const { pushPanel } = usePanelContext();
    const explorer = useExplorer();
    const resolver = explorer.resolveType(fieldType);
    const canExecute = isObject || (!hasValue && !!executeQuery);
    const Component = useMemo(() => {
        const fieldResolver = explorer.resolveField(type, field);
        return fieldResolver?.Component ?? FieldComponent;
    }, [explorer, field, type]);
    const handleClick = () => {
        let newPanel;
        if (isObject && !executeQuery) {
            newPanel = (React.createElement(Panel, { title: title, type: fieldType, execute: () => Promise.resolve(fieldValue), formArgs: [], allowSubFragment: false }));
        }
        else {
            newPanel = (React.createElement(Panel, { title: title, type: fieldType, execute: async (input, fragment = explorer.queryBuilder.getFragment(fieldType)) => {
                    const itemArgs = explorer.queryBuilder.serializeArgsInline(input, field.args);
                    const resp = await executeQuery(`{
                item: ${field.name} ${itemArgs} ${fragment}
              }`);
                    return resp.item;
                }, formArgs: resolver?.getFormArgs
                    ? resolver?.getFormArgs(field.args)
                    : field.args, defaultFormValue: resolver?.getDefaultArgs
                    ? resolver.getDefaultArgs(fieldType)
                    : undefined, allowSubFragment: true }));
        }
        pushPanel(newPanel);
    };
    return (React.createElement(ListGroup.Item, { action: canExecute, onClick: canExecute ? handleClick : undefined, key: field.name, style: {
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
        } },
        React.createElement(Component, { title: title, item: fieldValue, canExecute: canExecute, field: field })));
}
export default function ObjectSection({ item, type, executeQuery: executeQueryBase, }) {
    const explorer = useExplorer();
    const executeQuery = useMemo(() => {
        const resolvedQuery = explorer.resolveQuery(type);
        if (!resolvedQuery)
            return executeQueryBase;
        return (fragment) => resolvedQuery(fragment, item, type);
    }, [executeQueryBase, explorer, item, type]);
    const sortedFields = sortBy(Object.values(type.getFields()), (f) => (item[f.name] === undefined ? 1 : 0), (f) => f.name);
    const fields = sortedFields.map((field) => (React.createElement(ObjectSectionField, { key: field.name, executeQuery: executeQuery, field: field, fieldValue: item[field.name], type: type })));
    return (React.createElement(Accordion, { defaultActiveKey: "fields" },
        React.createElement(MutationSection, { item: item, type: type }),
        React.createElement(Accordion.Item, { eventKey: "fields" },
            React.createElement(Accordion.Header, { as: PanelContainer.Header, style: { cursor: 'pointer' } },
                React.createElement("span", null, "Fields"),
                React.createElement(MdExpandMore, { className: "float-end" })),
            React.createElement(Accordion.Body, null,
                React.createElement(ListGroup, { variant: "flush" }, fields)))));
}
//# sourceMappingURL=ObjectSection.js.map