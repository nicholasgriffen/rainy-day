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
      request = github.client.request()
    })

    it('returns a promise when called with default parameters', () => {
      expect(request).to.be.a('promise')
    })

    it('that resolves to a array', () => {
      return request
        .then(res => expect(res).to.be.an('array'))
    })
  })
})
