import * as g from 'graphql';
import React from 'react';
import BsForm from 'react-bootstrap/Form';
import Form from 'react-formal';
import DropdownList from 'react-widgets/lib/DropdownList';
import * as yup from 'yup';

interface FormFieldInnerProps {
  type: string;
  meta: {
    schema: yup.Schema<any>;
  };
  value: any;
  onChange: (v: any) => void;
}

interface SchemaMeta {
  field?: g.GraphQLInputField;
  Component?: React.ElementType<any>;
}

export interface Props {
  children?: React.ReactNode;
  as?: React.ElementType<FormFieldInnerProps>;
  name: string;
}

const FormField = React.forwardRef(
  ({ children, as, ...props }: Props, ref) => (
    <Form.Field ref={ref} {...props}>
      {(innerProps: FormFieldInnerProps) => {
        if (typeof children === 'function') return children(innerProps);

        const { ...fieldProps } = innerProps as FormFieldInnerProps & {
          [idx: string]: any;
        };

        const { type } = innerProps;

        const { schema } = innerProps.meta;
        const whitelist: Set<string> =
          // eslint-disable-next-line no-underscore-dangle
          (schema as any)._whitelist && (schema as any)._whitelist.list;

        const { Component, field }: SchemaMeta = schema.meta() || {};
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
            {field && field.description ? (
              <BsForm.Text muted>{field.description}</BsForm.Text>
            ) : null}
            <Form.Message for={props.name}>
              {(errors: any) => (
                <div className="invalid-feedback ge-FormField">
                  {errors.join(', ')}
                </div>
              )}
            </Form.Message>
          </>
        );
      }}
    </Form.Field>
  ),
);

export default FormField;
