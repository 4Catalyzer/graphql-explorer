import { ApolloProvider } from '@apollo/react-hooks';
import { ApolloClient } from 'apollo-boost';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { ResolveableQueryBuilder } from '../QueryBuilder';
import FieldPanel from './FieldPanel';
import RootQueryPanel from './RootQueryPanel';

interface Props {
  RootPanel: typeof RootQueryPanel;
  client: ApolloClient<any>;
  colWidth?: string;
}

export default function Panels({
  RootPanel,
  client,
  colWidth = '40rem',
}: Props) {
  const [panels, setPanels] = useState<ResolveableQueryBuilder[]>([]);
  const pushPanel = useCallback(
    (index: number, q: ResolveableQueryBuilder) => {
      setPanels([...panels.slice(0, index), q]);
    },
    [panels],
  );
  const closePanel = useCallback(
    (index: number) => {
      setPanels([...panels.slice(0, index)]);
    },
    [panels],
  );
  const panelsToDisplay = useMemo(() => {
    const rootPanel = <RootPanel onPushPanel={pushPanel} key="root" />;
    const extraPanels = panels.map((queryBuilder, idx) => {
      return (
        <FieldPanel
          // eslint-disable-next-line react/no-array-index-key
          key={`${idx}_${queryBuilder.title}_${queryBuilder}`}
          queryBuilder={queryBuilder}
          index={idx + 1}
          onPushPanel={pushPanel}
          onClose={() => closePanel(idx)}
        />
      );
    });
    return [rootPanel, ...extraPanels];
  }, [closePanel, panels, pushPanel]);

  const numCols = panelsToDisplay.length;
  const gridTemplateColumns = Array.from(Array(numCols))
    .map(() => colWidth)
    .join(' ');

  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollLeft = +100000000000;
    }
  }, [panelsToDisplay.length]);

  return (
    <ApolloProvider client={client}>
      <div
        ref={containerRef}
        className="ge-Panels-container"
        // the two 1px add some margin
        style={{ gridTemplateColumns: `1px ${gridTemplateColumns} 1px` }}
      >
        <span />
        {panelsToDisplay}
        <span />
      </div>
    </ApolloProvider>
  );
}
