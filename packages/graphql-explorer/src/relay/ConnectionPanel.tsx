import React from 'react';
import Button from 'react-bootstrap/Button';

import ListPanelBody from '../ui/ListPanelBody';
import Panel from '../ui/Panel';
import PanelBodyProps from '../ui/PanelBodyProps';
import ConnectionQueryBuilder from './ConnectionQueryBuilder';

export default function ConnectionPanel({
  queryProps,
  ...props
}: PanelBodyProps<Record<string, any>[], ConnectionQueryBuilder>) {
  return (
    <>
      <ListPanelBody {...props} queryProps={queryProps} />
      {queryProps && (
        <Panel.Body>
          <Button
            onClick={queryProps.fetchMore}
            block
            disabled={!queryProps.hasNextPage}
          >
            More
          </Button>
        </Panel.Body>
      )}
    </>
  );
}
