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

  it('a getRepos method', () => {
    expect(github.client.getRepos).to.be.a('function')
  })

  it('a getReadMe method', () => {
    expect(github.client.getReadMe).to.be.a('function')
  })

  it('a validateUser method', () => {
    expect(github.client.validateUser).to.be.a('function')
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

  describe('#github.client.getRepos takes a github login string', () => {
    const testExp = new RegExp(`/repos/${defaultLogin}`)
    let repos

    before(() => {
      repos = github.client.getRepos(defaultLogin)
      noRepos = github.client.getRepos('-invalid-')
    })

    it('returns a promise', () => {
      expect(repos).to.be.a('promise')
    })

    it('that resolves to array with one or more object tagged with archive_url matching/repos/login', () => repos
      .then((res) => {
        expect(res).to.be.an('array')
        return expect(testExp.test(res[0].archive_url)).to.equal(true)
      }))

    it('that throws an error when it fails', () => noRepos
      .catch(e => expect(e).to.be.an('error')))
  })

  describe('#github.client.getReadMe takes a github login string and a repo name string', () => {
    let readMe
    let noReadMe

    before(() => {
      readMe = github.client.getReadMe(defaultLogin, defaultRepo)
      noReadMe = github.client.getReadMe(defaultLogin, 'rainy-day')
    })

    it('returns a promise', () => {
      expect(readMe).to.be.a('promise')
    })

    it('that resolves to a non-empty string', () => readMe
      .then(res => expect(res).not.be.empty))

    it('throws "README? Not yet." when it fails', () => noReadMe
      .catch(e => expect(e.message).to.equal("README? Not yet.")))
  })

  describe('#github.client.validateUser takes a github login string', () => {
    let valid
    let invalid

    before(() => {
      valid = github.client.validateUser(defaultLogin)
      // github username cannot start or end with hyphen per github.com/join
      invalid = github.client.validateUser('-invalid-')
    })

    it('returns a promise', () => {
      expect(valid).to.be.a('promise')
    })

    it('resolves to an object containing the login when user is valid', () => valid
      .then(res => expect(res.login).to.equal(defaultLogin)))

    it('throws "User not found" when user is not valid', () => invalid
      .catch(e => expect(e.message).to.equal('User not found')))
  })
})
