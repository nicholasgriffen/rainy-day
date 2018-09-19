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
    options: {
      headers: {
        Accept: `application/vnd.github.v3+json`,
        // COMMENT TO DISABLE AUTHORIZATION //
        Authorization: `token ${load('auth')}`,
      },
    },
    setupRequest(endpoint, { options } = github.client) {
      const api = `https://api.github.com/`
      // return a function to delay execution. fetch seemed to execute an extra
      // time during testing when it wasn't wrapped in a function
      return () => fetch(`${api}${endpoint}`, options)
        .then((res) => {
          if (!/20*/.test(res.status)) {
            return Promise.reject(new Error(`!20x Status Code: ${res.status}`))
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

    getReadMe(login, repo) {
      // make request to repos/login/repo/readme
      // then decode response.content with atob()
      const request = github.client.setupRequest(`repos/${login}/${repo}/readme`)
      return request()
        .catch(e => Promise.reject(new Error('README? Not yet.')))
    },

    // get sha if updating
    // let sha = load(`${repo}-readMe-sha`)

    createFile(login = load('login'), repo = load('repo'), path = 'README.md') {
      // PUT /repos/:owner/:repo/contents/:path
      let options = {
        method: "PUT",
        headers: {
          Accept: `application/vnd.github.v3+json`,
          Authorization: `token ${load('auth')}`,
          "Content-Type": "application/json; charset=utf-8",
        },
      }
      options.body = JSON.stringify({
        message: "made via api",
        committer: {
          name: "nicholasgriffen",
          email: "nicholas.s.griffen@gmail.com",
        },
        content: btoa('This is a test'),
      })
      return github.client.setupRequest(`repos/${login}/${repo}/contents/${path}`, { options, api: `https://api.github.com/` })
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
  if (!load('login')) {
    saveDefaults(defaultLogin, defaultRepo)
  }

  setRepoName(load('repo'))
  loadCodeMirror(document.getElementById("editorContainer"))
  setEventListeners()

  function setEventListeners() {
    document.getElementById("showReadMe").addEventListener("click", showReadMe)
    document.getElementById("login-form").addEventListener("submit", validateUserShowReadMe)
  }

  function validateUserShowReadMe(event) {
    event.preventDefault()
    let login = document.getElementById("login").value
    // only do stuff if user input is a new login
    if (login !== load('login')) {
      // if login is valid, save it and get repos,
      // save repos, save first repo as repo
      // show readme
      github.client.validateUser(login)
        .then(() => github.client.getRepos(login))
        .then((repos) => {
          save('repos', repos)
          save('login', login)
          save('repo', repos[0].name)
          showReadMe()
        })
        .catch(e => window.alert(e.message))
    }
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
  loadReadMe(load('login'), load('repo'))
    .then((readMe) => {
      // save('cm-text', editor.getValue())
      setRepoName(load('repo'))
      setCodeMirrorText(atob(readMe))
    })
    .catch((e) => {
      let repo = load('repo')
      // save('cm-text', editor.getValue())
      setRepoName(repo)
      save(`${repo}-readMe`, btoa('Make a README :)'))
      setCodeMirrorText('Make a README :)')
    })
}

function loadReadMe(login, repo) {
  const localReadMe = load(`${repo}-readMe`)

  // return promise-wrapped local value to support .then chaining
  if (localReadMe) {
    return Promise.resolve(localReadMe)
  } else {
    return github.client.getReadMe(login, repo)
      .then((readMe) => {
        save(`${repo}-readMe`, readMe.content)
        save(`${repo}-readMe-sha`, readMe.sha)
        save(`${repo}-readMe-path`, readMe.path)
        return readMe.content)
      })
  }
}
