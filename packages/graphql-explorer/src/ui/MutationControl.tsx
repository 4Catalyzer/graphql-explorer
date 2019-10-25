import React, { ComponentProps, useCallback, useRef, useState } from 'react';
import ListGroup from 'react-bootstrap/ListGroup';

import MutationModal from './MutationModal';

type Props = Omit<ComponentProps<typeof MutationModal>, 'show' | 'onClose'>;

export default function MutationControl(props: Props) {
  const keyRef = useRef(0);
  const [show, setShow] = useState(false);
  const handleClose = useCallback(() => setShow(false), []);
  const handleShow = useCallback(() => {
    setShow(true);
    keyRef.current += 1;
  }, []);

  return (
    <>
      <ListGroup.Item action onClick={handleShow}>
        {props.title}
      </ListGroup.Item>

      <MutationModal
        key={keyRef.current}
        {...props}
        onClose={handleClose}
        show={show}
      />
    </>
  );
}
