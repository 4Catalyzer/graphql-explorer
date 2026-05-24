import * as g from 'graphql';
import React from 'react';
import { SectionProps } from './logic/resolvers';
interface Props extends SectionProps<{
    edges: {
        node: any;
    }[];
    pageInfo: {
        endCursor: string;
        hasNextPage: boolean;
    };
}, g.GraphQLObjectType> {
    itemType: g.GraphQLObjectType;
}
export default function ConnectionSection({ item, itemType, executeQuery, input, }: Props): React.JSX.Element;
export {};
//# sourceMappingURL=ConnectionSection.d.ts.map