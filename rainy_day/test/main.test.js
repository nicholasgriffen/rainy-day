describe('main', () => {
  before(() => {
    window.document.dispatchEvent(new Event("DOMContentLoaded", {
      bubbles: true,
      cancelable: true,
    }))
    save('login', 'nicholasgriffen')
    save('repo', 'digijan')
  })

  after(() => {
    localStorage.removeItem('savetest')
    localStorage.removeItem('loadtest')
    localStorage.removeItem('login')
    localStorage.removeItem('repo')
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
