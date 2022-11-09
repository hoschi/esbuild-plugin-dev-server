const SockJS = require('sockjs');

module.exports = function socketServer(server) {
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
	  console.log(`## new connection, now clients: ${connections.length}`)
    connection.on('close', () => {
		connections.splice(connections.indexOf(connection), 1)
	  console.log(`## closed connection, now clients: ${connections.length}`)
	});
  });

  return function write(result) {
	  const small = {...result}
	  delete small?.metafile?.inputs
	  console.log(`## clients: ${connections.length}. build result onEnd:`, result)
    connections.forEach((res) => res.write(JSON.stringify(result)));
  };
};
