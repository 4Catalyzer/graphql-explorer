import {
  GraphQLInputType,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLType,
} from 'graphql';
import { makeExecutableSchema } from 'graphql-tools';

import FieldQueryBuilder from './FieldQueryBuilder';
import QueryBuilder from './QueryBuilder';
import { YupSchemaWithRequired } from './schema';
import Serializeable from './serialization';
import PanelBodyProps from './ui/PanelBodyProps';

interface FieldQueryBuilderConstructor {
  new (
    container: QueryBuilder<GraphQLObjectType>,
    fieldName: string,
  ): FieldQueryBuilder;

  // static methods
  check: (type: GraphQLType) => boolean;
}

interface InputFieldConfig {
  check: (type: GraphQLInputType) => boolean;
  getSchema: (type: GraphQLInputType) => YupSchemaWithRequired;
  Component: React.ElementType<any>;
}

interface RootFieldQueryBuilderConstructor {
  new (nodeTypeName: string, item: any): FieldQueryBuilder & Serializeable;

  // static methods
  check: (type: GraphQLType) => boolean;
}

class Singleton {
  private _schema?: GraphQLSchema;

  get schema(): GraphQLSchema {
    if (!this._schema) {
      throw new Error(
        'You must first set a schema: config.setSchema(mySchema)',
      );
    }
    return this._schema;
  }

  setSchema(schema: string | GraphQLSchema) {
    this._schema =
      typeof schema === 'string'
        ? makeExecutableSchema({ typeDefs: schema })
        : schema;
  }

  rootQueryBuilders: RootFieldQueryBuilderConstructor[] = [];

  fieldQueryBuilders: FieldQueryBuilderConstructor[] = [];

  panels = new Map<
    FieldQueryBuilderConstructor,
    React.ComponentType<PanelBodyProps<any>>
  >();

  addRootQueryBuilder(Class: RootFieldQueryBuilderConstructor) {
    this.rootQueryBuilders.push(Class);
  }

  addFieldQueryBuilder(Class: FieldQueryBuilderConstructor) {
    this.fieldQueryBuilders.push(Class);
  }

  addPanel(
    QueryBuilderClass: FieldQueryBuilderConstructor,
    Panel: React.ComponentType<PanelBodyProps<any>>,
  ) {
    this.panels.set(QueryBuilderClass, Panel);
  }

  inputFields: InputFieldConfig[] = [];

  addInputField(i: InputFieldConfig) {
    this.inputFields.push(i);
  }
}

export default new Singleton();