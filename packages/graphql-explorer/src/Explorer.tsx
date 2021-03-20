import React from 'react';

import { ExplorerContext } from './ExplorerContext';
import Panel from './Panel';
import { ConfigurationInterface } from './logic/Configuration';
import Panels from './ui/Panels';

interface Props {
  config: ConfigurationInterface;
}

export default function Explorer({ config }: Props) {
  const queryType = config.schema.getQueryType()!;

  const rootPanel = (
    <Panel
      title="Main"
      execute={(_, fragment) => config.rootQuery(fragment || '{ __typename }')}
      formArgs={[]}
      type={queryType}
      allowSubFragment
      canClose={false}
    />
  );

  return (
    <ExplorerContext.Provider value={config}>
      <Panels initialPanel={rootPanel} />
    </ExplorerContext.Provider>
  );
}
