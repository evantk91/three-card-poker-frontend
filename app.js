userDropDownMenu = document.querySelector("#user-dropdown")

// fetch("https://three-card-poker-backend.herokuapp.com/users")
fetch("https://three-card-poker-backend.herokuapp.com/users")
    .then(parseJSON)
    .then(addUserOptions)

function parseJSON(response) {
    return response.json()
}

function addUserOptions(users) {
    users.map(user => {
        let userOption = document.createElement('option')
        userOption.value = user.username
        userOption.textContent = user.username
        console.log(userOption)
        userDropDownMenu.appendChild(userOption)
    })
}

