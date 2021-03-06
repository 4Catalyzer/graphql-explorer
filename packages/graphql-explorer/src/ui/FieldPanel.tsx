import { GraphQLNonNull } from 'graphql';
import isArray from 'lodash/isArray';
import React, { useCallback, useEffect, useMemo } from 'react';
import Spinner from 'react-bootstrap/Spinner';

import FieldQueryBuilder from '../FieldQueryBuilder';
import { ResolveableQueryBuilder } from '../QueryBuilder';
import { selectPanelForQueryBuilder } from '../resolvers';
import ArgumentsForm from './ArgumentsForm';
import JsonAlert from './JsonAlert';
import ListPanelBody from './ListPanelBody';
import ObjectPanelBody from './ObjectPanelBody';
import Panel from './Panel';
import { PanelHeader } from './PanelHeader';

interface Props {
  queryBuilder: ResolveableQueryBuilder;
  index: number;
  onPushPanel: (index: number, queryBuilder: ResolveableQueryBuilder) => void;
  onClose?: () => void;
}

export default function FieldPanel({
  queryBuilder,
  index,
  onPushPanel,
  onClose,
}: Props) {
  const hasArgs = queryBuilder.args.length > 0;
  const queryProps = queryBuilder.useQuery();
  const { data, loading, error, refetch, execute, called } = queryProps;
  const skip = useMemo(
    () => queryBuilder.args.some((a) => a.type instanceof GraphQLNonNull),
    [queryBuilder.args],
  );
  useEffect(() => {
    if (!skip && !loading && !called) execute({});
  }, [execute, skip, loading, called]);
  const handleSubmit = useCallback(execute, [execute]);
  const handleSelect = useCallback(
    (newBuilder: FieldQueryBuilder) => {
      return onPushPanel(index, newBuilder);
    },
    [index, onPushPanel],
  );

  const panelBody = useMemo(() => {
    if (error)
      return (
        <Panel.Body>
          <JsonAlert variant="danger" content={error} />
        </Panel.Body>
      );
    if (data) {
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
    }
    if (called && !loading) return <Panel.Body>Object not found</Panel.Body>;
    return null;
  }, [called, data, error, handleSelect, loading, queryBuilder, queryProps]);
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
            <ArgumentsForm
              args={queryBuilder.args}
              defaultValue={queryBuilder.defaultArgValue}
              onSubmit={handleSubmit}
            />
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
