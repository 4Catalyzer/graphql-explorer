import React from 'react';
import Card from 'react-bootstrap/Card';

function Panel({ children }: { children: React.ReactNode }) {
  return (
    <div css="overflow: auto">
      <Card css="max-height: 100%; overflow: auto;">{children}</Card>
    </div>
  );
}

export default Object.assign(Panel, {
  Header: Card.Header,
  Divider: () => <hr css="margin: 0" />,
  Body: Card.Body,
});
