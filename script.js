// API Configuration
const API_KEY = "1e377c8173eff68fa68368bf22ebda3f";
const BASE_URL = "https://api.openweathermap.org/data/2.5/weather";

// DOM Elements
const elements = {
    input: document.getElementById('city-input'),
    searchButton: document.getElementById('search-button'),
    messageBox: document.getElementById('message-box'),
    weatherDisplay: document.getElementById('weather-display'),
    cityName: document.getElementById('city-name'),
    dateTime: document.getElementById('date-time'),
    weatherIcon: document.getElementById('weather-icon'),
    temperature: document.getElementById('temperature'),
    description: document.getElementById('description'),
    humidity: document.getElementById('humidity'),
    windSpeed: document.getElementById('wind-speed'),
    feelsLike: document.getElementById('feels-like')
};

// Display message
function displayMessage(message, type = 'info') {
    elements.messageBox.textContent = message;
    elements.messageBox.className = 'p-3 mb-4 rounded-lg text-sm transition duration-300';
    elements.messageBox.classList.remove('hidden');

    if (type === 'error') elements.messageBox.classList.add('bg-red-900', 'text-red-300');
    else if (type === 'success') elements.messageBox.classList.add('bg-green-900', 'text-green-300');
    else elements.messageBox.classList.add('bg-blue-900', 'text-blue-300');
}

function hideMessage() {
    elements.messageBox.classList.add('hidden');
}

// Format date/time
function formatDateTime(timestamp, timezoneOffset) {
    const date = new Date((timestamp * 1000) + (timezoneOffset * 1000));
    const options = { 
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: true 
    };
    return date.toLocaleString('en-US', options);
}

// Update weather display
function updateWeatherDisplay(data) {
    const tempC = Math.round(data.main.temp);
    const feelsLikeC = Math.round(data.main.feels_like);

    elements.cityName.textContent = data.name;
    elements.temperature.innerHTML = `${tempC}<span class="align-top text-4xl">&deg;C</span>`;
    elements.description.textContent = data.weather[0].description;
    elements.humidity.textContent = `${data.main.humidity}%`;
    elements.windSpeed.textContent = `${(data.wind.speed * 3.6).toFixed(1)} km/h`;
    elements.feelsLike.innerHTML = `${feelsLikeC}<span class="align-top text-sm">&deg;C</span>`;

    const iconCode = data.weather[0].icon;
    elements.weatherIcon.src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;

    const localTimestamp = Date.now() / 1000;
    elements.dateTime.textContent = formatDateTime(localTimestamp, data.timezone);

    elements.weatherDisplay.classList.remove('hidden');
    hideMessage();
}

// Fetch weather data
async function fetchWeatherData(city) {
    if (!city) {
        displayMessage("Please enter a city name.", 'error');
        return;
    }

    const url = `${BASE_URL}?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`;
    
    elements.searchButton.disabled = true;
    elements.searchButton.textContent = 'Fetching...';
    elements.weatherDisplay.classList.add('hidden');
    displayMessage('Loading weather data...', 'info');

    let delay = 1000;
    const maxRetries = 3;

    for (let i = 0; i < maxRetries; i++) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                if (response.status === 404) throw new Error(`City not found: ${city}.`);
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            updateWeatherDisplay(data);
            return;
        } catch (error) {
            console.error(`Attempt ${i + 1} failed:`, error.message);
            if (i < maxRetries - 1) await new Promise(resolve => setTimeout(resolve, delay));
            delay *= 2;
            if (i === maxRetries - 1) displayMessage(`Failed to fetch weather data: ${error.message}`, 'error');
        } finally {
            elements.searchButton.disabled = false;
            elements.searchButton.textContent = 'Search';
        }
    }
}

// Event listeners
elements.searchButton.addEventListener('click', () => {
    const city = elements.input.value.trim();
    fetchWeatherData(city);
});

elements.input.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        event.preventDefault();
        elements.searchButton.click();
    }
});

// Initial message
window.onload = () => {
    displayMessage('Enter a city and click Search to get the weather!', 'info');
};
