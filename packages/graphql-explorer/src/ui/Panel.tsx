import React from 'react';
import Card from 'react-bootstrap/Card';

function Panel({ children }: { children: React.ReactNode }) {
  return (
    <div className="ge-Panel-container">
      <Card className="ge-Panel-card">{children}</Card>
    </div>
  );
}

export default Object.assign(Panel, {
  Header: Card.Header,
  Divider: () => <hr className="ge-Panel-divider" />,
  Body: Card.Body,
});
