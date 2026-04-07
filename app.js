// Map Initialization
var map = L.map('map', { zoomControl: false, attributionControl: false }).setView([24.8607, 67.0011], 10);
L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png').addTo(map);

async function getWeather() {
    const cityInput = document.getElementById("city");
    const cityName = cityInput.value.trim();

    if (!cityName) return;

    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=392fc470c1ac8b42b2f40951a9a96cc4&units=metric`;

    try {
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (data.cod !== 200) {
            alert("City not found!.");
            return;
        }

        // Map update
        const { lat, lon } = data.coord;
        map.flyTo([lat, lon], 12, { duration: 2 });

        // Calculations for UI
        const temp = Math.round(data.main.temp);
        const feelsLike = Math.round(data.main.feels_like);
        const dewPoint = Math.round(data.main.temp - ((100 - data.main.humidity) / 5));
        const utc = new Date().getTime() + (new Date().getTimezoneOffset() * 60000);
const cityTime = new Date(utc + (data.timezone * 1000));

const currentTime = cityTime.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
});

        // Dynamic weather emoji logic
        const weatherMain = data.weather[0].main.toLowerCase();

        const sunrise = data.sys.sunrise * 1000;
        const sunset = data.sys.sunset * 1000;
        const now = Date.now();

        const isNight = now < sunrise || now > sunset;

        const hasClouds =
            weatherMain.includes("cloud") ||
            weatherMain.includes("haze") ||
            weatherMain.includes("mist") ||
            weatherMain.includes("fog") ||
            weatherMain.includes("smoke");

        let weatherEmoji = "";

        if (isNight) {
    weatherEmoji = hasClouds
        ? `<span class="moon">🌙</span><span class="cloud">☁️</span>`
        : `<span class="moon">🌙</span>`;
} else {
    weatherEmoji = hasClouds
        ? `<span class="sun">☀️</span><span class="cloud">☁️</span>`
        : `<span class="sun">☀️</span>`;
}

        // Final UI Injection
        document.getElementById("weather-info").innerHTML = `
            <div class="card-header">
                <div class="header-left">
                    <h2 class="city-title">${data.name.toUpperCase()}</h2>
                    <span class="time-text">${currentTime}</span>
                </div>
                <span class="weather-label">Current weather</span>
            </div>

            <div class="main-temp-row">
                <div class="temp-group">
                    <span class="temp-number">${temp}°</span>
                    <p class="weather-desc">${data.weather[0].main}</p>
                </div>
                <div class="weather-icon-img">
                    ${weatherEmoji}
                </div>
            </div>

            <div class="details-grid">
                <div class="detail-box">
                    <span>Wind</span>
                    <strong>${data.wind.speed} km/h</strong>
                </div>
                <div class="detail-box">
                    <span>Humidity</span>
                    <strong>${data.main.humidity}%</strong>
                </div>
                <div class="detail-box">
                    <span>Feels like</span>
                    <strong>${feelsLike}°</strong>
                </div>
                <div class="detail-box">
                    <span>Visibility</span>
                    <strong>${(data.visibility / 1000).toFixed(1)} km</strong>
                </div>
                <div class="detail-box">
                    <span>Pressure</span>
                    <strong>${data.main.pressure} mb</strong>
                </div>
                <div class="detail-box">
                    <span>Dew point</span>
                    <strong>${dewPoint}°</strong>
                </div>
            </div>
        `;

        cityInput.value = "";
    } catch (error) {
        console.error("Error fetching weather:", error);
    }
}