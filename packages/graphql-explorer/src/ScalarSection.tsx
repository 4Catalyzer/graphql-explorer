import { GraphQLScalarType } from 'graphql';
import React from 'react';

import { SectionProps } from './logic/resolvers';
import PanelContainer from './ui/PanelContainer';

export default function ScalarSection({
  item,
}: SectionProps<GraphQLScalarType, any>) {
  return <PanelContainer.Body>{`${item}`}</PanelContainer.Body>;
}
