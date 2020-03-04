const signup_message = document.querySelector("#signup-message")
const login_message = document.querySelector("#login-message")

//User Sign-up
userSignUpSubmit = document.querySelector("#new-user-signup")
usersURL = "https://three-card-poker-backend.herokuapp.com/users"

localStorage.clear()

userSignUpSubmit.addEventListener("submit", event => {
    event.preventDefault()

    const formData = new FormData(event.target)
    const user = {
        username: formData.get("username"),
        password: formData.get("password")
    }

    console.log(user)

    fetch(usersURL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(user)
    })
    .then(displaySignupMessage)
})

function displaySignupMessage(response) {
    signup_message.textContent = "Boy, you gonna make that paper!"
    login_message.textContent = ""
}

//User Login
userLogin = document.querySelector("#user-login")
playButton = document.querySelector("#play-button")
colorChoiceForm = document.querySelector("#color-choice-form")

userLogin.addEventListener("submit", event => {
    event.preventDefault()

    const formData = new FormData(event.target)

    const user = {
        username: formData.get("username"),
        password: formData.get("password")
    }
    
    fetch("https://three-card-poker-backend.herokuapp.com/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(user)
    })
    .then(parseJSON)
    .then(storeToken)

    displayLoginMessage(user)
})

function parseJSON(response) {
    return response.json()
}

function storeToken(response) {
    localStorage.setItem("token", response.token)
}

function displayLoginMessage(user) {
    if (localStorage.getItem("token")) {
        signup_message.textContent = ''
        login_message.textContent = `Lets get it, ${user.username}!`
        
        //reveal the deal cards button
        playButton.style.opacity = 1

        //hide background color form after logout
        colorChoiceForm.style.opacity = 1
    } else {
        signup_message.textContent = 'Maybe you should sign up'
        login_message.textContent = 'Ah, not this time sport...'  
    } 
}

//User Logout
const logOutButton = document.querySelector("#user-logout")
const documentBody = document.querySelector("body")

logOutButton.addEventListener("click", event => {
    localStorage.removeItem("token")
    signup_message.textContent = ''
    login_message.textContent = ''

    //hide play button after logout
    playButton.style.opacity = 0

    //hide background color form after logout
    colorChoiceForm.style.opacity = 0
})

//change the background
const backgroundColorForm = document.querySelector("#color-choice-form")
console.log(backgroundColorForm)

backgroundColorForm.addEventListener('submit', event => {
    event.preventDefault()
    
    const formData = new FormData(event.target)
    const color = formData.get("background-color")

    console.log(color)

    documentBody.style["backgroundColor"] = color
})

