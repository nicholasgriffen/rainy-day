const { expect } = require('chai')
const github = require('../lib/github')

const { defaultLogin, defaultRepo, testRepo } = require('./config.js')

describe('github client', () => {
  it('is an object', () => {
    expect(github.client).to.be.an('object')
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

  it('a getReadMe method', () => {
    expect(github.client.getReadMe).to.be.a('function')
  })

  it('a sendFile method', () => {
    expect(github.client.sendFile).to.be.a('function')
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

    it('that throws `!20x Status Code:` on response with !20x status code', () => noRequest()
      .catch((e) => {
        let testExp = new RegExp(`!20x Status Code:`)

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

    it('that throws "github user not found" when it fails', () => noUser
      .catch(e => expect(e.message).to.equal('github user not found')))
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

  describe('#github.client.getReadMe takes a github login string and a repo name string', () => {
    let readMe
    let noReadMe

    before(() => {
      readMe = github.client.getReadMe(defaultLogin, testRepo)
      noReadMe = github.client.getReadMe(defaultLogin, '-invalid-')
    })

    it('returns a promise', () => {
      expect(readMe).to.be.a('promise')
    })

    it('that resolves to a non-empty string', () => readMe
      .then((res) => {
        let { content, sha, path } = res

        save(`${testRepo}-readMe`, content)
        save(`${testRepo}-readMe-sha`, sha)
        save(`${testRepo}-readMe-path`, path)

        return expect(res).not.be.empty
      }))

    it('that throws "README? Not yet." when it fails', () => noReadMe
      .catch(e => expect(e.message).to.equal('README? Not yet.')))
  })

  describe('#github.client.sendFile takes a login, a repo name, a file path string, and a body JSON string', () => {
    let file
    let noFile

    before(() => {
      let repo = testRepo
      let content = btoa(`Added by test runner`)
      let sha = load(`${repo}-readMe-sha`)
      let path = load(`${repo}-readMe-path`)
      let body = {
        message: "made by test suite",
        committer: {
          name: "nicholasgriffen",
          email: "nicholas.s.griffen@gmail.com",
        },
        content,
        sha,
      }
      file = github.client.sendFile(defaultLogin, repo, path, JSON.stringify(body))
      noFile = github.client.sendFile(defaultLogin, repo, path, body)
    })

    it('resolves to an object with non-empty commit and content keys', () => file
      .then(res => (expect(res.content).not.be.empty && expect(res.commit).not.be.empty)))

    it('throws an error if it fails', () => noFile
      .catch(e => expect(e).to.be.an('error'))
    )
  })
})