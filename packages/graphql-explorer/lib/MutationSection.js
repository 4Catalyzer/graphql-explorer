import * as g from 'graphql';
import startCase from 'lodash/startCase';
import React, { useCallback } from 'react';
import Accordion from 'react-bootstrap/Accordion';
import ListGroup from 'react-bootstrap/ListGroup';
import { MdExpandMore } from 'react-icons/md';
import { useExplorer } from './ExplorerContext';
import Panel from './Panel';
import PanelContainer, { usePanelContext } from './ui/PanelContainer';
function MutationSectionListItem({ mutation, defaultValue, }) {
    const explorer = useExplorer();
    const outputType = g.getNullableType(mutation.type);
    const title = startCase(mutation.name).toLowerCase();
    const { pushPanel } = usePanelContext();
    const handleClick = useCallback(() => {
        const newPanel = (React.createElement(Panel, { title: title, type: outputType, execute: async (input) => {
                const fragment = g.isObjectType(outputType)
                    ? explorer.queryBuilder.getNestedFragment(outputType)
                    : '';
                const vars = explorer.queryBuilder.serializeVariableDefinitions(Object.keys(input), mutation.args);
                const resp = await explorer.mutate(`mutation ${vars.definitions} {
              item: ${mutation.name} ${vars.assignments} ${fragment}
            }`, input);
                return resp.item;
            }, formArgs: mutation.args, defaultFormValue: defaultValue, allowSubFragment: false }));
        pushPanel(newPanel);
    }, [
        defaultValue,
        explorer,
        mutation.args,
        mutation.name,
        outputType,
        pushPanel,
        title,
    ]);
    return (React.createElement(ListGroup.Item, { action: true, onClick: handleClick },
        React.createElement("b", null, title)));
}
export default function MutationSection({ type, item }) {
    const explorer = useExplorer();
    const mutations = explorer.getMutationsForType(type, item);
    if (mutations.length === 0) {
        return null;
    }
    const mutationItems = mutations.map((m) => (React.createElement(MutationSectionListItem, { key: m.mutation.name, ...m })));
    return (React.createElement(Accordion.Item, { eventKey: "mutations" },
        React.createElement(Accordion.Header, { as: PanelContainer.Header, style: { cursor: 'pointer' } },
            React.createElement("span", null, "Mutations"),
            React.createElement(MdExpandMore, { className: "float-end" })),
        React.createElement(Accordion.Body, null,
            React.createElement(ListGroup, { variant: "flush" }, mutationItems))));
}
//# sourceMappingURL=MutationSection.js.map