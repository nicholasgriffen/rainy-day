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
    setupRequest(endpoint, options = github.client.options) {
      console.log(options)
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

    sendFile(login, repo, path, body) {
      // PUT /repos/:owner/:repo/contents/:path
      const options = {
        method: "PUT",
        headers: {
          Accept: `application/vnd.github.v3+json`,
          Authorization: `token ${load('auth')}`,
          "Content-Type": "application/json; charset=utf-8",
        },
        body,
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
  if (console) console.log('running main')
  // github refers to usernames as login
  const defaultLogin = 'nicholasgriffen'
  const defaultRepo = {
    name: 'rainy-day',
    description: 'Enter a github username to retrieve public repos for that user',
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
  document.getElementById("saveReadMe").addEventListener("click", saveReadMe)
  document.getElementById("changeRepo").addEventListener("change", changeRepo)
  document.getElementById("login-form").addEventListener("submit", validateUserShowReadMe)
}

function loadCodeMirror(editorContainer) {
  editor = CodeMirror(editorContainer, {
    mode: "gfm",
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
      let repo = load('repo')
      // save('cm-text', editor.getValue())
      setRepoName(repo.name)
      if (repo.description) {
        setRepoDescription(repo.description)
      } else {
        setRepoDescription('')
      }
      setCodeMirrorText(atob(readMe))
    })
    .catch((e) => {
      let repo = load('repo')

      setRepoName(repo.name)
      if (repo.description) {
        setRepoDescription(repo.description)
      }
      save(`${repo.name}-readMe`, btoa('Make a README :)'))
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
        return readMe.content
      })
  }
}

function buildOptions() {
  document.getElementById('changeRepo').innerHTML = `<option value="">Change Repo</option>`
  load('repos').forEach((repo, index) => {
    document.getElementById('changeRepo').innerHTML += `<option value=${index}>${repo.name}</option>`
  })
}

function changeRepo(event) {
  console.log('change repo')
  // pull repo out of repos
  let { name, description } = load('repos')[event.target.value]
  // save repo
  save('repo', { name, description: })
  // show readMe, set name, set description
  showReadMe()
  setRepoName(load('repo').name)
  if (load('repo').description) {
    setRepoDescription(load('repo').description)
  } else {
    setRepoDescription('')
  }
}

function saveReadMe(commit) {
  // get editor contents
  // base64 encode and save to local storage
  // load path and sha
  // build body
  const content = btoa(editor.getValue())
  const login = load('login')
  const repo = load('repo').name
  const path = load(`${repo}-readMe-path`) || 'README.md'
  const sha = load(`${repo}-readMe-sha`)
  const body = {
    message: "made via api",
    committer: {
      name: "nicholasgriffen",
      email: "nicholas.s.griffen@gmail.com",
    },
    content,
  }

  save(`${repo}-readMe`, content)
  // if there is a sha add to body
  if (sha) {
    body.sha = sha
  }
  github.client.sendFile(login, repo, path, JSON.stringify(body))
    .then((res) => {
      save(`${repo}-readMe-sha`, res.content.sha)
      document.getElementById('saveStatus').innerText = 'Saved to github'
      console.log(res)
    })
    .catch(() => document.getElementById('saveStatus').innerText = 'Saved locally')
}
