document.addEventListener("DOMContentLoaded", main)

function main() {
  console.log('loaded')
  save('login', 'nicholasgriffen')
  save('repo', 'digijan')
  document.getElementById("showReadMe").addEventListener("click", showReadMe)
}


function loadReadMe(login, repo) {
  const localReadMe = load(`${repo}-readMe`)

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

function showReadMe() {
  const readMeContainer = document.getElementById("readMeContainer")

  loadReadMe(load('login'), load('repo'))
    .then((readMe) => {
      readMeContainer.innerHTML = readMe
    })
}

function save(label, thing) {
  localStorage.setItem(`${label}`, JSON.stringify(thing))
}

function load(label) {
  return JSON.parse(localStorage.getItem(`${label}`))
}
