import {
  GraphQLEnumType,
  GraphQLField,
  GraphQLList,
  GraphQLObjectType,
  GraphQLScalarType,
} from 'graphql';
import React, { useCallback, useMemo, useState } from 'react';
import Accordion from 'react-bootstrap/Accordion';
import ListGroup from 'react-bootstrap/ListGroup';
import { MdExpandMore } from 'react-icons/md';
import Layout from '@4c/layout';

import { unwrapNull } from '../helpers';
import { getMutationsForType } from '../mutations';
import QueryBuilder from '../QueryBuilder';
import { selectQueryForField } from '../resolvers';
import MutationControl from './MutationControl';
import Panel from './Panel';
import PanelBodyProps from './PanelBodyProps';

export default function ObjectPanelBody({
  queryBuilder,
  data,
  onSelect,
}: PanelBodyProps<Record<string, any>>) {
  const [selectedField, setSelectedField] = useState<string>();
  const type = queryBuilder.fragmentType as GraphQLObjectType;
  const handleSelectField = useCallback(
    (field: GraphQLField<any, any>) => {
      setSelectedField(field.name);
      onSelect(
        selectQueryForField(
          queryBuilder as QueryBuilder<GraphQLObjectType>,
          field.name,
          data,
        ),
      );
    },
    [data, onSelect, queryBuilder],
  );
  const mutations = useMemo(() => getMutationsForType(type), [type]);
  const fields = useMemo(() => Object.values(type.getFields()), [type]);
  const scalars: {
    k: string;
    v: string;
  }[] = [];
  const objects: GraphQLField<any, any>[] = [];
  fields.forEach(f => {
    const fieldType = unwrapNull(f.type);
    if (
      fieldType instanceof GraphQLScalarType ||
      fieldType instanceof GraphQLEnumType
    ) {
      scalars.push({ k: f.name, v: data[f.name] });
    } else if (
      fieldType instanceof GraphQLObjectType ||
      fieldType instanceof GraphQLList
    ) {
      objects.push(f);
    } else {
      scalars.push({ k: f.name, v: 'NOT AVAILABLE' });
    }
  });
  return (
    <>
      <Panel.Body>
        {scalars.map(i => (
          <div css="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
            <b>{i.k}: </b>
            {String(i.v)}
          </div>
        ))}
      </Panel.Body>

      <Accordion defaultActiveKey="links">
        {mutations.length ? (
          <>
            <Panel.Divider />
            <Accordion.Toggle as={Panel.Header} eventKey="mutations">
              <Layout align="center" justify="space-between">
                Mutations
                <span css="margin-right: auto" />
                <MdExpandMore />
              </Layout>
            </Accordion.Toggle>

            <Accordion.Collapse eventKey="mutations">
              <ListGroup variant="flush">
                {mutations.map(mutation => (
                  <MutationControl {...mutation} entity={data} />
                ))}
              </ListGroup>
            </Accordion.Collapse>
          </>
        ) : null}

        <Panel.Divider />
        {objects.length ? (
          <>
            <Accordion.Toggle as={Panel.Header} eventKey="links">
              <Layout align="center" justify="space-between">
                Links
                <span css="margin-right: auto" />
                <MdExpandMore />
              </Layout>
            </Accordion.Toggle>
            <Accordion.Collapse eventKey="links">
              <ListGroup variant="flush">
                {objects.map(o => (
                  <ListGroup.Item
                    action
                    onClick={() => handleSelectField(o)}
                    active={selectedField === o.name}
                  >
                    {o.name}
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Accordion.Collapse>
          </>
        ) : null}
      </Accordion>
    </>
  );
}
