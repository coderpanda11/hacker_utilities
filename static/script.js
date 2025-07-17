// --- Mode State ---
let currentMode = 'binary'; // 'binary' or 'hexadecimal'
let currentState = {};

// --- Utility: Get correct element IDs for current mode ---
function getModeSelectors() {
    if (currentMode === 'binary') {
        return {
            powersDisplay: 'powersDisplay',
            platesContainer: 'platesContainer',
            display: 'binaryDisplay',
            decimalDisplay: 'decimalDisplay',
            decimalInput: 'decimalInput',
            currentDisplay: 'currentBinary',
            currentDecimal: 'currentDecimal',
            historyDisplay: 'historyDisplay',
        };
    } else {
        return {
            powersDisplay: 'powersDisplayHex',
            platesContainer: 'platesContainerHex',
            display: 'hexDisplay',
            decimalDisplay: 'decimalDisplayHex',
            decimalInput: 'decimalInputHex',
            currentDisplay: 'currentHex',
            currentDecimal: 'currentDecimalHex',
            historyDisplay: 'historyDisplayHex',
        };
    }
}

// --- API Endpoints ---
function getApiBase() {
    return currentMode === 'binary' ? '/api' : '/api/hexadecimal';
}

// --- Fetch State ---
async function fetchState() {
    try {
        const response = await fetch(currentMode === 'binary' ? '/api/state' : '/api/hexadecimal/state');
        currentState = await response.json();
        updateDisplay();
    } catch (error) {
        console.error('Error fetching state:', error);
    }
}

// --- Flip Plate ---
async function flipPlate(position) {
    try {
        const { platesContainer } = getModeSelectors();
        const plateElement = document.querySelector(`#${platesContainer} [data-position="${position}"]`);
        if (plateElement) {
            plateElement.classList.add('flipping');
            setTimeout(() => {
                plateElement.classList.remove('flipping');
            }, 600);
        }
        const url = `${getApiBase()}/flip/${position}`;
        const response = await fetch(url);
        currentState = await response.json();
        updateDisplay();
    } catch (error) {
        console.error('Error flipping plate:', error);
    }
}

// --- Reset Plates ---
async function resetPlates() {
    try {
        const url = `${getApiBase()}/reset`;
        const response = await fetch(url);
        currentState = await response.json();
        updateDisplay();
    } catch (error) {
        console.error('Error resetting plates:', error);
    }
}

// --- Auto Increment ---
async function autoIncrement() {
    try {
        const url = `${getApiBase()}/auto_increment`;
        const response = await fetch(url);
        currentState = await response.json();
        updateDisplay();
    } catch (error) {
        console.error('Error auto incrementing:', error);
    }
}

// --- Set Decimal ---
async function setDecimal() {
    const { decimalInput } = getModeSelectors();
    const decimalInputElem = document.getElementById(decimalInput);
    const decimal = parseInt(decimalInputElem.value);
    if (decimal < 0 || decimal > currentState.max_decimal) {
        alert(`Please enter a value between 0 and ${currentState.max_decimal}`);
        return;
    }
    try {
        const url = `${getApiBase()}/set_decimal`;
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ decimal: decimal })
        });
        const result = await response.json();
        if (result.success) {
            currentState = result;
            updateDisplay();
        } else {
            alert('Invalid decimal value');
        }
    } catch (error) {
        console.error('Error setting decimal:', error);
    }
}

// --- Random Value ---
function randomValue() {
    const { decimalInput } = getModeSelectors();
    const randomDecimal = Math.floor(Math.random() * (currentState.max_decimal + 1));
    document.getElementById(decimalInput).value = randomDecimal;
    setDecimal();
}

// --- Update Display ---
function updateDisplay() {
    const selectors = getModeSelectors();
    // Plates
    const platesContainer = document.getElementById(selectors.platesContainer);
    platesContainer.innerHTML = '';
    (currentState.plates || []).forEach((plate, index) => {
        const plateElement = document.createElement('div');
        plateElement.className = `plate ${plate ? 'on' : 'off'}${currentMode === 'hexadecimal' ? ' hex-plate' : ''}`;
        plateElement.textContent = currentMode === 'hexadecimal' ? (plate < 10 ? plate : String.fromCharCode(55 + plate)) : plate;
        const positionFromRight = currentState.plates.length - 1 - index;
        plateElement.setAttribute('data-position', positionFromRight);
        plateElement.onclick = () => flipPlate(positionFromRight);
        const plateWrapper = document.createElement('div');
        plateWrapper.appendChild(plateElement);
        const plateInfo = document.createElement('div');
        plateInfo.className = 'plate-info';
        plateInfo.textContent = currentMode === 'binary' ? `2^${positionFromRight}` : `16^${positionFromRight}`;
        plateWrapper.appendChild(plateInfo);
        platesContainer.appendChild(plateWrapper);
    });
    // Powers display
    const powersDisplay = document.getElementById(selectors.powersDisplay);
    powersDisplay.innerHTML = '';
    const powers = currentMode === 'binary' ? currentState.powers_of_two : currentState.powers_of_sixteen;
    (powers || []).forEach((power, index) => {
        const powerElement = document.createElement('div');
        powerElement.className = 'power-item';
        powerElement.innerHTML = `<strong>${power}</strong>`;
        powersDisplay.appendChild(powerElement);
    });
    // Main display
    if (currentMode === 'binary') {
        document.getElementById('binaryDisplay').textContent = currentState.binary;
        document.getElementById('decimalDisplay').textContent = currentState.decimal;
        document.getElementById('currentBinary').textContent = currentState.binary;
        document.getElementById('currentDecimal').textContent = currentState.decimal;
        document.getElementById('decimalInput').max = currentState.max_decimal;
    } else {
        document.getElementById('hexDisplay').textContent = currentState.hexadecimal;
        document.getElementById('decimalDisplayHex').textContent = currentState.decimal;
        document.getElementById('currentHex').textContent = currentState.hexadecimal;
        document.getElementById('currentDecimalHex').textContent = currentState.decimal;
        document.getElementById('decimalInputHex').max = currentState.max_decimal;
    }
    // History
    const historyDisplay = document.getElementById(selectors.historyDisplay);
    historyDisplay.innerHTML = '';
    if (!currentState.history || currentState.history.length === 0) {
        historyDisplay.innerHTML = `<div class="history-item">Start: ${currentMode === 'binary' ? '0000000' : '0000000'} = 0</div>`;
    } else {
        currentState.history.forEach(item => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            if (currentMode === 'binary') {
                historyItem.textContent = `Step ${item.step}: ${item.binary} = ${item.decimal}`;
            } else {
                historyItem.textContent = `Step ${item.step}: ${item.hex} = ${item.decimal}`;
            }
            historyDisplay.appendChild(historyItem);
        });
    }
}

// --- Tab Switching ---
function switchTab(tabName) {
    currentMode = tabName;
    // Show/hide tab content
    document.getElementById('binary-tab').style.display = tabName === 'binary' ? 'block' : 'none';
    document.getElementById('hex-tab').style.display = tabName === 'hexadecimal' ? 'block' : 'none';
    // Update nav tab active state
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelector(`button[onclick="switchTab('${tabName}')"]`).classList.add('active');
    // Fetch state for new mode
    fetchState();
}

// --- Keyboard Shortcuts ---
document.addEventListener('keydown', function(e) {
    if (currentMode === 'binary') {
        if (e.key >= '0' && e.key <= '6') {
            const position = parseInt(e.key);
            flipPlate(position);
        } else if (e.key === 'r' || e.key === 'R') {
            resetPlates();
        } else if (e.key === ' ') {
            e.preventDefault();
            autoIncrement();
        }
    } else if (currentMode === 'hexadecimal') {
        if (e.key >= '0' && e.key <= '6') {
            const position = parseInt(e.key);
            flipPlate(position);
        } else if (e.key === 'r' || e.key === 'R') {
            resetPlates();
        } else if (e.key === ' ') {
            e.preventDefault();
            autoIncrement();
        }
    }
});

// --- Initialize ---
document.addEventListener('DOMContentLoaded', function() {
    switchTab('binary'); // Default tab
});