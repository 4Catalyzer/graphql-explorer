import React from 'react';
import Card from 'react-bootstrap/Card';
interface Props {
    children: React.ReactNode;
    panelId: number;
    closePanel: (panelId: number) => void;
    pushPanel: (panelId: number, panel: React.ReactNode) => void;
    closeChildPanel: (panelId: number) => void;
}
export declare function usePanelContext(): {
    closePanel: () => void;
    pushPanel: (panel: React.ReactNode) => void;
    closeChildPanel: () => void;
};
declare function PanelContainer({ children, panelId, closePanel, pushPanel, closeChildPanel, }: Props): React.JSX.Element;
declare const _default: typeof PanelContainer & {
    Header: (props: React.ComponentProps<typeof Card.Header>) => React.JSX.Element;
    Divider: () => React.JSX.Element;
    Body: import("react-bootstrap/esm/helpers").BsPrefixRefForwardingComponent<"div", import("react-bootstrap").CardBodyProps>;
};
export default _default;
//# sourceMappingURL=PanelContainer.d.ts.map