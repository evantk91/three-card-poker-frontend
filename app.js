const signup_message = document.querySelector("#signup-message")
const login_message = document.querySelector("#login-message")
const userSignUp = document.querySelector("#new-user-signup")
const usersURL = "https://three-card-poker-backend.herokuapp.com/api/v1/users"
let purse

//clear local storage
localStorage.clear()

//User Sign-up
userSignUp.addEventListener("submit", event => {
    event.preventDefault()

    const formData = new FormData(event.target)
    const user = {
        user: {
            username: formData.get("username"),
            password: formData.get("password")
        }
    }
    
    fetch(usersURL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(user)
    })
    .then(parseJSON)
    .then(displaySignUpMessage)
})

function displaySignUpMessage(response) {
    if(response.error === undefined) {
        signup_message.textContent = "Ya, Signed Up!"
    } else {
        signup_message.textContent = "User Already Exists"
    }
}


//User Login
const userLogin = document.querySelector("#user-login")
const userLoginButton = document.querySelector("#user-login-submit")
const logOutButton = document.querySelector("#user-logout")
const header = document.querySelector("#header")
const navCard = document.querySelector("#nav-card")

const colorChoiceContainer = document.querySelector("#color-choice-container")
const colorChoiceForm = document.querySelector("#color-choice-form")
const userOptionsSection = document.querySelector("#user-options-section")
const betsForm = document.querySelector('#bets-form')
const purseValue = document.querySelector('#purse span')

const loginURL = "https://three-card-poker-backend.herokuapp.com/api/v1/login"

userLogin.addEventListener("submit", event => {
    event.preventDefault()

    const formData = new FormData(event.target)

    const user = {
        username: formData.get("username"),
        password: formData.get("password")
    }
    
    fetch(loginURL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(user)
    })
    .then(parseJSON)
    .then(storeToken)
    .then(() => displayGame(user))
})

function parseJSON(response) {
    return response.json()
}

function storeToken(response) {
    localStorage.setItem("token", response.token)
    localStorage.setItem("user_id", response.user_id)
}

function displayGame(user) {
    if (localStorage.getItem("token") !== null) {
        header.textContent = `LET'S GET PAID, ${user.username}!!!`

        clearHands()
        purse = 3000
        purseValue.textContent = purse

        colorChoiceContainer.style.display = "flex"

        //display logout button and deal cards button
        logOutButton.style.display = "block"
        userOptionsSection.style.display = "flex"

        //hide new user signup and login button
        userSignUp.style.display = "none"
        userLogin.style.display = "none"
    }
}

//open/close rules
const rulesSection = document.querySelector("#rules-section")
const rulesButton = document.querySelector("#rules-button")
const closeRulesButton = document.querySelector("#close-rules-button")

rulesButton.addEventListener('click', event =>{
    event.preventDefault()
    rulesSection.style.display = "flex"
    rulesButton.style.display = "none"
    closeRulesButton.style.display = "flex"
})

closeRulesButton.addEventListener('click', event =>{
    event.preventDefault()
    rulesSection.style.display = "none"
    rulesButton.style.display = "flex"
    closeRulesButton.style.display = "none"
})

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
    colorChoiceContainer.style.display = "none" 

    logOutButton.style.display = "none"
    handsContainer.style.display = "none"
    userOptionsSection.style.display = "none"
    resultsSection.style.display = "none"
    
    //display new user signup
    userSignUp.style.display = "block"
    userLogin.style.display = "block"

    //reset header
    header.textContent = 'Welcome to Three Card Poker'
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
const betsMessage = document.querySelector('#bets-message')
const pairPlusValue = document.querySelector('#pair-plus span')
const anteValue = document.querySelector('#ante span')
const playValue = document.querySelector('#play span')

betsForm.addEventListener('submit', event => {
    event.preventDefault()

    const formData = new FormData(event.target)
    const pairPlus = formData.get("pairPlus")
    const ante = formData.get("ante")

    //update purse
    purse = purse - pairPlus - ante;
    purseValue.textContent = purse;

    //display pair plus bet and ante bet
    pairPlusValue.textContent = pairPlus;
    anteValue.textContent = ante;
    playValue.textContent = '';

    //hide bet button and cashout button
    quitButton.style.display = 'none'
    betsForm.style.display = 'none'
    betsMessage.style.display = 'none'

    dealButton.style.display = 'flex'
    handsContainer.style.display = "none"
})

const playersHandContainer = document.querySelector("#players-hand-container")
const playersHandDescription = document.querySelector("#players-hand-description")
const dealersHandContainer = document.querySelector("#dealers-hand-container")

const deckURL = "https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1"

let deckId
let playersHandValues = []
let dealersHandValues = []
let handInfo

//deal player's hand
dealButton.addEventListener("click", event => {
    event.preventDefault()
    clearHands()

    let handURL

    dealButton.style.display = "none"
    quitButton.style.display = "none"
    playButton.style.display = "flex"
    foldButton.style.display = "flex"

    //display hands container
    handsContainer.style.display = "flex"

    //display players hand header
    playersHandContainer.style.display = "flex"
    dealersHandContainer.style.display = "none"

    pairPlus = parseInt(pairPlusValue.textContent)

    //get players hand
    fetch(deckURL)
        .then(parseJSON)
        .then(deck => {deckId = deck.deck_id})
        .then(() => {
            handURL = `https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=3`;

            fetch(handURL)
                .then(parseJSON)
                .then(response => response.cards.map(appendPlayersCard))
                .then(() => {
                    appendPlayersHandDescription(playersHandValues)   
                })
                .then(() => {
                    purse = purse + pairPlusPayout(pairPlus, playersHandValues)
                    purseValue.textContent = purse;
                })
        })
})

foldButton.addEventListener('click', event => {
    event.preventDefault()

    clearHands()

    handsContainer.style.display = "none"

    foldButton.style.display = "none"
    playButton.style.display = "none"
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
    const pairPlus = parseInt(pairPlusValue.textContent)

    if(isPair(hand)) {
        playersHandDescription.textContent =`Pair of ${handValueToType(value)}. You win ${pairPlusPayout(pairPlus, hand) - pairPlus} !`;
    } else if(isStraightFlush(hand)) {
        playersHandDescription.textContent =`WOO HOO STRAIGHT FLUSH ${handValueToType(value)} HIGH, WIN ${pairPlusPayout(pairPlus, hand) - pairPlus}!!!!`;
    } else if(isStraight(hand)) {
        playersHandDescription.textContent =`WOO ${handValueToType(value)} HIGH STRAIGHT, WIN ${pairPlusPayout(pairPlus, hand) - pairPlus} !!`;
    } else if(isFlush(hand)) {
        playersHandDescription.textContent =`WOO ${handValueToType(value)} HIGH FLUSH, WIN ${pairPlusPayout(pairPlus, hand) - pairPlus} !!`;
    } else if(isThreeOfKind(hand)) {
        playersHandDescription.textContent =`WOO SET OF ${handValueToType(value)}s, WIN ${pairPlusPayout(pairPlus, hand) - pairPlus}!!!`;
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
            return (1 * bet + bet);
        case 'Flush':
            return (3 * bet + bet);
        case 'Straight':
            return (6 * bet + bet);
        case 'Three Of a Kind':
            return (30 * bet + bet);
        case 'Straight Flush':
            return (40 * bet + bet);
        default:
            return 0;
    }
}

const dealersHandDescription = document.querySelector("#dealers-hand-description")

//play against dealer
playButton.addEventListener('click', event => {
    const ante = parseInt(anteValue.textContent)
    const play = ante
    
    //display play value
    playValue.textContent = play 

    dealButton.style.display = "none"
    quitButton.style.display = "flex"
    playButton.style.display = "none"
    foldButton.style.display = "none"

    betsForm.style.display = "flex"
    betsMessage.style.display = "inline"

    dealersHandContainer.style.display = "flex"

    //update purse
    purse = purse - ante
    purseValue.textContent = purse;

    //get dealers hand
    const handURL = `https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=3`

    fetch(handURL)
        .then(parseJSON)
        .then(response => response.cards.map(appendDealersCard))
        .then(() => {
            //if dealer hand qualifies
            if(dealersHandPlays(dealersHandValues)) {
                if(playerWins(playersHandValues, dealersHandValues)) {
                    //winnings from beating dealer
                    purse = purse + ante + 2 * play + payOutPlay(ante, playersHandValues)
                    dealersHandDescription.textContent = `Dealers hand qualifies. YOU WIN!`
                } else {
                    dealersHandDescription.textContent = `Dealers hand qualifies. you lose...`
                }
            } else {
                if(playerWins(playersHandValues, dealersHandValues)) {
                    //winnings from beating dealer
                    purse = purse + ante + play + payOutPlay(ante, playersHandValues)
                    dealersHandDescription.textContent = `Dealers hand doesnt qualify`
                } else {
                    dealersHandDescription.textContent = `Dealers hand doesnt qualify. you lose...`
                }
            }
        
            purseValue.textContent = purse;
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

function dealersHandPlays(hand) {
    const handType = handTypeValue(hand)

    if(handType > 0) {
        return true
    } else if(handValue(hand)[1] > 11) {
        return true
    } else {
        return false
    }
}

function playerWins(playersHand, dealersHand) {
    const playersHandType = handTypeValue(playersHand)
    const dealersHandType = handTypeValue(dealersHand)

    //if players hand has a better type
    if (playersHandType > dealersHandType) {
        return true
    }

    //if dealers hand has a better type
    if (playersHandType < dealersHandType) {
        return false
    }

    const playersHandValue = handValue(playersHand)[1]
    const dealersHandValue = handValue(dealersHand)[1]

    //if dealers hand and players hand have the same type
    if (playersHandType === dealersHandType) {
        //if hand is better than a pair, compare value of hand
        if (playersHandType > 1) { 
            return (playersHandValue > dealersHandValue) ? true : false 
        }

        //if hand is a pair
        if (playersHandType === 1) {
            const playersHandOther = handValue(playersHand)[2]
            const dealersHandOther = handValue(dealersHand)[2]
            
            if(playersHandValue > dealersHandValue) {
                return true
            } else if (playersHandValue === dealersHandValue) {
                //compare other card
                if (playersHandOther === dealersHandOther) {
                    return "push"
                } else {
                    return (playersHandOther > dealersHandOther) ? true : false
                }
            } else {
                return false
            }
        }

        //If hand is a no pair
        if (playersHandType === 0) {
            sortedPlayersHand = sortedHandValues(playersHand)
            sortedDealersHand = sortedHandValues(dealersHand)

            //If hands have the same values
            if((sortedPlayersHand[0] === sortedDealersHand[0]) && (sortedPlayersHand[1] === sortedDealersHand[1]) && (sortedPlayersHand[2] === sortedDealersHand[2])) { return "push" }

            //If hands have two of the same values, compare the third
            if((sortedPlayersHand[1] === sortedDealersHand[1]) && (sortedPlayersHand[2] === sortedDealersHand[2])) {
                if (sortedPlayersHand[0] > sortedDealersHand[0]) {
                    return true
                } else {
                    return false
                }
            }

            if(sortedPlayersHand[2] > sortedDealersHand[2]) {
                return true
            } else if (sortedPlayersHand[2] === sortedDealersHand[2]) {
                if (sortedPlayersHand[1] > sortedDealersHand[1]) {
                    return true
                } else {
                    return false
                }
            } else {
                return false
            }
        }
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
    rulesButton.style.display = "none"

    const finalPurseMessage = `Your final purse is ${purse}`
    resultsDescription.textContent = finalPurseMessage

    const result = {
        score: {
            user_id: localStorage.getItem("user_id"),
            score: purse
        }
    }

    fetch("https://three-card-poker-backend.herokuapp.com/api/v1/scores", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(result)
    })
})

const playAgainButton = document.querySelector('#play-again-button')

playAgainButton.addEventListener('click', event => {
    rulesButton.style.display = "flex"
    userOptionsSection.style.display = "flex"
    resultsSection.style.display = "none"
})

//display leaderboard
const leaderboardButton = document.querySelector("#leaderboard-button")
const closeLeaderboardButton = document.querySelector("#close-leaderboard-button")
const leaderboardBody = document.querySelector("#leaderboard-body")
const leaderboardSection = document.querySelector("#leaderboard-section")

leaderboardButton.addEventListener('click', event => {
    resultsSection.style.display = "none" 
    leaderboardSection.style.display = "flex"

    clearLeaderboard(leaderboardBody);
    
    fetch("https://three-card-poker-backend.herokuapp.com/api/v1/scores", {
        headers: {
            "Authorization": `bearer ${localStorage.getItem("token")}`
        }
    })
    .then(parseJSON)
    .then(response => displayScores(response))
})

closeLeaderboardButton.addEventListener('click', event => {
    resultsSection.style.display = "flex" 
    leaderboardSection.style.display = "none" 
})

function clearLeaderboard(leaderboard) {
    while(leaderboard.firstChild) {
        leaderboard.removeChild(leaderboard.firstChild);
    }
}

function displayScores(response) {
    let topScores =topTenScores(response)
    topScores.map(score => appendScore(score))
}

function topTenScores(scores) {
    let sortedScores = scores.sort((a, b) => (b.score - a.score))
    let topScores = scores.slice(0, 10)
    return topScores
}

function appendScore(score) {
    let row = document.createElement('tr')
    row.innerHTML = `<td>${user.username}</td><td>${score.score}</td>`
    leaderboardBody.appendChild(row)
}