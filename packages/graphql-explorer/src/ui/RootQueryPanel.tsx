import React, { useCallback, useMemo } from 'react';

import FieldQueryBuilder from '../FieldQueryBuilder';
import RootQueryBuilder from '../RootQueryBuilder';
import ObjectPanelBody from './ObjectPanelBody';
import Panel from './Panel';

export interface Props {
  onPushPanel: (index: number, p: FieldQueryBuilder) => void;
}

export default function RootQueryPanel({ onPushPanel }: Props) {
  const queryBuilder = useMemo(() => new RootQueryBuilder(), []);
  const handleSelect = useCallback(
    (newQueryBuilder: FieldQueryBuilder) => onPushPanel(0, newQueryBuilder),
    [onPushPanel],
  );
  return (
    <Panel>
      <Panel.Header>{queryBuilder.title}</Panel.Header>
      <ObjectPanelBody
        // TODO fix types: maybe we can make RootQueryBuilder a FieldPanel
        // and simplify the hierarchy
        queryBuilder={queryBuilder as any}
        data={{}}
        onSelect={handleSelect}
      />
    </Panel>
  );
}
