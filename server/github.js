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
        .catch(e => Promise.reject(new Error('github user not found')))
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
