const { expect } = chai

describe('github client', () => {
  const username = "nicholasgriffen"
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
    expect(github.client.setupRequest).to.not.throw()
  })

  it('a getRepos method', () => {
    expect(github.client.getRepos).to.not.throw()
  })

  it('a getReadMe method', () => {
    expect(github.client.getReadMe).to.not.throw()
  })

  describe('#github.client.setupRequest takes a github api endpoint string', () => {
    let request
    before(() => {
      request = github.client.setupRequest(`users/nicholasgriffen/repos`)
    })

    it('returns a function', () => {
      expect(request).to.be.a('function')
    })

    it('that returns a promise', () => {
      expect(request()).to.be.a('promise')
    })
  })

  describe('#github.client.getRepos takes a github username string', () => {
    const testExp = new RegExp(`/repos/${username}`)
    let repos
    before(() => {
      repos = github.client.getRepos(username)
    })

    it('returns a promise', () => {
      expect(repos).to.be.a('promise')
    })

    it('that resolves to an array containing at least one object tagged with a url matching /repos/username', () => repos
      .then((res) => {
        expect(res).to.be.an('array')
        return expect(testExp.test(res[0].archive_url)).to.equal(true)
      }))
  })

  describe('#github.client.getReadMe takes a github username string and a repo name string', () => {
    let readme
    before(() => {
      readme = github.client.getReadMe(username, repo)
    })
    it('returns a promise', () => {
      expect(readme).to.be.a('promise')
    })
  })
})
