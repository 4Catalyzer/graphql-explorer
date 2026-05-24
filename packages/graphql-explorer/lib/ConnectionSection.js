import React, { useCallback, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';
import { ListSectionBase } from './ListSection';
import PanelContainer from './ui/PanelContainer';
export default function ConnectionSection({ item, itemType, executeQuery, input, }) {
    const [connection, setconnection] = useState(item);
    const [loading, setLoading] = useState(false);
    const items = connection.edges.map(({ node }) => node);
    const handleMore = useCallback(async () => {
        setLoading(true);
        const resp = await executeQuery(undefined, {
            ...input,
            after: connection.pageInfo.endCursor,
        });
        setconnection({
            edges: [...connection.edges, ...resp.edges],
            pageInfo: resp.pageInfo,
        });
        setLoading(false);
    }, [connection.edges, connection.pageInfo.endCursor, executeQuery, input]);
    return (React.createElement(React.Fragment, null,
        React.createElement(ListSectionBase, { items: items, itemType: itemType }),
        React.createElement(PanelContainer.Body, null,
            React.createElement("div", { className: "d-grid" },
                React.createElement(Button, { onClick: handleMore, disabled: !executeQuery || loading || !connection.pageInfo.hasNextPage }, loading ? React.createElement(Spinner, { size: "sm", animation: "border" }) : React.createElement(React.Fragment, null, "+"))))));
}
//# sourceMappingURL=ConnectionSection.js.map