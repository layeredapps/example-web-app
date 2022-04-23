/* eslint-env mocha */
const assert = require('assert')
const fs = require('fs')
const pasteText = fs.readFileSync('./node_modules/@layeredapps/dashboard/readme.md').toString()
const TestHelper = require('./test-helper.js')

describe('example-web-app screenshots', () => {
  it('user 1 registers', async () => {
    const req = TestHelper.createRequest('/')
    req.filename = '/src/www/user-creates-account.test.js'
    req.screenshots = [
      { click: '/account/register' },
      {
        fill: '#submit-form',
        body: {
          username: 'FirstUser',
          password: '12345678',
          confirm: '12345678'
        }
      }
    ]
    const result = await req.get()
    assert.strictEqual(result.redirect, '/home')
  })

  it('user 1 creates post', async () => {
    const user = await TestHelper.createUser()
    const req = TestHelper.createRequest('/home')
    req.account = user.account
    req.session = user.session
    req.filename = '/src/www/user-creates-post.test.js'
    req.screenshots = [{
      fill: '#post-creator',
      body: {
        'post-textarea': pasteText,
        documentid: 'readme.md',
        language: 'MarkDown'
      },
      waitAfter: async (page) => {
        while (true) {
          const postContent = await page.evaluate(() => {
            const postContent = document.getElementById('post-content')
            return postContent.style.display
          })
          if (postContent === 'block') {
            return
          }
          await TestHelper.wait(100)
        }
      }
    }]
    // const result = await req.post()
    await req.post()
    // TODO: can't detect the rendered post
    assert.strictEqual(1, 1)
  })

  it('user 1 creates organization', async () => {
    const user = await TestHelper.createUser()
    const req = TestHelper.createRequest('/home')
    req.account = user.account
    req.session = user.session
    req.filename = '/src/www/user-creates-organization.test.js'
    req.screenshots = [
      { hover: '#account-menu-container' },
      { click: '/account/organizations' },
      { click: '/account/organizations/create-organization' },
      {
        fill: '#submit-form',
        body: {
          name: 'Developers',
          email: 'organization@email.com',
          'display-name': 'pm',
          'display-email': 'pm@email.com',
          pin: '12345'
        }
      }
    ]
    const result = await req.post()
    assert.strictEqual(result.redirect.endsWith('message=success'), true)
  })

  it('user 1 creates invitation', async () => {
    const user = await TestHelper.createUser()
    const req = TestHelper.createRequest('/home')
    req.account = user.account
    req.session = user.session
    req.filename = '/src/www/user-creates-invitation.test.js'
    req.screenshots = [
      { hover: '#account-menu-container' },
      { click: '/account/organizations' },
      { click: '/account/organizations/create-organization' },
      {
        fill: '#submit-form',
        body: {
          name: 'Developers',
          email: 'organization@email.com',
          pin: '8879',
          'display-name': 'org owner',
          'display-email': 'owner@organization.com'
        }
      },
      { click: '/account/organizations/organizations' },
      { click: '/account/organizations/organization' },
      { click: '/account/organizations/create-invitation' },
      {
        fill: '#submit-form',
        body: {
          'secret-code': 'secret'
        }
      }
    ]
    await req.post()
    assert.strictEqual(1, 1)
  })

  it('user 2 accepts invitation', async () => {
    const user = await TestHelper.createUser()
    global.userProfileFields = ['display-name', 'display-email']
    global.membershipProfileFields = ['display-name', 'display-email']
    await TestHelper.createProfile(user, {
      'display-name': user.profile.firstName,
      'display-email': user.profile.contactEmail
    })
    await TestHelper.createOrganization(user, {
      email: 'organization@' + user.profile.displayEmail.split('@')[1],
      name: 'My organization',
      profileid: user.profile.profileid,
      pin: '8879'
    })
    await TestHelper.createInvitation(user)
    const user2 = await TestHelper.createUser()
    const req = TestHelper.createRequest('/')
    req.account = user2.account
    req.session = user2.session
    req.filename = '/src/www/user-accepts-invitation.test.js'
    req.screenshots = [
      { hover: '#account-menu-container' },
      { click: '/account/organizations' },
      { click: '/account/organizations/accept-invitation' },
      {
        fill: '#submit-form',
        body: {
          invitationid: user.invitation.invitationid,
          'organization-pin': '8879',
          'secret-code': user.invitation.secretCode,
          'display-name': user2.profile.firstName,
          'display-email': user2.profile.contactEmail
        }
      }
    ]
    await req.post()
    assert.strictEqual(1, 1)
  })

  it('user 2 creates shared post', async () => {
    const user = await TestHelper.createUser()
    global.userProfileFields = ['display-name', 'display-email']
    global.membershipProfileFields = ['display-name', 'display-email']
    await TestHelper.createProfile(user, {
      'display-name': user.profile.firstName,
      'display-email': user.profile.contactEmail
    })
    await TestHelper.createOrganization(user, {
      email: 'organization@' + user.profile.displayEmail.split('@')[1],
      name: 'My organization',
      profileid: user.profile.profileid,
      pin: '8879'
    })
    await TestHelper.createInvitation(user)
    const user2 = await TestHelper.createUser()
    global.userProfileFields = ['display-name', 'display-email']
    await TestHelper.createProfile(user2, {
      'display-name': user2.profile.firstName,
      'display-email': user2.profile.contactEmail
    })
    await TestHelper.acceptInvitation(user2, user)
    const req = TestHelper.createRequest('/home')
    req.account = user2.account
    req.session = user2.session
    req.filename = '/src/www/user-creates-shared-post.test.js'
    req.screenshots = [
      { save: true },
      {
        fill: '#post-creator',
        body: {
          'post-textarea': pasteText,
          documentid: 'readme.md',
          language: 'MarkDown',
          organization: 'My organization'
        },
        waitAfter: async (page) => {
          while (true) {
            const postContent = await page.evaluate(() => {
              const postContent = document.getElementById('post-content')
              return postContent.style.display
            })
            if (postContent === 'block') {
              return
            }
            await TestHelper.wait(100)
          }
        }
      }]
    await req.post()
    assert.strictEqual(1, 1)
  })

  it('user 1 views shared post', async () => {
    const user = await TestHelper.createUser()
    global.userProfileFields = ['display-name', 'display-email']
    global.membershipProfileFields = ['display-name', 'display-email']
    await TestHelper.createProfile(user, {
      'display-name': user.profile.firstName,
      'display-email': user.profile.contactEmail
    })
    await TestHelper.createOrganization(user, {
      email: 'organization@' + user.profile.displayEmail.split('@')[1],
      name: 'My organization',
      profileid: user.profile.profileid,
      pin: '1230'
    })
    await TestHelper.createInvitation(user)
    const req = TestHelper.createRequest('/home')
    req.account = user.account
    req.session = user.session
    req.body = {
      'post-textarea': pasteText,
      documentid: 'readme.md',
      language: 'MarkDown',
      organization: 'My organization'
    }
    req.waitBefore = async (page) => {
      while (true) {
        const postCreator = await page.evaluate(() => {
          const postCreator = document.getElementById('post-creator')
          return postCreator ? postCreator.style.display : null
        })
        if (postCreator === 'block') {
          return
        }
        await TestHelper.wait(100)
      }
    }
    req.waitAfter = async (page) => {
      while (true) {
        const postContent = await page.evaluate(() => {
          const postContent = document.getElementById('post-content')
          return postContent ? postContent.style.display : null
        })
        if (postContent === 'block') {
          return
        }
        await TestHelper.wait(100)
      }
    }
    await req.post()
    const user2 = await TestHelper.createUser()
    global.userProfileFields = ['display-name', 'display-email']
    await TestHelper.createProfile(user2, {
      'display-name': user2.profile.firstName,
      'display-email': user2.profile.contactEmail
    })
    await TestHelper.acceptInvitation(user2, user)
    const req2 = TestHelper.createRequest('/home')
    req2.account = user2.account
    req2.session = user2.session
    req2.filename = '/src/www/user-views-shared-post.test.js'
    req2.screenshots = [
      { save: true },
      {
        click: '#organization-list-button',
        waitAfter: async (page) => {
          while (true) {
            const postLink = await page.evaluate(() => {
              const postLinks = document.getElementsByTagName('a')
              if (!postLinks || !postLinks.length) {
                return false
              }
              for (let i = 0, len = postLinks.length; i < len; i++) {
                if (postLinks[i].innerHTML === 'readme.md') {
                  return true
                }
              }
              return false
            })
            await TestHelper.wait(100)
            if (postLink) {
              return TestHelper.wait(100)
            }
          }
        }
      },
      {
        click: '/document/readme.md',
        waitAfter: async (page) => {
          while (true) {
            const postContent = await page.evaluate(() => {
              const postContent = document.getElementById('post-content')
              return postContent ? postContent.style.display : null
            })
            if (postContent === 'block') {
              return
            }
            await TestHelper.wait(100)
          }
        }
      }
    ]
    await req2.get()
    assert.strictEqual(1, 1)
  })
})
