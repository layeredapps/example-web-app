/* eslint-env mocha */
global.applicationPath = __dirname
global.testConfiguration = global.testConfiguration || {}
global.applicationServer = global.testConfiguration.applicationServer = `http://localhost:${process.env.APPLICATION_SERVER_PORT}`
global.applicationServerPort = global.testConfiguration.applicationServerPort = process.env.APPLICATION_SERVER_PORT
global.applicationServerToken = global.testConfiguration.applicationServerToken = 'token'

module.exports = require('@layeredapps/organizations/test-helper.js')

const applicationServer = require('../application-server/main.js')

before(() => {
  delete (global.sitemap['/'])
  delete (global.sitemap['/home'])
})

beforeEach(async () => {
  await applicationServer.start(process.env.APPLICATION_SERVER_PORT, global.dashboardServer)
})

afterEach(applicationServer.stop)
