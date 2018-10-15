const { expect } = require('chai')
const { defaultLogin, defaultRepo, testRepo } = require('./config.js')
describe('rainy-day', () => {
  after(() => {
    localStorage.removeItem('savetest')
    localStorage.removeItem('loadtest')
    localStorage.removeItem('login')
    localStorage.removeItem('repo')
    localStorage.removeItem(`${defaultRepo.name}-readMe`)
    localStorage.removeItem(`${defaultRepo.name}-readMe-sha`)
    localStorage.removeItem(`${defaultRepo.name}-readMe-path`)
    localStorage.removeItem(`${testRepo}-readMe`)
    localStorage.removeItem(`${testRepo}-readMe-sha`)
    localStorage.removeItem(`${testRepo}-readMe-path`)
  })

  describe('main', () => {
    if (console) console.log('testing main')

    it('saves a default github login and repo', () => {
      expect(load('login')).to.equal(defaultLogin)
      expect(load('repo').name).to.equal(defaultRepo.name)
      expect(load('repo').description).to.equal(defaultRepo.description)
    })

    it('saves a readme at the click of a button', () => {
      // let readMeButton = document.getElementById("showReadMe")
      // let editorContainer = document.getElementById("editorContainer")
      // // test fails without the Promise wrapper because innerText is read
      // before the readme is loaded - readme is loaded async
      // Promise.resolve(readMeButton.click())
      //   .then(() => expect(editorContainer.innerText).to.not.be.empty)
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
})
