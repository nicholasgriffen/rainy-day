document.addEventListener("DOMContentLoaded", main)

function main() {
  //set up request with lib/github
  const request = github.client.setupRequest(`users/nicholasgriffen/repos`)
  let todo = document.getElementById("todo")
  request().then((res) => {
    debugger
  })
}

// try to get readme
// if no readme
