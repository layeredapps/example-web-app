/* eslint-env mocha */
global.applicationPath = __dirname
global.testConfiguration = global.testConfiguration || {}
global.applicationServer = global.testConfiguration.applicationServer = `http://localhost:${process.env.APPLICATION_SERVER_PORT}`
global.applicationServerPort = global.testConfiguration.applicationServerPort = process.env.APPLICATION_SERVER_PORT
global.applicationServerToken = global.testConfiguration.applicationServerToken = 'token'

module.exports = require('@layeredapps/organizations/test-helper.js')

const applicationServer = require('../application-server/main.js')

before(async () => {
  delete (global.sitemap['/'])
  delete (global.sitemap['/home'])
  await applicationServer.start(process.env.APPLICATION_SERVER_PORT, global.dashboardServer)
})

beforeEach(async () => {
  await applicationServer.flush()
})

after(async () => {
  await applicationServer.stop
})
