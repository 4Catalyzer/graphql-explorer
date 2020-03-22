import { GraphQLNonNull } from 'graphql';
import isArray from 'lodash/isArray';
import React, { useCallback, useMemo, useState } from 'react';
import Spinner from 'react-bootstrap/Spinner';

import FieldQueryBuilder from '../FieldQueryBuilder';
import { selectPanelForQueryBuilder } from '../resolvers';
import ArgumentsForm from './ArgumentsForm';
import JsonAlert from './JsonAlert';
import ListPanelBody from './ListPanelBody';
import ObjectPanelBody from './ObjectPanelBody';
import Panel from './Panel';
import { PanelHeader } from './PanelHeader';

interface Props {
  queryBuilder: FieldQueryBuilder;
  index: number;
  onPushPanel: (index: number, queryBuilder: FieldQueryBuilder) => void;
  onClose?: () => void;
}

export default function FieldPanel({
  queryBuilder,
  index,
  onPushPanel,
  onClose,
}: Props) {
  const hasArgs = queryBuilder.args.length > 0;
  const hasRequiredArgs = queryBuilder.args.some(
    (a) => a.type instanceof GraphQLNonNull,
  );
  const [variables, setVariables] = useState();
  const fragment = queryBuilder.getScalarFragment();
  const skip = hasRequiredArgs && !variables;
  const queryProps = queryBuilder.useQuery(fragment, { variables, skip });
  const { data, loading, error, refetch } = queryProps;
  const handleSelect = useCallback(
    (newBuilder: FieldQueryBuilder) => onPushPanel(index, newBuilder),
    [index, onPushPanel],
  );

  const panelBody = useMemo(() => {
    if (!skip && error)
      return (
        <Panel.Body>
          <JsonAlert variant="danger" content={error} />
        </Panel.Body>
      );
    if (skip) return null;
    if (!loading && !data) {
      return <Panel.Body>Object not found</Panel.Body>;
    }

    if (!data) return null;

    const CustomPanel = selectPanelForQueryBuilder(queryBuilder);

    if (CustomPanel) {
      return (
        <CustomPanel
          data={data}
          queryBuilder={queryBuilder}
          onSelect={handleSelect}
          queryProps={queryProps}
        />
      );
    }

    return isArray(data) ? (
      <ListPanelBody
        data={data}
        onSelect={handleSelect}
        queryBuilder={queryBuilder}
        queryProps={queryProps}
      />
    ) : (
      <ObjectPanelBody
        data={data}
        onSelect={handleSelect}
        queryBuilder={queryBuilder}
        queryProps={queryProps}
      />
    );
  }, [data, error, handleSelect, loading, queryBuilder, queryProps, skip]);
  return (
    <Panel>
      <PanelHeader
        onRefetch={refetch}
        onClose={onClose}
        queryBuilder={queryBuilder}
        data={data}
      />
      {hasArgs && (
        <>
          <Panel.Body>
            <ArgumentsForm args={queryBuilder.args} onSubmit={setVariables} />
          </Panel.Body>
          <Panel.Divider />
        </>
      )}
      {loading && (
        <Panel.Body>
          <Spinner animation="border" />
        </Panel.Body>
      )}
      {panelBody}
    </Panel>
  );
}
