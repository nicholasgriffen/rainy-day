const { expect } = chai
const defaultLogin = 'nicholasgriffen'
const defaultRepo = 'digijan'
describe('main', () => {
  if (console) console.log('testing main')

  before(() => {
    localStorage.removeItem('login')
    localStorage.removeItem('repo')

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
