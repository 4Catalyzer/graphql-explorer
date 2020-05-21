import React from 'react';
import BsForm from 'react-bootstrap/Form';
import Form from 'react-formal';
import DropdownList from 'react-widgets/lib/DropdownList';

import { SchemaMeta } from '../schema';
import { resolveLazy } from './FormFields';

export interface Props {
  children?: React.ReactNode;
  as?: typeof Form.Field;
  name: string;
}

const Message = (props: { for: string }) => {
  return (
    <Form.Message for={props.for}>
      {(errors: any) => (
        <div className="invalid-feedback ge-FormField">
          {errors.join(', ')}
        </div>
      )}
    </Form.Message>
  );
};

const FormField = React.forwardRef(
  ({ children, as, ...props }: Props, ref) => (
    <Form.Field ref={ref} {...props}>
      {(innerProps, meta) => {
        if (typeof children === 'function') return children(innerProps);

        const { ...fieldProps } = innerProps as typeof innerProps & {
          [idx: string]: any;
        };

        const { type } = innerProps;

        const schema = resolveLazy(meta.schema!);
        const whitelist: Set<string> =
          // eslint-disable-next-line no-underscore-dangle
          (schema as any)._whitelist && (schema as any)._whitelist.list;

        const { Component, field } = schema.meta() as SchemaMeta;
        let Input: React.ElementType<any> | undefined = as || Component;

        if (!Input) {
          if (whitelist && whitelist.size > 0) {
            const options = Array.from(whitelist);
            Input = DropdownList;
            fieldProps.data = options;
          } else if (/checkbox|radio/.test(type)) {
            Input = BsForm.Check;
            fieldProps.checked = fieldProps.value;
          } else {
            Input = BsForm.Control;
          }
        }

        return (
          <>
            <Input {...fieldProps}>{children}</Input>
            {field.description ? (
              <BsForm.Text muted>{field.description}</BsForm.Text>
            ) : null}
            <Message for={props.name} />
          </>
        );
      }}
    </Form.Field>
  ),
);

export default Object.assign(FormField, {
  Message,
});
