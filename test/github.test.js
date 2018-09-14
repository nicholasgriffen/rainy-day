const { expect } = chai

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

  it('and a request method', () => {
    expect(github.client.request).to.not.throw()
  })

  describe('#github.client.request', () => {
    let request
    before(() => {
      request = github.client.request(`users/nicholasgriffen/repos`)
    })

    it('returns a function', () => {
      expect(request).to.be.a('function')
    })

    it('that returns a promise', () => {
      expect(request()).to.be.a('promise')
    })

    it('that resolves to an array', () => request()
      .then(res => expect(res).to.be.an('array')))
  })
})
