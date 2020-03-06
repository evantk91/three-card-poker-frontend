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

const colorChoiceForm = document.querySelector("#color-choice-form")
const userOptionsSection = document.querySelector("#user-options-section")
const betsForm = document.querySelector('#bets-form')
const betsMessage = document.querySelector('#bets-message')
const purseValue = document.querySelector('#purse span')

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
    purse = 3000
    purseValue.textContent = purse

    foldButton.style.display = "none"
    playButton.style.display = "none"
    dealButton.style.display = "none"
    quitButton.style.display = "flex"
    betsForm.style.display = "flex"
    betsMessage.style.display = "inline"
})

function parseJSON(response) {
    return response.json()
}

function storeToken(response) {
    localStorage.setItem("token", response.token)
    localStorage.setItem("user_id", response.user_id)
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
    userOptionsSection.style.display = "none"
    resultsSection.style.display = "none"
    
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

const dealButton = document.querySelector("#deal-button")
const playButton = document.querySelector("#play-button")
const foldButton = document.querySelector("#fold-button")
const quitButton = document.querySelector("#quit-button")

//get player's bets
const betsFormSubmit = document.querySelector('#bets-submit')
const pairPlusValue = document.querySelector('#pair-plus span')
const anteValue = document.querySelector('#ante span')

let purse = 3000
purseValue.textContent = purse;

betsForm.addEventListener('submit', event => {
    event.preventDefault()

    const formData = new FormData(event.target)
    const pairPlus = formData.get("pairPlus")
    const ante = formData.get("ante")
    console.log(purse)
    console.log(pairPlus)
    console.log(ante)
    
    //update purse
    purse = purse - pairPlus - ante;
    purseValue.textContent = purse;

    //display pair plus bet and ante bet
    pairPlusValue.textContent = pairPlus;
    anteValue.textContent = ante;

    //hide bet button and cashout button
    quitButton.style.display = 'none'
    betsForm.style.display = 'none'
    betsMessage.style.display = "none"
    handsContainer.style.display = "none"

    dealButton.style.display = "flex"
})

const playersHandContainer = document.querySelector("#players-hand-container")
const playersHandDescription = document.querySelector("#players-hand-description")
const dealersHandContainer = document.querySelector("#dealers-hand-container")

const deckURL = "https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1"

let deckId
let playersHandValues = []
let dealersHandValues = []
let handInfo

//get deck id
fetch(deckURL)
    .then(parseJSON)
    .then(deck => {deckId = deck.deck_id})

//deal player's hand
dealButton.addEventListener("click", event => {
    event.preventDefault()
    clearHands()
    
    dealButton.style.display = "none"
    quitButton.style.display = "none"
    playButton.style.display = "flex"
    foldButton.style.display = "flex"

    //display hands container
    handsContainer.style.display = "flex"

    //display players hand header
    playersHandContainer.style.display = "flex"
    dealersHandContainer.style.display = "none"

    //get players hand
    const handURL = `https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=3`

    fetch(handURL)
        .then(parseJSON)
        .then(response => response.cards.map(appendPlayersCard))
        .then(() => {
            appendPlayersHandDescription(playersHandValues)   
        })
        .then(() => {
            purse = purse + pairPlusPayout(pairPlusValue.textContent, playersHandValues)
            purseValue.textContent = purse;
        })
})

foldButton.addEventListener('click', event => {
    event.preventDefault()

    clearHands()

    handsContainer.style.display = "none"
    foldButton.style.display = "none"
    playButton.style.display = "none"
    dealButton.style.display = "none"
    quitButton.style.display = "flex"

    betsForm.style.display = "flex"
    betsMessage.style.display = "inline"
    pairPlusValue.textContent = "";
    anteValue.textContent = "";
})

function clearHands() {
    while (playersHand.hasChildNodes()) {playersHand.removeChild(playersHand.firstChild)}
    playersHandValues = [];

    while (dealersHand.hasChildNodes()) {dealersHand.removeChild(dealersHand.firstChild)}
    dealersHandValues = [];
}

function appendPlayersCard(card) {
    let cardImg = document.createElement("img")
    cardImg.src = card.image
    playersHand.appendChild(cardImg)

    playersHandValues.push(card.code)
}

function appendPlayersHandDescription(hand) {
    let value = handValue(hand)[1]

    if(isPair(hand)) {
        playersHandDescription.textContent =`Pair of ${handValueToType(value)}. You win ${pairPlusPayout(pairPlusValue.textContent, hand)} !`;
    } else if(isStraightFlush(hand)) {
        playersHandDescription.textContent =`WOO HOO STRAIGHT FLUSH ${handValueToType(value)} HIGH, WIN ${pairPlusPayout(pairPlusValue.textContent, hand)}!!!!`;
    } else if(isStraight(hand)) {
        playersHandDescription.textContent =`WOO ${handValueToType(value)} HIGH STRAIGHT, WIN ${pairPlusPayout(pairPlusValue.textContent, hand)} !!`;
    } else if(isFlush(hand)) {
        playersHandDescription.textContent =`WOO ${handValueToType(value)} HIGH FLUSH, WIN ${pairPlusPayout(pairPlusValue.textContent, hand)} !!`;
    } else if(isThreeOfKind(hand)) {
        playersHandDescription.textContent =`WOO SET OF ${handValueToType(value)}s, WIN ${pairPlusPayout(pairPlusValue.textContent, hand)}!!!`;
    } else {
        playersHandDescription.textContent =`Ahh ${handValueToType(value)} high...`;
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
        handType = 'Straight';
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
    return ((sortedValues[0] === sortedValues[1] || sortedValues[1] === sortedValues[2]) && sortedValues[0] !== sortedValues[2]) ? true : false
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

function pairPlusPayout(bet, hand) {
    let handType = handValue(hand)[0]

    switch(handType) {
        case 'Pair':
            return 2 * bet;
        case 'Flush':
            return 5 * bet;
        case 'Straight':
            return 6 * bet;
        case 'Three Of a Kind':
            return 31 * bet;
        case 'Straight Flush':
            return 41 * bet;
        default:
            return 0;
    }
}


const dealersHandDescription = document.querySelector("#dealers-hand-description")

//play against dealer
playButton.addEventListener('click', event => {
    event.preventDefault()
    const ante = parseInt(anteValue.textContent)
    let purse = parseInt(purseValue.textContent)

    dealButton.style.display = "none"
    quitButton.style.display = "flex"
    playButton.style.display = "none"
    foldButton.style.display = "none"

    betsForm.style.display = "flex"
    betsMessage.style.display = "inline"

    pairPlusValue.textContent = "";
    anteValue.textContent = "";

    //display players hand header
    dealersHandContainer.style.display = "flex"

    //get players hand
    const handURL = `https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=3`

    fetch(handURL)
        .then(parseJSON)
        .then(response => response.cards.map(appendDealersCard))
        .then(() => {
            const payout = payOutPlay(ante, playersHandValues)
            appendPokerResult(playersHandValues, dealersHandValues, payout)   
            if(playerWins(playersHandValues, dealersHandValues)) {
                purse = purse + payout;
                purseValue.textContent = purse;
            }
        })
})

function appendDealersCard(card) {
    let cardImg = document.createElement("img")
    cardImg.src = card.image
    dealersHand.appendChild(cardImg)

    dealersHandValues.push(card.code)
}

function handTypeValue(hand) {
    let handType = handValue(hand)[0]

    switch(handType) {
        case 'Pair':
            return 1;
        case 'Flush':
            return 2;
        case 'Straight':
            return 3;
        case 'Three Of a Kind':
            return 4;
        case 'Straight Flush':
            return 5;
        default:
            return 0;
    }
}

function playerWins(playersHand, dealersHand) {
    const playersHandType = handTypeValue(playersHand)
    const dealersHandType = handTypeValue(dealersHand)

    if (playersHandType > dealersHandType) {
        return true
    }

    if (playersHandType < dealersHandType) {
        return false
    }

    const playersHandValue = handValue(playersHand)[1]
    const dealersHandValue = handValue(dealersHand)[1]

    if (playersHandType === dealersHandType) {
        if (playersHandValue > dealersHandValue) {
            return true
        } else if (playersHandValue === dealersHandValue) {
            const playersHandOther = handValue(playersHand)[2]
            const dealersHandOther = handValue(dealersHand)[2]
            if (playersHandOther > dealersHandOther) {
                return true
            } else {
                return false
            }
        } else {
            return false
        }
    } 
}

function appendPokerResult(playersHand, dealersHand, payout) {
    if(playerWins(playersHand, dealersHand)) {
        dealersHandDescription.textContent = `YOU WIN ${payout}!`
    } else {
        dealersHandDescription.textContent = 'YOU LOSE...'
    }
}

function payOutPlay(bet, hand) {
    const handType = handValue(hand)[0]
    switch(handType) {
        case 'Straight Flush':
            return bet * 6
        case 'Three Of a Kind':
            return bet * 5
        case 'Straight':
            return bet * 2
        default:
            return bet
    }
}

const resultsSection = document.querySelector('#results-section')
const resultsDescription = document.querySelector('#results-description')

//quit game
quitButton.addEventListener('click', event => {
    event.preventDefault()

    handsContainer.style.display = "none"
    userOptionsSection.style.display = "none"
    resultsSection.style.display = "flex"

    const finalPurseMessage = `Your final purse is ${purse}`
    resultsDescription.textContent = finalPurseMessage

    const result = {
        user_id: localStorage.getItem("user_id"),
        score: purse
    }

    fetch("https://three-card-poker-backend.herokuapp.com/scores", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(result)
    })
})