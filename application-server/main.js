global.keyLength = parseInt(process.env.KEY_LENGTH || '10', 10)
global.maxLength = parseInt(process.env.MAX_LENGTH || '9999999', 10)
global.publicDomain = process.env.PUBLIC_DOMAIN || false
global.dashboardServer = global.dashboardServer || process.env.DASHBOARD_SERVER
global.applicationServer = global.applicationServer || process.env.APPLICATION_SERVER
global.applicationServerToken = global.applicationServerToken || process.env.APPLICATION_SERVER_TOKEN

const Document = require('./src/document.js')
let server
module.exports = {
  start: async (port) => {
    if (server) {
      if (server.stop) {
        await server.stop()
        server = null
      }
    }
    await Document.start()
    server = require('./src/server.js')
    port = port || process.env.APPLICATION_SERVER_PORT || process.env.PORT || 3000
    await server.start(port, process.env.HOST || 'localhost')
  },
  stop: async () => {
    await server.stop()
    server = null
  }
}

if (process.env.START_APPLICATION_SERVER !== 'false') {
  module.exports.start()
}
