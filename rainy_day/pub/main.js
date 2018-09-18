document.addEventListener("DOMContentLoaded", main)

function main() {
  if (console) console.log('running main')

  // github refers to usernames as login
  const defaultLogin = 'nicholasgriffen'
  const defaultRepo = 'digijan'

  if (!load('login') && !load('repo')) {
    // make sure saves happen before readme is shown
    Promise.resolve(saveDefaults(defaultLogin, defaultRepo))
      .then(showReadMe())
  }

  document.getElementById("showReadMe").addEventListener("click", showReadMe)

  document.getElementById("login-form").addEventListener("submit", (event) => {
    event.preventDefault()
    let login = document.getElementById("login").value

    // if login is valid, save user and find a repo
    github.client.validateUser(login)
      .then(() => save('login', login))
      .then(() => github.client.getRepos(login))
      .then(res => save('repo', res[0].name))
      .catch(e => window.alert(e.message))
  })
}

function save(label, thing) {
  localStorage.setItem(`${label}`, JSON.stringify(thing))
}

function load(label) {
  return JSON.parse(localStorage.getItem(`${label}`))
}

function saveDefaults(defaultLogin, defaultRepo) {
  save('login', defaultLogin)
  save('repo', defaultRepo)
}

function showReadMe() {
  const readMeContainer = document.getElementById("readMeContainer")

  // only change the text if a readme is found
  getReadMe(load('login'), load('repo'))
    .then((readMe) => {
      readMeContainer.innerText = readMe
    })
    .catch(e => window.alert(e.message))
}

function getReadMe(login, repo) {
  const localReadMe = load(`${repo}-readMe`)

  // return promise-wrapped local value to support .then chaining
  if (localReadMe) {
    return Promise.resolve(localReadMe)
  } else {
    return github.client.getReadMe(login, repo)
      .then((text) => {
        save(`${repo}-readMe`, text)
        return load(`${repo}-readMe`)
      })
  }
}
