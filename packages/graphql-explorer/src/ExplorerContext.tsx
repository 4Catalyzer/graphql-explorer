import React, { useContext } from 'react';

import { ConfigurationInterface } from './logic/Configuration';

export const ExplorerContext = React.createContext<ConfigurationInterface>(
  null as any,
);

export function useExplorer() {
  const config = useContext(ExplorerContext);
  return config;
}
