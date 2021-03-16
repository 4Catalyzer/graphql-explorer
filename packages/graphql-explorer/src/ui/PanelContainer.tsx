import React, { useCallback, useContext } from 'react';
import Card from 'react-bootstrap/Card';

interface Props {
  children: React.ReactNode;
  panelId: number;
  closePanel: (panelId: number) => void;
  pushPanel: (panelId: number, panel: React.ReactNode) => void;
  closeChildPanel: (panelId: number) => void;
}

const PanelContext = React.createContext<{
  closePanel: () => void;
  pushPanel: (panel: React.ReactNode) => void;
  closeChildPanel: () => void;
}>(null as any);

export function usePanelContext() {
  return useContext(PanelContext);
}

function PanelContainer({
  children,
  panelId,
  closePanel,
  pushPanel,
  closeChildPanel,
}: Props) {
  const onPushPanel = useCallback(
    (panel: React.ReactNode) => pushPanel(panelId, panel),
    [panelId, pushPanel],
  );

  const onclosePanel = useCallback(() => closePanel(panelId), [
    closePanel,
    panelId,
  ]);

  const onCloseChildPanel = useCallback(() => closeChildPanel(panelId), [
    panelId,
    closeChildPanel,
  ]);

  return (
    <div className="ge-Panel-container">
      <PanelContext.Provider
        value={{
          closePanel: onclosePanel,
          pushPanel: onPushPanel,
          closeChildPanel: onCloseChildPanel,
        }}
      >
        <Card className="ge-Panel-card">{children}</Card>
      </PanelContext.Provider>
    </div>
  );
}

export default Object.assign(PanelContainer, {
  Header: (props: React.ComponentProps<typeof Card.Header>) => (
    <Card.Header {...props} className="ge-PanelHeader" />
  ),
  Divider: () => <hr className="ge-Panel-divider" />,
  Body: Card.Body,
});
