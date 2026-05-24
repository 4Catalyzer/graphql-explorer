import React, { useCallback, useContext, useMemo } from 'react';
import Card from 'react-bootstrap/Card';
const PanelContext = React.createContext(null);
export function usePanelContext() {
    return useContext(PanelContext);
}
function PanelContainer({ children, panelId, closePanel, pushPanel, closeChildPanel, }) {
    const onPushPanel = useCallback((panel) => pushPanel(panelId, panel), [panelId, pushPanel]);
    const onclosePanel = useCallback(() => closePanel(panelId), [closePanel, panelId]);
    const onCloseChildPanel = useCallback(() => closeChildPanel(panelId), [panelId, closeChildPanel]);
    const contextValue = useMemo(() => ({
        closePanel: onclosePanel,
        pushPanel: onPushPanel,
        closeChildPanel: onCloseChildPanel,
    }), [onclosePanel, onPushPanel, onCloseChildPanel]);
    return (React.createElement("div", { className: "ge-Panel-container" },
        React.createElement(PanelContext.Provider, { value: contextValue },
            React.createElement(Card, { className: "ge-Panel-card" }, children))));
}
export default Object.assign(PanelContainer, {
    Header: (props) => (React.createElement(Card.Header, { ...props, className: "ge-PanelHeader" })),
    Divider: () => React.createElement("hr", { className: "ge-Panel-divider" }),
    Body: Card.Body,
});
//# sourceMappingURL=PanelContainer.js.map