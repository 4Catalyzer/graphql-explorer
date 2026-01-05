import React, { useCallback } from 'react';
import BsForm from 'react-bootstrap/Form';
import Form from 'react-formal';
import DropdownList from 'react-widgets/DropdownList';

import { resolveLazy } from './FormFields';
import { SchemaMeta } from './schema';

export interface Props {
  children?: React.ReactNode | ((innerProps: any) => React.ReactNode);
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

function Check({ value, onChange, ...props }: { value: any; onChange: any }) {
  const realOnChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(e.target.checked);
    },
    [onChange],
  );
  return <BsForm.Check {...props} checked={value} onChange={realOnChange} />;
}

const FormField = React.forwardRef<any, Props>(
  ({ children, as, ...props }, ref) => (
    <Form.Field ref={ref} {...props}>
      {(innerProps, meta) => {
        if (typeof children === 'function') return children(innerProps);

        const { ...fieldProps } = innerProps as typeof innerProps & {
          [idx: string]: any;
        };

        const schema = resolveLazy(meta.schema! as any);
        const whitelist: Set<string> =
          schema._whitelist && schema._whitelist.list;

        const { Component, field } = schema.meta() as unknown as SchemaMeta;
        let Input: React.ElementType<any> | undefined = as || Component;

        if (!Input) {
          if (whitelist && whitelist.size > 0) {
            Input = DropdownList;
            fieldProps.data = Array.from(whitelist);
            // fieldProps.textField = String;
          } else if (schema.type === 'boolean') {
            Input = Check;
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
