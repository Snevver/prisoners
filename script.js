const config = {
    NUM_PRISONERS: 100,
    NUM_BOXES: 100,
    MAX_ATTEMPTS: 50,
    TOTAL_ITERATIONS: 1000,
    simulationSpeed: 10,
    running: false
};

// DOM elements cache
const elements = {
    startBtn: document.getElementById('start-btn'),
    resetBtn: document.getElementById('reset-btn'),
    // Loop strategy elements
    progressBarLoop: document.getElementById('progress-bar-loop'),
    progressDivLoop: document.getElementById('progress-loop'),
    counterLoop: document.getElementById('counter-loop'),
    outputLoop: document.getElementById('output-loop'),
    greenCircleLoop: document.getElementById('green-circle-loop'),
    purpleCircleLoop: document.getElementById('purple-circle-loop'),
    percentageTextLoop: document.getElementById('percentage-text-loop'),
    // Random strategy elements
    progressBarRandom: document.getElementById('progress-bar-random'),
    progressDivRandom: document.getElementById('progress-random'),
    counterRandom: document.getElementById('counter-random'),
    outputRandom: document.getElementById('output-random'),
    greenCircleRandom: document.getElementById('green-circle-random'),
    purpleCircleRandom: document.getElementById('purple-circle-random'),
    percentageTextRandom: document.getElementById('percentage-text-random'),
    // Controls
    speedSlider: document.getElementById('speed-slider'),
    simulationCount: document.getElementById('simulation-count')
};

/**
 * @returns {Array}
 */
function shuffleBoxes() {
    const boxes = Array.from({ length: config.NUM_BOXES }, (_, i) => i + 1);
    
    for (let i = boxes.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [boxes[i], boxes[j]] = [boxes[j], boxes[i]];
    }
    
    return boxes;
}

/**
 * @param {number} prisoner
 * @param {Array} boxes
 * @returns {boolean}
 */
function findNumberLoop(prisoner, boxes) {
    let currentBox = prisoner;
    let attempts = 0;

    while (attempts < config.MAX_ATTEMPTS) {
        if (boxes[currentBox - 1] === prisoner) {
            return true;
        }
        currentBox = boxes[currentBox - 1];
        attempts++;
    }
    
    return false;
}

/**
 * @param {number} prisoner
 * @param {Array} boxes
 * @returns {boolean}
 */
function findNumberRandom(prisoner, boxes) {
    const randomBoxes = Array.from({ length: config.NUM_BOXES }, (_, i) => i + 1);
    for (let i = randomBoxes.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [randomBoxes[i], randomBoxes[j]] = [randomBoxes[j], randomBoxes[i]];
    }
    
    for (let i = 0; i < config.MAX_ATTEMPTS; i++) {
        const boxIndex = randomBoxes[i] - 1;
        if (boxes[boxIndex] === prisoner) {
            return true;
        }
    }
    
    return false;
}

/**
 * @param {HTMLElement} progressDiv
 * @param {number} iteration
 */
function addSuccessMarker(progressDiv, iteration) {
    const marker = document.createElement('div');
    marker.className = 'marker';
    const markerPosition = (iteration + 1) / config.TOTAL_ITERATIONS * 100;
    marker.style.left = `${markerPosition}%`;
    progressDiv.appendChild(marker);
}

/**
 * @param {SVGElement} greenCircle
 * @param {SVGElement} purpleCircle
 * @param {SVGTextElement} percentageText
 * @param {number} successes
 * @param {number} total
 */
function updatePieChart(greenCircle, purpleCircle, percentageText, successes, total) {
    const successPercentage = (successes / total) * 100;
    const circumference = 2 * Math.PI * 14;
    
    const greenDasharray = `${(circumference * successPercentage) / 100} ${circumference}`;
    const purpleDasharray = `${circumference} ${circumference}`;
    
    greenCircle.setAttribute('stroke-dasharray', greenDasharray);
    purpleCircle.setAttribute('stroke-dasharray', purpleDasharray);
    
    percentageText.textContent = `${Math.round(successPercentage)}%`;
}

/**
 * @param {object} uiElements
 * @param {number} iteration
 * @param {number} successes
 */
function updateUI(uiElements, iteration, successes) {
    const { progressBar, counter, greenCircle, purpleCircle, percentageText } = uiElements;
    
    const progress = Math.round(((iteration + 1) / config.TOTAL_ITERATIONS) * 100);
    progressBar.style.width = `${progress}%`;
    
    counter.innerText = `Simulations: ${iteration + 1}`;
    
    updatePieChart(greenCircle, purpleCircle, percentageText, successes, iteration + 1);
}

async function runSimulations() {
    if (config.running) return;
    
    config.TOTAL_ITERATIONS = parseInt(elements.simulationCount.value);
    
    config.running = true;
    elements.startBtn.disabled = true;
    resetSimulation(false);
    
    let loopSuccesses = 0;
    let loopFailures = 0;
    
    let randomSuccesses = 0;
    let randomFailures = 0;
    
    for (let i = 0; i < config.TOTAL_ITERATIONS; i++) {
        if (!config.running) break;
        
        const boxes = shuffleBoxes();
        
        let allEscapedLoop = true;
        for (let j = 1; j <= config.NUM_PRISONERS; j++) {
            if (!findNumberLoop(j, boxes)) {
                allEscapedLoop = false;
                break;
            }
        }
        
        if (allEscapedLoop) {
            loopSuccesses++;
            addSuccessMarker(elements.progressDivLoop, i);
        } else {
            loopFailures++;
        }
        
        let allEscapedRandom = true;
        for (let j = 1; j <= config.NUM_PRISONERS; j++) {
            if (!findNumberRandom(j, boxes)) {
                allEscapedRandom = false;
                break;
            }
        }
        
        if (allEscapedRandom) {
            randomSuccesses++;
            addSuccessMarker(elements.progressDivRandom, i);
        } else {
            randomFailures++;
        }
        
        updateUI({
            progressBar: elements.progressBarLoop,
            counter: elements.counterLoop,
            greenCircle: elements.greenCircleLoop,
            purpleCircle: elements.purpleCircleLoop,
            percentageText: elements.percentageTextLoop
        }, i, loopSuccesses);
        
        updateUI({
            progressBar: elements.progressBarRandom,
            counter: elements.counterRandom,
            greenCircle: elements.greenCircleRandom,
            purpleCircle: elements.purpleCircleRandom,
            percentageText: elements.percentageTextRandom
        }, i, randomSuccesses);
        
        await new Promise(resolve => setTimeout(resolve, 100 - elements.speedSlider.value));
    }
    
    if (config.running) {
        const loopSuccessPercentage = (loopSuccesses / config.TOTAL_ITERATIONS) * 100;
        elements.outputLoop.innerText = 
            `Out of ${config.TOTAL_ITERATIONS} simulations, the prisoners escaped ${loopSuccesses} times.\n` +
            `Success rate: ${loopSuccessPercentage.toFixed(1)}%`;
        
        const randomSuccessPercentage = (randomSuccesses / config.TOTAL_ITERATIONS) * 100;
        elements.outputRandom.innerText = 
            `Out of ${config.TOTAL_ITERATIONS} simulations, the prisoners escaped ${randomSuccesses} times.\n` +
            `Success rate: ${randomSuccessPercentage.toFixed(1)}%`;
    }
    
    config.running = false;
    elements.startBtn.disabled = false;
}

/**
 * @param {boolean} resetOutput
 */
function resetSimulation(resetOutput = true) {
    elements.progressBarLoop.style.width = '0%';
    elements.counterLoop.innerText = 'Simulations: 0';
    elements.greenCircleLoop.setAttribute('stroke-dasharray', '0 100');
    elements.purpleCircleLoop.setAttribute('stroke-dasharray', '100 100');
    elements.percentageTextLoop.textContent = '0%';
    
    elements.progressBarRandom.style.width = '0%';
    elements.counterRandom.innerText = 'Simulations: 0';
    elements.greenCircleRandom.setAttribute('stroke-dasharray', '0 100');
    elements.purpleCircleRandom.setAttribute('stroke-dasharray', '100 100');
    elements.percentageTextRandom.textContent = '0%';
    
    const markers = document.querySelectorAll('.marker');
    markers.forEach(marker => marker.remove());
    
    if (resetOutput) {
        elements.outputLoop.innerText = '';
        elements.outputRandom.innerText = '';
    }
}

function stopSimulation() {
    config.running = false;
}

function validateSimulationCount() {
    let count = parseInt(elements.simulationCount.value);
    
    if (isNaN(count) || count < 10) {
        count = 10;
    } else if (count > 10000) {
        count = 10000;
    }
    
    elements.simulationCount.value = count;
    
    config.TOTAL_ITERATIONS = count;
}

document.addEventListener('DOMContentLoaded', () => {
    if (elements.simulationCount) {
        validateSimulationCount();
        
        elements.simulationCount.addEventListener('change', validateSimulationCount);
    }
    
    elements.startBtn.addEventListener('click', runSimulations);
    
    elements.resetBtn.addEventListener('click', () => {
        stopSimulation();
        resetSimulation();
    });
    
    elements.speedSlider.addEventListener('input', () => {
        config.simulationSpeed = parseInt(elements.speedSlider.value);
    });
});