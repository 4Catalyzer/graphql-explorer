import React, { useCallback, useEffect, useRef, useState } from 'react';
import PanelContainer from './PanelContainer';
function usePanelState(initialPanel) {
    const panelIdCounter = useRef(0);
    const [panels, setPanels] = useState([{ panel: initialPanel, panelId: panelIdCounter.current++ }]);
    const pushPanel = useCallback((panelId, panel) => {
        const index = panels.findIndex((p) => p.panelId === panelId);
        setPanels([
            ...panels.slice(0, index + 1),
            { panel, panelId: panelIdCounter.current++ },
        ]);
    }, [panels]);
    const closePanel = useCallback((panelId) => {
        const index = panels.findIndex((p) => p.panelId === panelId);
        setPanels([...panels.slice(0, index)]);
    }, [panels]);
    const closeChildPanel = useCallback((panelId) => {
        const index = panels.findIndex((p) => p.panelId === panelId);
        setPanels([...panels.slice(0, index + 1)]);
    }, [panels]);
    return {
        panels,
        pushPanel,
        closePanel,
        closeChildPanel,
    };
}
export default function Panels({ colWidth = '40rem', initialPanel }) {
    const { panels, pushPanel, closePanel, closeChildPanel } = usePanelState(initialPanel);
    const numCols = panels.length;
    const gridTemplateColumns = Array.from(Array(numCols))
        .map(() => colWidth)
        .join(' ');
    const containerRef = useRef(null);
    useEffect(() => {
        if (containerRef.current) {
            containerRef.current.scrollLeft = +100000000000;
        }
    }, [numCols]);
    return (React.createElement("div", { ref: containerRef, className: "ge-Panels", 
        // the two 1px add some margin
        style: { gridTemplateColumns: `1px ${gridTemplateColumns} 1px` } },
        React.createElement("span", null),
        panels.map(({ panel, panelId }) => (React.createElement(PanelContainer, { key: panelId, panelId: panelId, pushPanel: pushPanel, closePanel: closePanel, closeChildPanel: closeChildPanel }, panel))),
        React.createElement("span", null)));
}
//# sourceMappingURL=Panels.js.map