const path = require('path');

const { plugins, rules } = require('webpack-atoms');

module.exports = (args, { mode }) => {
  const PRODUCTION = mode === 'production';

  const envConfig = {
    'process.env.NODE_ENV': JSON.stringify(mode),
  };

  const config = {
    entry: './src/index.tsx',
    devtool: 'cheap-module-source-map',
    output: {
      path: path.resolve('./build/'),
      publicPath: PRODUCTION ? '/static/' : '/',
      filename: '[name].js',
    },

    plugins: [
      plugins.html({ title: 'Graphql Explorer' }),
      plugins.define(envConfig),
    ],
    module: {
      rules: [
        {
          ...rules.js({ envName: 'development', babelrcRoots: true }),
          test: /\.(j|t)sx?$/,
        },
        rules.astroturf.sass({ enableCssProp: true }),
        rules.css(),
        rules.sass(),
        {
          oneOf: [rules.fonts(), rules.audioVideo(), rules.images()],
        },
      ],
    },
    resolve: {
      symlinks: false,
      extensions: ['.mjs', '.ts', '.tsx', '.js', '.json'],
      alias: {
        'react': require.resolve('react'),
        'react-dom': require.resolve('react-dom'),
        'graphql-explorer/lib/style.css': path.resolve(
          __dirname,
          '../graphql-explorer/lib/style.css',
        ),
        'graphql-explorer$': path.resolve(
          __dirname,
          '../graphql-explorer/src/index.js',
        ),
        'graphql-explorer/lib': path.resolve(
          __dirname,
          '../graphql-explorer/src',
        ),
      },
    },
    devServer: {
      port: 3000,
      historyApiFallback: {
        index: '/',
      },
      stats: {
        all: false,
        errors: true,
        moduleTrace: true,
        warnings: true,
      },
      disableHostCheck: true,
    },
  };

  if (PRODUCTION) {
    config.plugins.push(plugins.extractCss(), plugins.hashedModuleIds({}));
    config.devtool = 'source-map';
  }

  return config;
};
