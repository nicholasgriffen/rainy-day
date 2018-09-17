const github = {
  client: {
    api: `https://api.github.com/`,
    options: {
      headers: {
        Accept: `application/vnd.github.v3+json`,
      },
    },
    setupRequest(endpoint = `users/nicholasgriffen`, { api, options } = github.client) {
      return () => fetch(`${api}${endpoint}`, options)
        .then((res) => {
          if (res.status !== 200) {
            return Promise.reject(new Error(res.status))
          }
          return res.json()
        })
    },
  },
}
