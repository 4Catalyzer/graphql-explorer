import * as g from 'graphql';
import startCase from 'lodash/startCase';
import React, { useCallback } from 'react';
import Accordion from 'react-bootstrap/Accordion';
import AccordionItem from 'react-bootstrap/AccordionItem';
import ListGroup from 'react-bootstrap/ListGroup';

import { useExplorer } from './ExplorerContext';
import Panel from './Panel';
import { usePanelContext } from './ui/PanelContainer';

interface MutationSectionListItemProps {
  mutation: g.GraphQLField<any, any>;
  defaultValue: Obj | undefined;
}

function MutationSectionListItem({
  mutation,
  defaultValue,
}: MutationSectionListItemProps) {
  const explorer = useExplorer();
  const outputType = g.getNullableType(mutation.type);
  const title = startCase(mutation.name).toLowerCase();
  const { pushPanel } = usePanelContext();

  const handleClick = useCallback(() => {
    const newPanel = (
      <Panel
        title={title}
        type={outputType}
        execute={async (input) => {
          const fragment = g.isObjectType(outputType)
            ? explorer.queryBuilder.getNestedFragment(outputType)
            : '';

          const vars = explorer.queryBuilder.serializeVariableDefinitions(
            Object.keys(input),
            mutation.args,
          );

          const resp = await explorer.mutate(
            `mutation ${vars.definitions} {
              item: ${mutation.name} ${vars.assignments} ${fragment}
            }`,
            input,
          );
          return resp.item;
        }}
        formArgs={mutation.args}
        defaultFormValue={defaultValue}
        allowSubFragment={false}
      />
    );
    pushPanel(newPanel);
  }, [
    defaultValue,
    explorer,
    mutation.args,
    mutation.name,
    outputType,
    pushPanel,
    title,
  ]);

  return (
    <ListGroup.Item action onClick={handleClick}>
      <b>{title}</b>
    </ListGroup.Item>
  );
}

interface Props {
  type: g.GraphQLObjectType;
  item: Obj;
}

export default function MutationSection({ type, item }: Props) {
  const explorer = useExplorer();

  const mutations = explorer.getMutationsForType(type, item);
  if (mutations.length === 0) {
    return null;
  }
  const mutationItems = mutations.map((m) => (
    <MutationSectionListItem key={m.mutation.name} {...m} />
  ));
  return (
    <AccordionItem eventKey="mutations">
      <Accordion.Header>Mutations</Accordion.Header>
      <Accordion.Body>
        <ListGroup variant="flush">{mutationItems}</ListGroup>
      </Accordion.Body>
    </AccordionItem>
  );
}
