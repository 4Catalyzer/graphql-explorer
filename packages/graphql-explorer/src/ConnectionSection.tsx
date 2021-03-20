import * as g from 'graphql';
import React, { useCallback, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';

import { ListSectionBase } from './ListSection';
import { SectionProps } from './logic/resolvers';
import PanelContainer from './ui/PanelContainer';

interface Props
  extends SectionProps<
    {
      edges: { node: any }[];
      pageInfo: { endCursor: string; hasNextPage: boolean };
    },
    g.GraphQLObjectType
  > {
  itemType: g.GraphQLObjectType;
}

export default function ConnectionSection({
  item,
  itemType,
  executeQuery,
  input,
}: Props) {
  const [connection, setconnection] = useState(item);
  const [loading, setLoading] = useState(false);
  const items = connection.edges.map(({ node }) => node);

  const handleMore = useCallback(async () => {
    setLoading(true);
    const resp: any = await executeQuery!(undefined, {
      ...input,
      after: connection.pageInfo.endCursor,
    });
    setconnection({
      edges: [...connection.edges, ...resp.edges],
      pageInfo: resp.pageInfo,
    });
    setLoading(false);
  }, [connection.edges, connection.pageInfo.endCursor, executeQuery, input]);

  return (
    <>
      <ListSectionBase items={items} itemType={itemType} />
      <PanelContainer.Body>
        <Button
          block
          onClick={handleMore}
          disabled={
            !executeQuery || loading || !connection.pageInfo.hasNextPage
          }
        >
          {loading ? <Spinner size="sm" animation="border" /> : <>+</>}
        </Button>
      </PanelContainer.Body>
    </>
  );
}
