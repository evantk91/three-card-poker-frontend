const signup_message = document.querySelector("#signup-message")
const login_message = document.querySelector("#login-message")

//User Sign-up
const userSignUp = document.querySelector("#new-user-signup")
const usersURL = "https://three-card-poker-backend.herokuapp.com/users"

localStorage.clear()

userSignUp.addEventListener("submit", event => {
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
const userLogin = document.querySelector("#user-login")
const userLoginButton = document.querySelector("#user-login-submit")
const logOutButton = document.querySelector("#user-logout")
const dealButton = document.querySelector("#deal-button")
const colorChoiceForm = document.querySelector("#color-choice-form")
const userOptionsSection = document.querySelector("#user-options-section")

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
    .then(() => displayLoginMessage(user))
    
    clearHands()
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

        //display logout button and deal cards button
        logOutButton.style.display = "block"
        colorChoiceForm.style.display = "flex"
        userOptionsSection.style.display = "flex"

        //hide new user signup and login button
        userSignUp.style.display = "none"
        userLogin.style.display = "none"

    } else {
        login_message.textContent = 'Ah, not this time sport...try again'  
    } 
}



//User Logout
const documentBody = document.querySelector("body")
const handsContainer = document.querySelector("#hands-section")
const playersHand = document.querySelector("#players-hand")
const dealersHand = document.querySelector("#dealers-hand")

logOutButton.addEventListener("click", event => {
    localStorage.removeItem("token")
    signup_message.textContent = ''
    login_message.textContent = ''

    //hide play button, background selector, hide logout button, and cards after logout
    colorChoiceForm.style.display = "none" 
    logOutButton.style.display = "none"
    handsContainer.style.display = "none"
    dealButton.style.display = "block"

    //reset cards
    clearHands()
    
    //display new user signup
    userSignUp.style.display = "block"
    userLogin.style.display = "block"
})

//change the background
const backgroundColorForm = document.querySelector("#color-choice-form")

backgroundColorForm.addEventListener("submit", event => {
    event.preventDefault()
    
    const formData = new FormData(event.target)
    const color = formData.get("background-color")

    documentBody.style["backgroundColor"] = color
})

//deal player's hand
const playersHandContainer = document.querySelector("#players-hand-container")
const playersHandDescription = document.querySelector("#players-hand-description")
const deckURL = "https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1"
let deckId
let playersHandValues = []
let dealersHandValues = []
let handInfo

//get deck id
fetch(deckURL)
    .then(parseJSON)
    .then(deck => {deckId = deck.deck_id})

dealButton.addEventListener("click", event => {
    event.preventDefault()
    clearHands()
    
    //hide play button
    dealButton.style.display = "none"

    //display hands container
    handsContainer.style.display = "flex"

    //display players hand header
    playersHandContainer.style.display = "flex"

    //get players hand
    const handURL = `https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=3`

    fetch(handURL)
        .then(parseJSON)
        .then(response => response.cards.map(appendCard))
        .then(() => {
            handInfo = appendHandDescription(playersHandValues)   
        })
})

function clearHands() {
    while (playersHand.hasChildNodes()) {playersHand.removeChild(playersHand.firstChild)}
    playersHandValues = [];

    while (dealersHand.hasChildNodes()) {dealersHand.removeChild(dealersHand.firstChild)}
    dealersHandValues = [];
}

function appendCard(card) {
    let cardImg = document.createElement("img")
    cardImg.src = card.image
    playersHand.appendChild(cardImg)

    playersHandValues.push(card.code)
}

function appendHandDescription(hand) {
    let type, value, other  

    if(isPair(hand)) {
        [type, value, other] = handValue(hand)
        playersHandDescription.textContent =`Pair of ${handValueToType(value)} !`
        return [type, value, other]
    } else if(isStraightFlush(hand)) {
        [type, value] = handValue(hand)
        playersHandDescription.textContent =`WOO HOO STRAIGHT FLUSH ${handValueToType(value)} HIGH !!!!`
        return [type, value]
    } else if(isStraight(hand)) {
        [type, value] = handValue(hand)
        playersHandDescription.textContent =`WOO ${handValueToType(value)} HIGH STRAIGHT !!`
        return [type, value]
    } else if(isFlush(hand)) {
        [type, value] = handValue(hand)
        playersHandDescription.textContent =`WOO ${handValueToType(value)} HIGH FLUSH !!`
        return [type, value]
    } else if(isThreeOfKind(hand)) {
        [type, value] = handValue(hand)
        playersHandDescription.textContent =`WOO SET OF ${handValueToType(value)}s !!!`
        return [type, value]
    } else {
        [type, value] = handValue(hand)
        playersHandDescription.textContent =`AH ${handValueToType(value)} HIGH...`
        return [type, value]
    }
}

function handValue(hand) {
    let handType, pairValue, otherValue
    let highCard = sortedHandValues(hand)[2]

    if(isPair(hand)) {
        handType = 'Pair';
        [pairValue, otherValue] = pairInfo(hand);
        return [handType, pairValue, otherValue];
    } else if(isStraightFlush(hand)) {
        handType = 'Straight Flush';
    } else if(isStraight(hand)) {
        handType = 'Straignt';
    } else if(isFlush(hand)) {
        handType = 'Flush';
    } else if(isThreeOfKind(hand)) {
        handType = 'Three Of a Kind';
    } else {
        handType = 'No Pair'
    }

    return [handType, highCard]    
}

function sortedHandValues(hand) {
    let values = []
    hand.map(card => {
        switch (card[0]) {
            case '0':
                values.push(10);
                break;
            case 'J':
                values.push(11);
                break;
            case 'Q':
                values.push(12);
                break;
            case 'K':
                values.push(13);
                break;
            case 'A':
                values.push(14);
                break;
            default:
                values.push(parseInt(card[0]));
        }
    })

    return values.sort((a,b) => a - b)
}

function handValueToType(value) {
    switch(value) {
        case 10:
            return '10'
        case 11:
            return 'J'
        case 12:
            return 'Q'
        case 13:
            return 'K'
        case 14:
            return 'A'
        default:
            return value.toString()
    }
}

function isStraight(hand) {
    let sortedValues = sortedHandValues(hand)
    return (sortedValues[0] === sortedValues[1] - 1 && sortedValues[1] === sortedValues[2] - 1) ? true : false
}

function isFlush(hand) {
    let suits = hand.map(card => card[1])
    return (suits[0] === suits[1] && suits[1] === suits[2]) ? true : false
}

function isStraightFlush(hand) {
    return (isFlush(hand) && isStraight(hand)) ? true : false
}

function isThreeOfKind(hand) {
    let sortedValues = sortedHandValues(hand)
    return (sortedValues[0] === sortedValues[1] && sortedValues[1] === sortedValues[2]) ? true : false
}

function isPair(hand) {
    let sortedValues = sortedHandValues(hand)
    return (sortedValues[0] === sortedValues[1] || sortedValues[1] === sortedValues[2]) ? true : false
}

function pairInfo(hand) {
    let sortedValues = sortedHandValues(hand)
    let pairValue, otherValue

    if (sortedValues[0] === sortedValues[1]) {
        pairValue = sortedValues[0]
        otherValue = sortedValues[2]
    } else {
        pairValue = sortedValues[1]
        otherValue = sortedValues[0]
    }

    return [pairValue, otherValue]
}