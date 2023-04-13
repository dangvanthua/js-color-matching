import { GAME_STATUS, GAME_TIME, PAIRS_COUNT } from './constants.js'
import { getColorBackground, getColorElementList, getColorListElement, getInActiveColorList, getPlayAgainButton } from './selectors.js';
import { createTimer, getRandomColorPairs, hidePlayAgainButton, setTimmerText, showPlayAgainButton } from './utils.js'

// Global variables
let selections = []
let gameState = GAME_STATUS.PLAYING
let timmer = createTimer({
    seconds: GAME_TIME,
    onChange: handleTimmerChange,
    onFinish: handleTimmerFinish
});

function handleTimmerChange(second) {
    const fullSecond = `0${second}`.slice(-2);
    setTimmerText(fullSecond)
}

function handleTimmerFinish() {
    setTimmerText('Game Over 😭');
    // set game status fisnish don't clicked by user
    gameState = GAME_STATUS.FINISHED;
    // show button replay game
    showPlayAgainButton();
}

// TODOs
// 1. Generating colors using https://github.com/davidmerfield/randomColor
// 2. Attach item click for all li elements
// 3. Check win logic
// 4. Add timer
// 5. Handle replay click

console.log(getRandomColorPairs(PAIRS_COUNT));

function initColor() {
    // random 8 pairs of colors
    const colorList = getRandomColorPairs(PAIRS_COUNT);

    // bind to li > div.overlay
    const liElementList = getColorElementList();

    if (!liElementList) return;
    // iterator throught li element tag and attach a color into li element
    liElementList.forEach((liElement, index) => {
        liElement.dataset.color = colorList[index];
        const overlayElement = liElement.querySelector('.overlay');

        if (overlayElement) overlayElement.style.backgroundColor = colorList[index];
    })
}

function handleColorEvent(liElement) {
    const shouldBlockClick = [GAME_STATUS.BLOCKING, GAME_STATUS.FINISHED].includes(gameState);
    const isClicked = liElement.classList.contains('active');
    if (!liElement || shouldBlockClick || isClicked) return;
    liElement.classList.add('active');

    selections.push(liElement);
    if (selections.length < 2) return;

    const firstColor = selections[0].dataset.color;
    const secondColor = selections[1].dataset.color;
    const isMatch = firstColor === secondColor;

    if (isMatch) {
        const backgroundElement = getColorBackground();

        // set background color for section element
        if (backgroundElement) {
            backgroundElement.style.backgroundColor = selections[0].dataset.color;
        }

        const isWin = getInActiveColorList().length === 0;
        if (isWin) {
            // finish timer
            timmer.clear();
            // show replay
            showPlayAgainButton();
            // show you win
            setTimmerText('Your Win 🥇');

            // upadete status for player win
            gameState = GAME_STATUS.FINISHED;
        }

        selections = [];
        return;
    }

    gameState = GAME_STATUS.BLOCKING;

    setTimeout(() => {
        selections[0].classList.remove('active');
        selections[1].classList.remove('active');

        // set selections empty
        selections = [];
        if (gameState !== GAME_STATUS.FINISHED) {
            gameState = GAME_STATUS.PLAYING;
        }

    }, 500)
}

function attachEventForColorList() {
    // get ul tag list element for a event
    const ulElement = getColorListElement();

    if (!ulElement) return;

    ulElement.addEventListener('click', (event) => {
        if (event.target.tagName !== 'LI') return;
        handleColorEvent(event.target)
    });
}

function resetGame() {
    // reset global variable

    gameState = GAME_STATUS.PLAYING;
    selections = [];

    // reset DOMS element
    const colorElementList = getColorElementList();
    for (const colorElement of colorElementList) {
        colorElement.classList.remove('active');
    }


    setTimeout(() => {
        hidePlayAgainButton();
        // set text title empty
        setTimmerText('');
        //re-generate new colors
        initColor();
        // replay time 
        startTimmer();
    }, 300)
}

function attachEventPlayAgainForButton() {
    const playAgainButton = getPlayAgainButton();

    if (playAgainButton) {
        playAgainButton.addEventListener('click', resetGame)
    }
}

function startTimmer() {
    timmer.start();
}

(() => {
    initColor();

    attachEventForColorList();

    attachEventPlayAgainForButton();

    startTimmer();
})()