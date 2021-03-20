import * as g from 'graphql';
import startCase from 'lodash/startCase';
import React, { useCallback } from 'react';
import Accordion from 'react-bootstrap/Accordion';
import ListGroup from 'react-bootstrap/ListGroup';
import { MdExpandMore } from 'react-icons/md';

import { useExplorer } from './ExplorerContext';
import Panel from './Panel';
import PanelContainer, { usePanelContext } from './ui/PanelContainer';

interface MutationSection {
  type: g.GraphQLObjectType;
  item: Obj;
}
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
          const itemArgs = explorer.queryBuilder.serializeArgs(input);

          const resp = await explorer.mutate(
            `mutation {
              item: ${mutation.name} ${itemArgs} ${fragment}
            }`,
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
    <>
      <Accordion.Toggle
        as={PanelContainer.Header}
        eventKey="mutations"
        style={{ cursor: 'pointer' }}
      >
        <span>Mutations</span>
        <MdExpandMore className="float-right" />
      </Accordion.Toggle>
      <Accordion.Collapse eventKey="mutations">
        <ListGroup variant="flush">{mutationItems}</ListGroup>
      </Accordion.Collapse>
    </>
  );
}
