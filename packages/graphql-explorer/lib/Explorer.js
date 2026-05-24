import React from 'react';
import { ExplorerContext } from './ExplorerContext';
import Panel from './Panel';
import Panels from './ui/Panels';
export default function Explorer({ config }) {
    const queryType = config.schema.getQueryType();
    const rootPanel = (React.createElement(Panel, { title: "Main", execute: (_, fragment) => config.rootQuery(fragment || '{ __typename }'), formArgs: [], type: queryType, allowSubFragment: true, canClose: false }));
    return (React.createElement(ExplorerContext.Provider, { value: config },
        React.createElement(Panels, { initialPanel: rootPanel })));
}
//# sourceMappingURL=Explorer.js.map