import {
  GraphQLEnumType,
  GraphQLField,
  GraphQLList,
  GraphQLObjectType,
  GraphQLScalarType,
  isNamedType,
} from 'graphql';
import React, { ReactNode, useCallback, useMemo, useState } from 'react';
import Accordion from 'react-bootstrap/Accordion';
import ListGroup from 'react-bootstrap/ListGroup';
import { MdExpandMore } from 'react-icons/md';

import MutationQueryBuilder from '../MutationQueryBuilder';
import ObjectQueryBuilder from '../ObjectQueryBuilder';
import QueryBuilder from '../QueryBuilder';
import { unwrapNull } from '../helpers';
import { MutationDefinition, getMutationsForType } from '../mutations';
import {
  selectFieldRenderer,
  selectQueryForField,
  selectQueryForType,
} from '../resolvers';
import Panel from './Panel';
import PanelBodyProps from './PanelBodyProps';

function renderScalar(value: any, field: GraphQLField<any, any>) {
  const CustomComponent = selectFieldRenderer(field);
  if (CustomComponent) {
    return <CustomComponent value={value} />;
  }

  return String(value);
}

export default function ObjectPanelBody({
  queryBuilder,
  data,
  onSelect,
}: PanelBodyProps<Record<string, any>>) {
  const [selectedField, setSelectedField] = useState<string>();
  const type = queryBuilder.fragmentType as GraphQLObjectType;
  const selectFieldQueryBuilder = useCallback(
    (field: GraphQLField<any, any>) => {
      if (data[field.name] != null) {
        const newRootQueryBuilder =
          isNamedType(field.type) &&
          selectQueryForType(field.type, data[field.name]);
        return (
          newRootQueryBuilder ||
          new ObjectQueryBuilder(field.type, data[field.name])
        );
      }
      return selectQueryForField(
        queryBuilder as QueryBuilder<GraphQLObjectType>,
        field.name,
        data,
      );
    },
    [data, queryBuilder],
  );

  const handleSelectField = useCallback(
    (field: GraphQLField<any, any>) => {
      setSelectedField(field.name);
      onSelect(selectFieldQueryBuilder(field));
    },
    [onSelect, selectFieldQueryBuilder],
  );
  const handleSelectMutation = useCallback(
    ({ mutation }: MutationDefinition) => {
      setSelectedField(mutation.name);
      const qb = new MutationQueryBuilder(mutation.name, data);
      onSelect(qb);
    },
    [onSelect, data],
  );
  const mutations = useMemo(() => getMutationsForType(type), [type]);
  const fields = useMemo(() => Object.values(type.getFields()), [type]);
  const scalars: {
    k: string;
    v: ReactNode;
  }[] = [];
  const objects: GraphQLField<any, any>[] = [];
  fields.forEach((f) => {
    const fieldType = unwrapNull(f.type);
    if (
      fieldType instanceof GraphQLScalarType ||
      fieldType instanceof GraphQLEnumType
    ) {
      scalars.push({ k: f.name, v: renderScalar(data[f.name], f) });
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
        {scalars.map((i) => (
          <div className="ge-ObjectPanelBody-scalar" key={i.k}>
            <b>{i.k}: </b>
            {i.v}
          </div>
        ))}
      </Panel.Body>

      <Accordion defaultActiveKey="links">
        {mutations.length ? (
          <>
            <Panel.Divider />
            <Accordion.Toggle as={Panel.Header} eventKey="mutations">
              <div className="d-flex align-items-center justify-content-between">
                Mutations
                <span className="ge-ObjectPanelBody-spacer" />
                <MdExpandMore />
              </div>
            </Accordion.Toggle>

            <Accordion.Collapse eventKey="mutations">
              <ListGroup variant="flush">
                {mutations.map((mutation) => (
                  <ListGroup.Item
                    action
                    onClick={() => handleSelectMutation(mutation)}
                    active={selectedField === mutation.mutation.name}
                    key={mutation.title}
                  >
                    {mutation.title}
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Accordion.Collapse>
          </>
        ) : null}

        <Panel.Divider />
        {objects.length ? (
          <>
            <Accordion.Toggle as={Panel.Header} eventKey="links">
              <div className="d-flex align-items-center justify-content-between">
                Links
                <span className="ge-ObjectPanelBody-spacer" />
                <MdExpandMore />
              </div>
            </Accordion.Toggle>
            <Accordion.Collapse eventKey="links">
              <ListGroup variant="flush">
                {objects.map((o) => (
                  <ListGroup.Item
                    action
                    onClick={() => handleSelectField(o)}
                    active={selectedField === o.name}
                    key={o.name}
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
