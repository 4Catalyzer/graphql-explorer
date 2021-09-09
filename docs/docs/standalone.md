---
sidebar_position: 4
---

# Standalone App

GraphQL Explorer also comes packaged as a standalone app. The app offers a generic way to connect to any graphql service, with the ability to set headers (eg Authorization). To see the standalone app in action directly on this documentation site, click [here](/demo)

## Install

Install the standalone package:

```
yarn add graphql-explorer-html
```

There are several ways to serve the app. Here are some suggestions.

## Serving the directory

This is quick and easy way to serve the app. simply serve the directory `node_modules/graphql-explorer-html/build`. For example, using http-server:

```ts
npx http-server node_modules/graphql-explorer-html/build
```

## Importing the javascript

simply importing the package will run the application.

```ts
import 'graphql-explorer-html';
```

This will require, as an "entry point", that there is an HTML tag with id `app` to mount the app from.
