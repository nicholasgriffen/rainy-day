const { expect } = chai
const defaultLogin = 'nicholasgriffen'
const defaultRepo = 'digijan'
let myDomElement

describe('main', () => {
  if (console) console.log('testing main')

  before(() => {
    window.document.dispatchEvent(new Event("DOMContentLoaded", {
      bubbles: true,
      cancelable: true,
    }))
  })

  after(() => {
    localStorage.removeItem('savetest')
    localStorage.removeItem('loadtest')
    localStorage.removeItem('login')
    localStorage.removeItem('repo')
    localStorage.removeItem(`${defaultRepo}-readMe`)
  })

  it('saves a default github login and repo', () => {
    expect(load('login')).to.equal(defaultLogin)
    expect(load('repo')).to.equal(defaultRepo)
  })

  it('displays a readme at the click of a button', () => {
    let readMeButton = document.getElementById("showReadMe")
    let readMeContainer = document.getElementById("readMeContainer")
    // test fails without the Promise wrapper because innerText is read
    // before the readme is loaded - readme is loaded async
    Promise.resolve(readMeButton.click())
      .then(() => expect(readMeContainer.innerText).to.not.be.empty)
  })

  describe('#save', () => {
    it('is a function', () => {
      expect(save).to.be.a('function')
    })

    it('puts key in localStorage with value', () => {
      save('savetest', 'savetest')
      expect(JSON.parse(localStorage.getItem('savetest'))).to.equal('savetest')
    })
  })

  describe('#load', () => {
    it('is a function', () => {
      expect(load).to.be.a('function')
    })

    it('gets value from localStorage with key', () => {
      localStorage.setItem('loadtest', JSON.stringify('loadtest'))
      expect(load('loadtest')).to.equal('loadtest')
    })
  })
})

describe('github client', () => {
  it('is an object', () => {
    expect(github.client).to.be.an('object')
  })

  it('with an api string', () => {
    expect(github.client.api).to.be.a('string')
  })

  it('an options object', () => {
    expect(github.client.options).to.be.an('object')
  })

  it('a setupRequest method', () => {
    expect(github.client.setupRequest).to.be.a('function')
  })

  it('a validateUser method', () => {
    expect(github.client.validateUser).to.be.a('function')
  })

  it('a getRepos method', () => {
    expect(github.client.getRepos).to.be.a('function')
  })

  it('a getRepo method', () => {
    expect(github.client.getRepo).to.be.a('function')
  })

  it('a getReadMe method', () => {
    expect(github.client.getReadMe).to.be.a('function')
  })

  describe('#github.client.setupRequest takes a github api endpoint string', () => {
    let request
    let noRequest

    before(() => {
      request = github.client.setupRequest(`users/nicholasgriffen/repos`)
      noRequest = github.client.setupRequest(`-invalid-`)
    })

    it('returns a function', () => {
      expect(request).to.be.a('function')
    })

    it('that returns a promise', () => {
      expect(request()).to.be.a('promise')
    })

    it('that throws `!200 Status Code:` on response with !200 status code', () => noRequest()
      .catch((e) => {
        let testExp = new RegExp(`!200 Status Code:`)

        return expect(testExp.test(e.message)).to.equal(true)
      }))

    it('that throws an error when it fails', () => noRequest()
      .catch(e => expect(e).to.be.an('error')))
  })

  describe('#github.client.validateUser takes a github login string', () => {
    let user
    let noUser

    before(() => {
      user = github.client.validateUser(defaultLogin)
      // github username cannot start or end with hyphen per github.com/join
      noUser = github.client.validateUser('-invalid-')
    })

    it('returns a promise', () => {
      expect(user).to.be.a('promise')
    })

    it('that resolves to an object containing the login when user is valid', () => user
      .then(res => expect(res.login).to.equal(defaultLogin)))

    it('that throws "User? Not yet." when it fails', () => noUser
      .catch(e => expect(e.message).to.equal('User? Not yet.')))
  })

  describe('#github.client.getRepos takes a github login string', () => {
    let repos
    let noRepos

    before(() => {
      repos = github.client.getRepos(defaultLogin)
      noRepos = github.client.getRepos('-invalid-')
    })

    it('returns a promise', () => {
      expect(repos).to.be.a('promise')
    })

    it('that resolves to array with one or more object.archive_url matching/repos/login', () => repos
      .then((res) => {
        let testExp = new RegExp(`/repos/${defaultLogin}`)

        expect(res).to.be.an('array')
        return expect(testExp.test(res[0].archive_url)).to.equal(true)
      }))

    it('that throws "Repos? Not yet." when it fails', () => noRepos
      .catch(e => expect(e.message).to.equal('Repos? Not yet.')))
  })

  describe('#github.client.getRepo takes a github login string and a repo name string', () => {
    let repo
    let noRepo

    before(() => {
      repo = github.client.getRepo(defaultLogin, defaultRepo)
      noRepo = github.client.getRepo('-invalid-', '-invalid-')
    })

    it('returns a promise', () => {
      expect(repo).to.be.a('promise')
    })

    it('that resolves to an object with .owner.login matching login', () => repo
      .then(res => expect(res.owner.login).to.equal(defaultLogin)))

    it('that throws "Repo? Not yet." when it fails', () => noRepo
      .catch(e => expect(e.message).to.equal('Repo? Not yet.')))
  })

  describe('#github.client.getReadMe takes a github login string and a repo name string', () => {
    let readMe
    let noReadMe

    before(() => {
      readMe = github.client.getReadMe(defaultLogin, defaultRepo)
      noReadMe = github.client.getReadMe(defaultLogin, '-invalid-')
    })

    it('returns a promise', () => {
      expect(readMe).to.be.a('promise')
    })

    it('that resolves to a non-empty string', () => readMe
      .then(res => expect(res).not.be.empty))

    it('that throws "README? Not yet." when it fails', () => noReadMe
      .catch(e => expect(e.message).to.equal('README? Not yet.')))
  })
})
