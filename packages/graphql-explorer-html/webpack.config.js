const path = require('path');

const { plugins, rules } = require('webpack-atoms');

module.exports = (args, { mode }) => {
  const PRODUCTION = mode === 'production';

  const envConfig = {
    'process.env.NODE_ENV': JSON.stringify(mode),
  };

  const config = {
    entry: './src/index.tsx',
    devtool: 'module-source-map',
    output: {
      path: path.resolve('./build/'),
      publicPath: PRODUCTION ? '/static/' : '/',
      filename: '[name].js',
    },

    plugins: [
      plugins.html({ title: 'Sysadmin UI' }),
      plugins.define(envConfig),
    ],
    module: {
      rules: [
        { ...rules.js({ envName: 'development' }), test: /\.(j|t)sx?$/ },
        rules.astroturf.sass({ enableCssProp: true }),
        rules.css(),
        rules.fastSass(),
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
