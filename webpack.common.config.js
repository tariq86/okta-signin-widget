/* eslint-disable camelcase */
const path = require('path');

const TerserPlugin = require('terser-webpack-plugin');

var SRC = path.resolve(__dirname, 'src');
var TARGET_JS = path.resolve(__dirname, 'target/js/');
var LOCAL_PACKAGES = path.resolve(__dirname, 'packages/');

// Return a function so that all consumers get a new copy of the config
module.exports = function(outputFilename, mode = 'development') {
  return {
    entry: [`${SRC}/widget/OktaSignIn.js`],
    mode,
    devtool: 'source-map',
    output: {
      path: TARGET_JS,
      filename: outputFilename,
      library: 'OktaSignIn',
      libraryTarget: 'umd'
    },
    resolve: {
      modules: [SRC, 'packages', 'node_modules'],
      alias: {
        // General remapping
        'nls': '@okta/i18n/src/json',
        'okta': `${LOCAL_PACKAGES}/@okta/courage-dist/okta.js`,
        'okta-i18n-bundles': 'util/Bundles',

        // jQuery from courage
        'jquery': `${LOCAL_PACKAGES}/@okta/courage-dist/jquery.js`,

        // Vendor files from courage that are remapped in OSW to point to an npm
        // module in our package.json dependencies
        'handlebars/runtime': 'handlebars/dist/cjs/handlebars.runtime',
        'handlebars$': 'handlebars/dist/cjs/handlebars.runtime',
        'qtip': '@okta/qtip2/dist/jquery.qtip.min.js',

        'duo': `${LOCAL_PACKAGES}/vendor/duo_web_sdk/index.js`,
        'typingdna': `${LOCAL_PACKAGES}/vendor/TypingDnaRecorder-JavaScript/typingdna`,
      }
    },

    module: {
      rules: [
        // Babel
        {
          test: /\.js$/,
          exclude: function(filePath) {
            const filePathContains = (f) => filePath.indexOf(f) > 0;
            const npmRequiresTransform = [
              '/node_modules/parse-ms',
              '/node_modules/@sindresorhus/to-milliseconds'
            ].some(filePathContains);
            const shallBeExcluded = [
              '/node_modules/',
              'packages/@okta/courage-dist/jquery.js',
              'packages/@okta/qtip2'
            ].some(filePathContains);

            return shallBeExcluded && !npmRequiresTransform;

          },
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
            plugins: [
              './packages/@okta/babel-plugin-handlebars-inline-precompile',
              '@babel/plugin-transform-modules-commonjs'
            ]
          }
        },
        // load external source maps
        {
          test: /\.js$/,
          use: ['source-map-loader'],
          enforce: 'pre'
        }
      ]
    },

    // Webpack attempts to add a polyfill for process
    // and setImmediate, because q uses process to see
    // if it's in a Node.js environment
    node: false,

    optimization: {
      minimize: true,
      minimizer: [
        new TerserPlugin({
          minify: (file, sourceMap) => {
            let oktaLicenseBannersCount = 0;

            // https://github.com/mishoo/UglifyJS2#minify-options
            const uglifyJsOptions = {
              compress: {
                // Drop all console.* and Logger statements
                drop_console: true,
                drop_debugger: true,
                pure_funcs: [
                  'Logger.trace',
                  'Logger.dir',
                  'Logger.time',
                  'Logger.timeEnd',
                  'Logger.group',
                  'Logger.groupEnd',
                  'Logger.assert',
                  'Logger.log',
                  'Logger.info',
                  'Logger.warn',
                  'Logger.deprecate'
                ],
              },
              sourceMap: true,
              output: {
                comments: (node, comment) => {
                  // Remove other Okta copyrights
                  const isLicense = /^!/.test(comment.value) ||
                                  /.*(([Ll]icense)|([Cc]opyright)|(\([Cc]\))).*/.test(comment.value);
                  const isOkta = /.*Okta.*/.test(comment.value);
                  // Keep Okta license added by banner plugin - since it runs before optimization
                  const isFirstOktaBanner = oktaLicenseBannersCount === 0;
                  if (isOkta) {
                    ++oktaLicenseBannersCount;
                  }
                  // Some licenses are in inline comments, rather than standard block comments.
                  // UglifyJS2 treats consecutive inline comments as separate comments, so we
                  // need exceptions to include all relevant licenses.
                  const exceptions = [
                    'Chosen, a Select Box Enhancer',
                    'by Patrick Filler for Harvest',
                    'Version 0.11.1',
                    'Full source at https://github.com/harvesthq/chosen',
          
                    'Underscore.js 1.8.3'
                  ];
          
                  const isException = exceptions.some(exception => {
                    return comment.value.indexOf(exception) !== -1;
                  });
                  return (isLicense || isException) && (!isOkta || isFirstOktaBanner);
                },
              },
              warnings: false
            };
  
            if (sourceMap) {
              uglifyJsOptions.sourceMap = {
                content: sourceMap,
              };
            }
  
            return require('uglify-js').minify(file, uglifyJsOptions);
          },
        })
      ],
    },
  };
};
