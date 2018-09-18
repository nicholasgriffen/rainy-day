// UTILITY //
function save(label, thing) {
  localStorage.setItem(`${label}`, JSON.stringify(thing))
}

function load(label) {
  return JSON.parse(localStorage.getItem(`${label}`))
}

// GITHUB CLIENT //
// AUTHORIZATION REQUIRES A TOKEN //
const github = {
  client: {
    api: `https://api.github.com/`,
    options: {
      headers: {
        Accept: `application/vnd.github.v3+json`,
        // COMMENT TO DISABLE AUTHORIZATION //
        Authorization: `token ${load('auth')}`,
      },
    },
    setupRequest(endpoint, { api, options } = this) {
      // return a function to delay execution. fetch seemed to execute an extra
      // time during testing when it wasn't wrapped in a function
      return () => fetch(`${api}${endpoint}`, options)
        .then((res) => {
          if (res.status !== 200) {
            return Promise.reject(new Error(`!200 Status Code: ${res.status}`))
          }
          return res.json()
        })
    },

    validateUser(login) {
      // make request to users/login
      const request = github.client.setupRequest(`users/${login}`)
      return request()
        .catch(e => Promise.reject(new Error('User? Not yet.')))
    },

    getRepos(login) {
      // make request to users/login/repos
      const request = github.client.setupRequest(`users/${login}/repos`)
      return request()
        .catch(e => Promise.reject(new Error('Repos? Not yet.')))
    },

    getRepo(login, repo) {
      // make request to repos/login/repo
      const request = github.client.setupRequest(`repos/${login}/${repo}`)
      return request()
        .catch(e => Promise.reject(new Error('Repo? Not yet.')))
    },

    getReadMe(login, repo) {
      // make request to repos/login/repo/readme
      // then decode response.content with atob()
      const request = github.client.setupRequest(`repos/${login}/${repo}/readme`)
      return request()
        .then(res => atob(res.content))
        .catch(e => Promise.reject(new Error('README? Not yet.')))
    },
  },
}

// DOM //
// need to access codemirror editor globally
let editor
document.addEventListener("DOMContentLoaded", main)

function main() {
  if (console) console.log('running main')

  // github refers to usernames as login
  const defaultLogin = 'nicholasgriffen'
  const defaultRepo = 'rainy-day'
  //
  if (!load('login') && !load('repo')) {
    saveDefaults(defaultLogin, defaultRepo)
  }

  setRepoName(load('repo'))
  loadCodeMirror(document.getElementById("editorContainer"))
  setEventListeners()

  function setEventListeners() {
    document.getElementById("showReadMe").addEventListener("click", showReadMe)
    document.getElementById("login-form").addEventListener("submit", validateUserSaveRepos)
  }

  function validateUserSaveRepos(event) {
    event.preventDefault()
    let login = document.getElementById("login").value

    // if login is valid, save user and find a repo
    github.client.validateUser(login)
      .then(() => save('login', login))
      .then(() => github.client.getRepos(login))
      .then(repos => save('repos', repos))
      .catch(e => window.alert(e.message))
  }
}

function loadCodeMirror(editorContainer) {
  editor = CodeMirror(editorContainer)
  setCodeMirrorText(load(`${load('repo')}-readMe`) || 'Make a README :)')
}

function setCodeMirrorText(value = 'Make a README :)') {
  editor.setValue(value)
}

function setRepoName(name) {
  document.getElementById("repoName").innerText = `${load('login')}/${name}`
}

function saveDefaults(defaultLogin, defaultRepo) {
  save('login', defaultLogin)
  save('repo', defaultRepo)
}

function showReadMe() {
  // only change the text if a readme is found
  getReadMe(load('login'), load('repo'))
    .then((readMe) => {
      save('cm-text', editor.getValue())
      setRepoName(load('repo'))
      setCodeMirrorText(readMe)
    })
    .catch((e) => {
      save('cm-text', editor.getValue())
      setRepoName(load('repo'))
      setCodeMirrorText('Make a README :)')
    })
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
