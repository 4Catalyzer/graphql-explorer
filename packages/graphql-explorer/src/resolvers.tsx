// import { ApolloClient, gql } from '@apollo/client';
// import * as g from 'graphql';
// import { camelCase } from 'lodash';

// import ConnectionSection from './ConnectionSection';
// import ListSection from './ListSection';
// import ObjectSection from './ObjectSection';
// import QueryBuilder from './QueryBuilder';
// import ScalarSection from './ScalarSection';
// import { isConnection, isNode } from './helpers';

// export interface SectionProps<
//   T = any,
//   TType extends g.GraphQLNullableType = g.GraphQLNullableType
// > {
//   type: TType;
//   item: T;
//   executeQuery?: (fragment?: string, input?: Obj) => Promise<unknown>;
//   input?: Obj;
// }

// interface Section {
//   check: (type: g.GraphQLNullableType) => boolean;
//   Section: React.ElementType<SectionProps>;
// }

// export const objectSection: Section = {
//   check: (t) => g.isObjectType(t),
//   Section: ObjectSection,
// };

// export const listSection: Section = {
//   check: (t) => g.isListType(t),
//   Section: ListSection,
// };

// // TODO move somewhere else!
// export const connectionSection: Section = {
//   check: isConnection,
//   Section: ConnectionSection,
// };

// export const scalarSection: Section = {
//   check: (t) => g.isScalarType(t) || g.isEnumType(t),
//   Section: ScalarSection,
// };

// export const sectionResolvers = [
//   connectionSection,
//   objectSection,
//   listSection,
//   scalarSection,
// ];

// export const queryResolvers = [
//   {
//     check: (t: g.GraphQLNamedType) =>
//       g.isObjectType(t) && t.getInterfaces().find((i) => i.name === 'Node'),
//     query: nodeQuery,
//   },
//   { check: (t: g.GraphQLNamedType) => t.name === 'Root', query: rootQuery },
// ];

// export function getMutationsForType(
//   schema: g.GraphQLSchema,
//   type: g.GraphQLObjectType,
//   item: Obj,
// ) {
//   const mutations = Object.values(schema.getMutationType()?.getFields() || {});
//   // TODO make it as a resolver logic
//   if (schema.getQueryType()?.name === type.name) {
//     return mutations.map((mutation) => ({
//       mutation,
//       defaultValue: undefined,
//     }));
//   }
//   if (isNode(type)) {
//     const idArgName = `${camelCase(type.name)}Id`;
//     return mutations
//       .map((mutation) => {
//         let fields: g.GraphQLInputField[] = mutation.args;
//         let parentField: string | undefined;

//         if (fields.length === 1) {
//           parentField = fields[0].name;
//           const onlyField = g.getNullableType(fields[0].type);
//           if (g.isInputObjectType(onlyField)) {
//             fields = Object.values(onlyField.getFields());
//           }
//         }

//         const idField = fields.find(
//           (f) =>
//             g.isScalarType(g.getNullableType(f.type)) && f.name === idArgName,
//         );
//         let defaultValue: Obj | undefined;
//         if (idField) {
//           defaultValue = { ...item, [idArgName]: item.id };
//           if (parentField) {
//             defaultValue = { [parentField]: defaultValue };
//           }
//         }

//         return { mutation, defaultValue };
//       })
//       .filter(({ defaultValue }) => !!defaultValue);
//   }
//   return [];
// }
