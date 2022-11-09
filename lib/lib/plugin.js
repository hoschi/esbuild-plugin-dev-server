const { createServer } = require('http');
const qs = require('querystring');
const staticHandler = require('serve-handler');
const client = require('./client');
const socketServer = require('./socketServer');

module.exports = (options = {}) => {
  const port = options.port || process.env.PORT || 3000;
  const publicDir = options.public || './public';

  return {
    name: 'dev-server',
    async setup(build) {
      const shouldLog = ['verbose', 'debug'].includes(build.initialOptions.logLevel || 'info');
      // augment build options
      build.initialOptions.banner = build.initialOptions.banner || {};
      build.initialOptions.banner.js = `${build.initialOptions.banner.js || ''};${client()}`;
      if (build.initialOptions.watch !== undefined && !build.initialOptions.watch) console.warn('warning: esbuild-plugin-dev-server is overriding esbuild watch');
      build.initialOptions.watch = true;

      const server = createServer((req, res) => {
        const parts = req.url.split('?');
        req.query = parts.length > 1 ? qs.parse(parts[1]) : {};
        staticHandler(req, res, {
          public: publicDir,
          rewrites: [{ source: '**', destination: '/index.html' }],
        });
      });

      build.onEnd(socketServer(server, shouldLog));
      if (options.beforeListen) options.beforeListen(server);
      await server.listen(port);
      if (options.afterListen) options.afterListen(server);
    },
  };
};
