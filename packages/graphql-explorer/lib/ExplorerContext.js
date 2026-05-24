import React, { useContext } from 'react';
export const ExplorerContext = React.createContext(null);
export function useExplorer() {
    const config = useContext(ExplorerContext);
    return config;
}
//# sourceMappingURL=ExplorerContext.js.map