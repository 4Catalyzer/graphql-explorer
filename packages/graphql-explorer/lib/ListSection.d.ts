import * as g from 'graphql';
import React from 'react';
import { SectionProps } from './logic/resolvers';
interface ListSectionBaseProps {
    items: any[];
    itemType: g.GraphQLNullableType;
}
export declare function ListSectionBase({ items, itemType }: ListSectionBaseProps): React.JSX.Element;
export default function ListSection({ item: items, type: listType, }: SectionProps<any[], g.GraphQLList<g.GraphQLOutputType>>): React.JSX.Element;
export {};
//# sourceMappingURL=ListSection.d.ts.map