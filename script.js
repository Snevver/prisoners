// Simulation configuration
const config = {
    NUM_PRISONERS: 100,
    NUM_BOXES: 100,
    MAX_ATTEMPTS: 50,
    TOTAL_ITERATIONS: 1000, // Default value
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
 * Creates a shuffled array representing box contents
 * @returns {Array} Shuffled box contents
 */
function shuffleBoxes() {
    const boxes = Array.from({ length: config.NUM_BOXES }, (_, i) => i + 1);
    
    for (let i = boxes.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [boxes[i], boxes[j]] = [boxes[j], boxes[i]]; // Swap
    }
    
    return boxes;
}

/**
 * Determines if a prisoner finds their number using the loop strategy
 * @param {number} prisoner - Prisoner number
 * @param {Array} boxes - Array of box contents
 * @returns {boolean} True if prisoner finds their number
 */
function findNumberLoop(prisoner, boxes) {
    let currentBox = prisoner;
    let attempts = 0;

    while (attempts < config.MAX_ATTEMPTS) {
        if (boxes[currentBox - 1] === prisoner) {
            return true; // Prisoner found their number
        }
        currentBox = boxes[currentBox - 1]; // Next box to open
        attempts++;
    }
    
    return false; // Prisoner did not find their number
}

/**
 * Determines if a prisoner finds their number using random strategy
 * @param {number} prisoner - Prisoner number
 * @param {Array} boxes - Array of box contents
 * @returns {boolean} True if prisoner finds their number
 */
function findNumberRandom(prisoner, boxes) {
    // Generate an array of random box indices (1-100)
    const randomBoxes = Array.from({ length: config.NUM_BOXES }, (_, i) => i + 1);
    // Shuffle to get random order
    for (let i = randomBoxes.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [randomBoxes[i], randomBoxes[j]] = [randomBoxes[j], randomBoxes[i]];
    }
    
    // Check only the first MAX_ATTEMPTS boxes
    for (let i = 0; i < config.MAX_ATTEMPTS; i++) {
        const boxIndex = randomBoxes[i] - 1;
        if (boxes[boxIndex] === prisoner) {
            return true; // Prisoner found their number
        }
    }
    
    return false; // Prisoner did not find their number
}

/**
 * Adds a success marker to the progress bar
 * @param {HTMLElement} progressDiv - The progress container
 * @param {number} iteration - Current iteration
 */
function addSuccessMarker(progressDiv, iteration) {
    const marker = document.createElement('div');
    marker.className = 'marker';
    const markerPosition = (iteration + 1) / config.TOTAL_ITERATIONS * 100;
    marker.style.left = `${markerPosition}%`;
    progressDiv.appendChild(marker);
}

/**
 * Updates the pie chart based on current stats
 * @param {SVGElement} greenCircle - Green success circle
 * @param {SVGElement} purpleCircle - Purple background circle
 * @param {SVGTextElement} percentageText - Text showing percentage
 * @param {number} successes - Number of successful escapes
 * @param {number} total - Total number of simulations
 */
function updatePieChart(greenCircle, purpleCircle, percentageText, successes, total) {
    const successPercentage = (successes / total) * 100;
    const circumference = 2 * Math.PI * 14; // Circle circumference
    
    // Update chart
    const greenDasharray = `${(circumference * successPercentage) / 100} ${circumference}`;
    const purpleDasharray = `${circumference} ${circumference}`;
    
    greenCircle.setAttribute('stroke-dasharray', greenDasharray);
    purpleCircle.setAttribute('stroke-dasharray', purpleDasharray);
    
    // Update percentage text
    percentageText.textContent = `${Math.round(successPercentage)}%`;
}

/**
 * Updates UI during simulation
 * @param {object} uiElements - Object containing UI elements to update
 * @param {number} iteration - Current iteration
 * @param {number} successes - Number of successful escapes
 */
function updateUI(uiElements, iteration, successes) {
    const { progressBar, counter, greenCircle, purpleCircle, percentageText } = uiElements;
    
    // Update progress bar
    const progress = Math.round(((iteration + 1) / config.TOTAL_ITERATIONS) * 100);
    progressBar.style.width = `${progress}%`;
    
    // Calculate success rate
    const successRate = (successes / (iteration + 1)) * 100;
    
    // Update counter to show both metrics
    counter.innerText = `Simulations: ${iteration + 1} | Success rate: ${successRate.toFixed(1)}%`;
    
    // Update chart
    updatePieChart(greenCircle, purpleCircle, percentageText, successes, iteration + 1);
}

/**
 * Runs the full simulation
 */
async function runSimulations() {
    if (config.running) return;
    
    // Get the latest simulation count value
    config.TOTAL_ITERATIONS = parseInt(elements.simulationCount.value);
    
    config.running = true;
    elements.startBtn.disabled = true;
    resetSimulation(false);
    
    // Stats for loop strategy
    let loopSuccesses = 0;
    let loopFailures = 0;
    
    // Stats for random strategy
    let randomSuccesses = 0;
    let randomFailures = 0;
    
    for (let i = 0; i < config.TOTAL_ITERATIONS; i++) {
        if (!config.running) break;
        
        const boxes = shuffleBoxes();
        
        // Loop strategy simulation
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
        
        // Random strategy simulation
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
        
        // Update UI for both simulations
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
        
        // Delay based on simulation speed
        await new Promise(resolve => setTimeout(resolve, 100 - elements.speedSlider.value));
    }
    
    // Show final results
    if (config.running) {
        // Loop strategy results
        const loopSuccessPercentage = (loopSuccesses / config.TOTAL_ITERATIONS) * 100;
        elements.outputLoop.innerText = 
            `Out of ${config.TOTAL_ITERATIONS} simulations, the prisoners escaped ${loopSuccesses} times.\n` +
            `Success rate: ${loopSuccessPercentage.toFixed(1)}%`;
        
        // Random strategy results
        const randomSuccessPercentage = (randomSuccesses / config.TOTAL_ITERATIONS) * 100;
        elements.outputRandom.innerText = 
            `Out of ${config.TOTAL_ITERATIONS} simulations, the prisoners escaped ${randomSuccesses} times.\n` +
            `Success rate: ${randomSuccessPercentage.toFixed(1)}%`;
    }
    
    config.running = false;
    elements.startBtn.disabled = false;
}

/**
 * Resets the simulation
 * @param {boolean} resetOutput - Whether to clear the output text
 */
function resetSimulation(resetOutput = true) {
    // Reset loop strategy UI
    elements.progressBarLoop.style.width = '0%';
    elements.counterLoop.innerText = 'Simulations: 0';
    elements.greenCircleLoop.setAttribute('stroke-dasharray', '0 100');
    elements.purpleCircleLoop.setAttribute('stroke-dasharray', '100 100');
    elements.percentageTextLoop.textContent = '0%';
    
    // Reset random strategy UI
    elements.progressBarRandom.style.width = '0%';
    elements.counterRandom.innerText = 'Simulations: 0';
    elements.greenCircleRandom.setAttribute('stroke-dasharray', '0 100');
    elements.purpleCircleRandom.setAttribute('stroke-dasharray', '100 100');
    elements.percentageTextRandom.textContent = '0%';
    
    // Remove all markers and success indicators
    document.querySelectorAll('.marker, .success-rate-indicator').forEach(el => el.remove());
    
    if (resetOutput) {
        elements.outputLoop.innerText = '';
        elements.outputRandom.innerText = '';
    }
}

/**
 * Stops the current simulation
 */
function stopSimulation() {
    config.running = false;
}

/**
 * Validates the simulation count input
 */
function validateSimulationCount() {
    let count = parseInt(elements.simulationCount.value);
    
    // Enforce minimum and maximum values
    if (isNaN(count) || count < 10) {
        count = 10;
    } else if (count > 10000) {
        count = 10000;
    }
    
    // Update the input field with the valid value
    elements.simulationCount.value = count;
    
    // Update the config
    config.TOTAL_ITERATIONS = count;
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Initialize simulation count from input
    if (elements.simulationCount) {
        validateSimulationCount();
        
        // Add event listener for simulation count changes
        elements.simulationCount.addEventListener('change', validateSimulationCount);
    }
    
    // Start button
    elements.startBtn.addEventListener('click', runSimulations);
    
    // Reset button
    elements.resetBtn.addEventListener('click', () => {
        stopSimulation();
        resetSimulation();
    });
    
    // Speed slider
    elements.speedSlider.addEventListener('input', () => {
        config.simulationSpeed = parseInt(elements.speedSlider.value);
    });
});