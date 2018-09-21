// UTILITY //
function save(label, thing) {
  localStorage.setItem(`${label}`, JSON.stringify(thing))
}

function load(label) {
  return JSON.parse(localStorage.getItem(`${label}`))
}

// GITHUB CLIENT //
// AUTHORIZATION TOKEN LOADED FROM LOCALSTORAGE //
const github = {
  client: {
    options: {
      headers: {
        Accept: `application/vnd.github.v3+json`,
      },
    },
    setupRequest(endpoint, options = github.client.options) {
      console.log('github.client.setupRequest options', options)
      const api = `https://api.github.com/`
      const token = load('auth')
      if (token) {
        options.headers.Authorization = `token ${token}`
      }
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
      // GET users/login
      const request = github.client.setupRequest(`users/${login}`)
      return request()
        .catch(e => Promise.reject(new Error('User? Not yet.')))
    },

    getRepos(login) {
      // GET users/login/repos
      const request = github.client.setupRequest(`users/${login}/repos`)
      return request()
        .catch(e => Promise.reject(new Error('Repos? Not yet.')))
    },

    getReadMe(login, repo) {
      // GET repos/login/repo/readme
      const request = github.client.setupRequest(`repos/${login}/${repo}/readme`)
      return request()
        .catch(e => Promise.reject(new Error('README? Not yet.')))
    },

    sendFile(login, repo, path, body) {
      // PUT /repos/:owner/:repo/contents/:path
      const token = load('auth')
      const options = {
        method: "PUT",
        headers: {
          Accept: `application/vnd.github.v3+json`,
          "Content-Type": "application/json; charset=utf-8",
        },
        body,
      }
      if (token) {
        options.headers.Authorization = `token ${token}`
      }
      const request = github.client.setupRequest(`repos/${login}/${repo}/contents/${path}`, options)
      return request()
    },
  },
}

// DOM //
// need to access codemirror editor globally
let editor

document.addEventListener("DOMContentLoaded", main)

function main() {
  // github refers to usernames as login
  const defaultLogin = 'nicholasgriffen'
  const defaultRepo = {
    name: 'rainy-day',
    description: 'View, edit, and push github READMEs in the browser',
  }

  setDefaults(defaultLogin, defaultRepo)

  setRepoName(load('repo').name)

  if (load('repo').description) {
    setRepoDescription(load('repo').description)
  } else {
    setRepoDescription('')
  }

  loadCodeMirror(document.getElementById("editorContainer"))

  setEventListeners()
}

function setEventListeners() {
  document.getElementById("saveCommit").addEventListener("click", saveCommit)
  document.getElementById("changeRepo").addEventListener("change", changeRepo)
  document.getElementById("loginForm").addEventListener("submit", validateUserShowReadMe)
  document.getElementById("authForm").addEventListener("submit", saveAuth)
}

function loadCodeMirror(editorContainer) {
  editor = CodeMirror(editorContainer, {
    mode: "gfm",
    lineWrapping: true,
  })
  setCodeMirrorText(load(`${load('repo')}-readMe`) || 'Make a README :)')
}

function setCodeMirrorText(value = 'Make a README :)') {
  editor.setValue(value)
}

function setRepoName(name) {
  document.getElementById("repoName").innerText = `${load('login')}/${name}`
}

function setRepoDescription(description) {
  document.getElementById("repoDescription").innerText = `${description}`
}

function setDefaults(defaultLogin, defaultRepo) {
  if (!load('login')) {
    save('login', defaultLogin)
    save('repo', defaultRepo)
  }

  if (!load('repos')) {
    github.client.getRepos(load('login'))
      .then(repos => save('repos', repos))
      .then(() => buildOptions())
  }

  if (load('repos')) {
    buildOptions()
  }

  showReadMe()
}

function saveAuth(event) {
  event.preventDefault()
  let auth = document.getElementById("auth").value
  console.log('saving')
  save('auth', auth)
  document.getElementById('auth').value = ''
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
        save('repo', { name: repos[0].name, description: repos[0].description })

        showReadMe()

        buildOptions()
      })
      .catch(e => window.alert(e.message))
  }
}

function showReadMe() {
  // only change the text if a readme is found
  loadReadMe(load('login'), load('repo').name)
    .then((readMe) => {
      const { name, description } = load('repo')

      setRepoName(name)
      if (description) {
        setRepoDescription(description)
      } else {
        setRepoDescription('')
      }

      setCodeMirrorText(atob(readMe))
    })
    .catch((e) => {
      const { name, description } = load('repo')

      setRepoName(name)
      if (description) {
        setRepoDescription(description)
      }

      save(`${name}-readMe`, btoa('Make a README :)'))
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
        let { content, sha, path } = readMe

        save(`${repo}-readMe`, content)
        save(`${repo}-readMe-sha`, sha)
        save(`${repo}-readMe-path`, path)

        return content
      })
  }
}

function buildOptions() {
  document.getElementById('changeRepo').innerHTML = `<option value="">change repo</option>`
  load('repos').forEach((repo, index) => {
    document.getElementById('changeRepo').innerHTML += `<option value=${index}>${repo.name}</option>`
  })
}

function changeRepo(event) {
  // pull repo out of repos
  const { name, description } = load('repos')[event.target.value]
  // save repo
  save('repo', { name, description })
  document.getElementById('saveStatus').innerText = ''
  // show readMe, set name, set description
  showReadMe()
  setRepoName(load('repo').name)
  if (load('repo').description) {
    setRepoDescription(load('repo').description)
  } else {
    setRepoDescription('')
  }
}

function saveCommit(event) {
  event.preventDefault()

  const message = document.getElementById('commitMessage').value
  const name = document.getElementById('commiterName').value
  const email = document.getElementById('commiterEmail').value

  const commit = {
    message,
    commiter: {
      name,
      email,
    },
  }
  saveReadMe(commit)
}

function saveReadMe(commit) {
  // get editor contents
  // base64 encode and save to local storage
  // load path and sha
  // build body
  const { message, commiter } = commit
  const content = btoa(editor.getValue())
  const body = {
    message,
    commiter,
    content,
  }
  const login = load('login')
  const repo = load('repo').name
  const path = load(`${repo}-readMe-path`) || 'README.md'
  const sha = load(`${repo}-readMe-sha`)
  save(`${repo}-readMe`, content)
  // if there is a sha add to body
  if (sha) {
    body.sha = sha
  }
  github.client.sendFile(login, repo, path, JSON.stringify(body))
    .then((res) => {
      save(`${repo}-readMe-sha`, res.content.sha)
      document.getElementById('saveStatus').innerText = 'saved: github'
      console.log('saved to github', res)
    })
    .catch((e) => {
      console.log('saved locally', e)
      document.getElementById('saveStatus').innerText = 'saved: local'
    })
  document.getElementById('modalClose').click()
}
