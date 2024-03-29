import * as g from 'graphql';
import { BaseSchema } from 'yup';

export interface SectionProps<T, TType extends g.GraphQLNullableType> {
  type: TType;
  item: T;
  executeQuery?: (fragment?: string, input?: Obj) => Promise<unknown>;
  input?: Obj;
}

export interface TypeResolver<T extends g.GraphQLNullableType> {
  check: (type: g.GraphQLNullableType) => boolean;

  Section?: React.ElementType<SectionProps<any, T>>;
  getObjectFragment?: (type: T) => string;
  getListFragments?: (type: T) => string[];

  getMutations?: (
    type: T,
    item: Obj,
  ) => {
    mutation: g.GraphQLField<
      any,
      any,
      {
        [key: string]: any;
      }
    >;
    defaultValue: Obj<any> | undefined;
  }[];

  getDefaultArgs?: (type: g.GraphQLNullableType) => Obj;
  getFormArgs?: (args: g.GraphQLArgument[]) => g.GraphQLArgument[];
}

export interface InputFieldResolver {
  check: (
    type: g.GraphQLInputType,
    field: g.GraphQLArgument | g.GraphQLInputField,
  ) => boolean;

  getSchema: (type: g.GraphQLInputType) => BaseSchema;
  Component?: React.ElementType<
    Obj & { value: any; onChange: (i: any) => any }
  >;
}

export interface FieldResolver {
  check: (
    type: g.GraphQLObjectType,
    field: g.GraphQLField<any, any>,
  ) => boolean;

  Component: React.ElementType<{
    item: any;
    title: string;
    canExecute: boolean;
    field: g.GraphQLField<any, any>;
  }>;
}
