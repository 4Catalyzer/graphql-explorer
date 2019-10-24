import copyToClipboard from 'copy-to-clipboard';
import isArray from 'lodash/isArray';
import React, { useCallback, useRef, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Overlay from 'react-bootstrap/Overlay';
import Tooltip from 'react-bootstrap/Tooltip';
import { MdClose, MdLink, MdSync } from 'react-icons/md';
import Layout from '@4c/layout';

import QueryBuilder from '../QueryBuilder';
import { selectQueryForType } from '../resolvers';
import { serializeQueryBuilder } from '../serialization';
import Panel from './Panel';

function LinkButton({
  data,
  queryBuilder,
}: Pick<Props, 'data' | 'queryBuilder'>) {
  const rootQueryBuilder =
    data && !isArray(data)
      ? selectQueryForType(queryBuilder.fragmentType, data)
      : null;
  const linkTargetRef = useRef<any>();
  const [showLinkTooltip, setShowLinkTooltip] = useState(false);

  const copyLink = useCallback(() => {
    if (!rootQueryBuilder) return;
    const queryRef = serializeQueryBuilder(rootQueryBuilder);
    const { origin, pathname } = window.location;
    const url = `${origin}${pathname}?query=${queryRef}`;
    copyToClipboard(url);
    setShowLinkTooltip(true);
    setTimeout(() => setShowLinkTooltip(false), 2000);
  }, [rootQueryBuilder]);

  if (!rootQueryBuilder) return null;
  return (
    <>
      <Button ref={linkTargetRef} variant="light" onClick={copyLink}>
        <MdLink />
      </Button>
      <Overlay
        target={linkTargetRef.current}
        show={showLinkTooltip}
        placement="bottom"
      >
        {(props: any) => (
          <Tooltip id="overlay-example" {...props}>
            Permalink copied to clipboard
          </Tooltip>
        )}
      </Overlay>
    </>
  );
}

interface Props {
  onRefetch: () => void;
  onClose?: () => void;
  queryBuilder: QueryBuilder<any>;
  data?: any;
}

export function PanelHeader({
  queryBuilder,
  onClose,
  onRefetch,
  data,
}: Props) {
  return (
    <Panel.Header css="display: flex; justify-content: space-between; align-items: center;">
      <div>{queryBuilder.title}</div>
      <Layout>
        <Button variant="light" onClick={() => onRefetch()}>
          <MdSync />
        </Button>
        <LinkButton queryBuilder={queryBuilder} data={data} />
        {onClose && (
          <Button variant="light" onClick={onClose}>
            <MdClose />
          </Button>
        )}
      </Layout>
    </Panel.Header>
  );
}
