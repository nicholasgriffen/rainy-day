const github = {
  client: {
    api: `https://api.github.com/`,
    options: {
      headers: {
        Accept: `application/vnd.github.v3+json`,
      },
    },
    request(url = github.client.api, endpoint = `users`, options = github.client.options) {
      return fetch(`${url}${endpoint}`, options)
        .then(res => res)
        .catch(e => console.log(e))
    },
  },
}
