import * as g from 'graphql';
import isPlainObject from 'lodash/isPlainObject';
import sortBy from 'lodash/sortBy';
import startCase from 'lodash/startCase';
import React, { useMemo } from 'react';
import { ListGroupItem } from 'react-bootstrap';
import Accordion from 'react-bootstrap/Accordion';
import ListGroup from 'react-bootstrap/ListGroup';
import { MdExpandMore } from 'react-icons/md';

import { useExplorer } from './ExplorerContext';
import MutationSection from './MutationSection';
import Panel from './Panel';
import { SectionProps } from './logic/resolvers';
import PanelContainer, { usePanelContext } from './ui/PanelContainer';

interface FieldComponentProps {
  title: string;
  canExecute: boolean;
  item: any;
}

function FieldComponent({ title, canExecute, item }: FieldComponentProps) {
  return (
    <>
      <b>{title}</b>
      {!canExecute && `: ${item}`}
    </>
  );
}

interface ObjectSectionFieldProps {
  type: g.GraphQLObjectType;
  field: g.GraphQLField<any, any>;
  fieldValue: any;
  executeQuery: SectionProps<Obj, g.GraphQLObjectType>['executeQuery'];
}

export function ObjectSectionField({
  type,
  field,
  fieldValue,
  executeQuery,
}: ObjectSectionFieldProps) {
  const title = startCase(field.name).toLowerCase();
  const fieldType = g.getNullableType(field.type);
  const hasValue = fieldValue !== undefined;
  const isObject = isPlainObject(fieldValue);
  const { pushPanel } = usePanelContext();
  const explorer = useExplorer();
  const resolver = explorer.resolveType(fieldType);

  const canExecute = isObject || (!hasValue && !!executeQuery);
  const Component = useMemo(() => {
    const fieldResolver = explorer.resolveField(type, field);
    return fieldResolver?.Component ?? FieldComponent;
  }, [explorer, field, type]);

  const handleClick = () => {
    let newPanel: React.ReactNode;

    if (isObject && !executeQuery) {
      newPanel = (
        <Panel
          title={title}
          type={fieldType}
          execute={() => Promise.resolve(fieldValue)}
          formArgs={[]}
          allowSubFragment={false}
        />
      );
    } else {
      newPanel = (
        <Panel
          title={title}
          type={fieldType}
          execute={async (
            input,
            fragment = explorer.queryBuilder.getFragment(fieldType),
          ) => {
            const itemArgs = explorer.queryBuilder.serializeArgs(input);

            const resp: any = await executeQuery!(`{
                item: ${field.name} ${itemArgs} ${fragment}
              }`);
            return resp.item;
          }}
          formArgs={
            resolver?.getFormArgs
              ? resolver?.getFormArgs(field.args)
              : field.args
          }
          defaultFormValue={
            resolver?.getDefaultArgs
              ? resolver.getDefaultArgs(fieldType)
              : undefined
          } // XXX move it to more pluggable
          allowSubFragment
        />
      );
    }
    pushPanel(newPanel);
  };

  return (
    <ListGroup.Item
      action={canExecute}
      onClick={canExecute ? handleClick : undefined}
      key={field.name}
      variant={canExecute ? undefined : 'light'}
      style={{
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}
    >
      <Component
        title={title}
        item={fieldValue}
        canExecute={canExecute}
        field={field}
      />
    </ListGroup.Item>
  );
}

interface ObjectSectionProps extends SectionProps<Obj, g.GraphQLObjectType> {
  extraFields: ListGroupItem | ListGroupItem[];
}

export default function ObjectSection({
  item,
  type,
  executeQuery: executeQueryBase,
  extraFields,
}: ObjectSectionProps) {
  const explorer = useExplorer();

  const executeQuery: typeof executeQueryBase = useMemo(() => {
    const resolvedQuery = explorer.resolveQuery(type);
    if (!resolvedQuery) return executeQueryBase;
    return (fragment: string) => resolvedQuery(fragment, item, type);
  }, [executeQueryBase, explorer, item, type]);

  const sortedFields = sortBy(
    Object.values(type.getFields()),
    (f) => (item[f.name] === undefined ? 1 : 0),
    (f) => f.name,
  );

  const fields = sortedFields.map((field) => (
    <ObjectSectionField
      key={field.name}
      executeQuery={executeQuery}
      field={field}
      fieldValue={item[field.name]}
      type={type}
    />
  ));
  return (
    <>
      <Accordion defaultActiveKey="fields">
        <MutationSection item={item} type={type} />
        <Accordion.Toggle
          as={PanelContainer.Header}
          eventKey="fields"
          style={{ cursor: 'pointer' }}
        >
          <span>Fields</span>
          <MdExpandMore className="float-right" />
        </Accordion.Toggle>
        <Accordion.Collapse eventKey="fields">
          <ListGroup variant="flush">
            {extraFields}
            {fields}
          </ListGroup>
        </Accordion.Collapse>
      </Accordion>
    </>
  );
}
