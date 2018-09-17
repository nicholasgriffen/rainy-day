const github = {
  client: {
    api: `https://api.github.com/`,
    options: {
      headers: {
        Accept: `application/vnd.github.v3+json`,
      },
    },
    setupRequest(endpoint = `users/nicholasgriffen`, { api, options } = github.client) {
      // return a function to delay execution. fetch seemed to execute an extra
      // time during testing when it wasn't wrapped in a function
      return () => fetch(`${api}${endpoint}`, options)
        .then((res) => {
          if (res.status !== 200) {
            return Promise.reject(new Error(res.status))
          }
          return res.json()
        })
    },
    getRepos(username) {
      const request = github.client.setupRequest(`users/${username}/repos`)
      return request()
    },

    getReadMe(username, repo) {
      // make request to repos/username/repo/readme
      const request = github.client.setupRequest(`repos/${username}/${repo}/readme`)
      return request()
        .then((res) => {
          try {
            return atob(res.content)
          } catch (e) {
            return Promise.reject(new Error(e))
          }
        })
        .catch(e => console.log(e))
      // then decode response.content with atob()
      //
    },
  },
}
