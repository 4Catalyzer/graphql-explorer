import React, { ComponentProps } from 'react';
import Alert from 'react-bootstrap/Alert';

interface Props extends ComponentProps<typeof Alert> {
  content: any;
}

export default function JsonAlert({ content, ...props }: Props) {
  return (
    <Alert {...props}>
      <pre>
        <code>{JSON.stringify(content, undefined, 2)}</code>
      </pre>
    </Alert>
  );
}
