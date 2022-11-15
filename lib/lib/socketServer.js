const SockJS = require('sockjs');

module.exports = function socketServer(server, shouldLog) {
  const connections = [];
  const sockjs = SockJS.createServer({
    prefix: '/esbuild',
    log: () => {
      /* silent */
    },
  });
  sockjs.installHandlers(server);
  sockjs.on('connection', (connection) => {
    connections.push(connection);
    if (shouldLog) {
      console.log(`esbuild-plugin-dev-server: new connection, now clients: ${connections.length}`);
    }
    connection.on('close', () => {
      connections.splice(connections.indexOf(connection), 1);
      if (shouldLog) {
        console.log(`esbuild-plugin-dev-server: closed connection, now clients: ${connections.length}`);
      }
    });
  });

  return function write(result) {
    if (shouldLog) {
      const truncated = { ...result, metafile: { ...result.metafile } };
      delete truncated?.metafile?.inputs;
      console.log(`esbuild-plugin-dev-server: clients: ${connections.length}. build result onEnd (truncated):`, truncated);
    }
    connections.forEach((res) => res.write(JSON.stringify(result)));
  };
};
