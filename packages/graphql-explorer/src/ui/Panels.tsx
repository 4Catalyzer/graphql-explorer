import React, { useCallback, useEffect, useRef, useState } from 'react';

import PanelContainer from './PanelContainer';

interface Props {
  colWidth?: string;
  initialPanel: React.ReactNode;
}

function usePanelState(initialPanel: React.ReactNode) {
  const panelIdCounter = useRef(0);
  const [panels, setPanels] = useState<
    { panel: React.ReactNode; panelId: number }[]
  >([{ panel: initialPanel, panelId: panelIdCounter.current++ }]);

  const pushPanel = useCallback(
    (panelId: number, panel: React.ReactNode) => {
      const index = panels.findIndex((p) => p.panelId === panelId);
      setPanels([
        ...panels.slice(0, index + 1),
        { panel, panelId: panelIdCounter.current++ },
      ]);
    },
    [panels],
  );

  const closePanel = useCallback(
    (panelId: number) => {
      const index = panels.findIndex((p) => p.panelId === panelId);
      setPanels([...panels.slice(0, index)]);
    },
    [panels],
  );

  const closeChildPanel = useCallback(
    (panelId: number) => {
      const index = panels.findIndex((p) => p.panelId === panelId);
      setPanels([...panels.slice(0, index + 1)]);
    },
    [panels],
  );

  return { panels, pushPanel, closePanel, closeChildPanel };
}

export default function Panels({ colWidth = '40rem', initialPanel }: Props) {
  const { panels, pushPanel, closePanel, closeChildPanel } =
    usePanelState(initialPanel);

  const numCols = panels.length;
  const gridTemplateColumns = Array.from(Array(numCols))
    .map(() => colWidth)
    .join(' ');

  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollLeft = +100000000000;
    }
  }, [numCols]);

  return (
    <div
      ref={containerRef}
      className="ge-Panels"
      // the two 1px add some margin
      style={{ gridTemplateColumns: `1px ${gridTemplateColumns} 1px` }}
    >
      <span />
      {panels.map(({ panel, panelId }) => (
        <PanelContainer
          key={panelId}
          panelId={panelId}
          pushPanel={pushPanel}
          closePanel={closePanel}
          closeChildPanel={closeChildPanel}
        >
          {panel}
        </PanelContainer>
      ))}
      <span />
    </div>
  );
}
