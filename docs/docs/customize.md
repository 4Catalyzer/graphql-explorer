---
sidebar_position: 2
---

# Customize

There are many ways to customize GraphQL Explorer. All the strategies involve changing the configuration objects. You can either achieve this by mutating the properties of the initialized configuration object, or by subclassing the ExplorerConfiguration class and overriding the methods, depending on your desired customization. Here are some common customization paths

## Customize inputs

By default, GraphQL Explorer introspects the gql schema and uses [yup](https://github.com/jquense/yup) and [react-widgets](https://github.com/jquense/react-widgets) to dynamically generate the forms for mutation and query arguments. You can modify the input component or the schema to use for specific types or fields by modifying the [`Configuration.inputFieldResolvers`](https://github.com/4Catalyzer/graphql-explorer/blob/d789b73120778562179653201e3e2e77875f5305/packages/graphql-explorer/src/logic/Configuration.ts#L71) field:

```tsx
const myInputFieldResolver: InputFieldResolver = {
  check: (type) => type === g.GraphQLString && field.name == 'color',
  getSchema: () => yup.string().oneOf(['blue', 'red']).trim(),
  Component: ({ value, onChange }) => (
    <div>
      <CoolColorDropdown value={value} onChange={onChange} />
    </div>
  ),
};

configuration.inputFieldResolvers.push(myInputFieldResolver);
```

- `check` **required** A predicate that determines for which field this resolver applies to
- `getSchema` if specified, overrides the default schema for that type
- `Component` if specified, overrides the default input component for that type

It's important to know that the order in which the resolvers are added in the resolvers array is important, as the first resolver who passes the check will be used. For example, if you need your resolver to take precedence over the builtin input resolvers, you might want to do the following instead:

```tsx
configuration.inputFieldResolvers = [myInputFieldResolver, ...configuration.inputFieldResolvers];
```

## Customize types

GraphQL explorer dynamically creates sensible queries for all types and displays the data in predefined panels. If you wish to change specific behavior for a type, you can add a new `TypeResolver` to the [`Configuration.typeResolvers`](https://github.com/4Catalyzer/graphql-explorer/blob/d789b73120778562179653201e3e2e77875f5305/packages/graphql-explorer/src/logic/Configuration.ts#L64) field.

```ts
const myTypeResolver: TypeResolver = {
  check: (t) => g.isObjectType(t) && t.name === 'Spaceship',
  ...,
};

configuration.typeResolvers.push(myTypeResolver);
```

- `check` **required** A predicate that determines for which field this resolver applies to
- `Section` the component rendering the value
- `getObjectFragment` by default, GraphQL Explorer fetches all the primitive (ie non-object) fields of an object without argument. if you wish to fetch some nested object, or change which fields are fetch, you can set this property
- `getListFragment` by default, when GraphQL Explorer needs to fetch a list, it applies some basic heuristic to fetch 3-4 fields with relevant names (like "title", "id", "name"). You can use this method to specify which list fragments to return
- `getMutations` by default GraphQL Explorer tries to guess which are the list of mutations related to a field. You can explicitly set which mutations you want by setting this field
- `getDefaultArgs` you can specify which default arguments to set when fetching an object of this type
- `getFormArgs` you can filter out some arguments from appearing in the form if they are set through the default args or by the `Section` component

To get a good sense on the flexibility that these hooks provide, you can check out the code for the built-in [connectionResolver](https://github.com/4Catalyzer/graphql-explorer/blob/d789b73120778562179653201e3e2e77875f5305/packages/graphql-explorer/src/resolvers/connectionResolver.tsx).

Sometimes, especially when customizing object types, you just want to change a single property, but you would still want to use all the properties from another resolver, for example the object resolver. to achieve that, you can do:

```ts
const myTypeResolver: TypeResolver = {
  ...objectResolver(configuration),
  check: (t) => g.isObjectType(t) && t.name === 'Spaceship',
  getListFragments: () => ['id', 'name', 'make'],
};

configuration.typeResolvers.push(myTypeResolver);
```

## Customizing Fields

Single fields from the object panel can be customized by adding resolvers to the [`Configuration.fieldResolvers`](https://github.com/4Catalyzer/graphql-explorer/blob/d789b73120778562179653201e3e2e77875f5305/packages/graphql-explorer/src/logic/Configuration.ts#L73) field.

```tsx
const myFieldResolver: FieldResolver = {
  check: (type, field) => field.name.endsWith('Url'),
  Component: ({ title, item }) => {
    return (
      <>
        <b>{title}:</b>
        <a href={item}>{item}</a>
      </>
    );
  },
}

configuration.fieldResolvers.push(myFieldResolver);
```
