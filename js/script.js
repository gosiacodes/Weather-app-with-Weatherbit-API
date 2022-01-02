// Global variables
// API key
const API_KEY = '1e15006422bf4a95ad58cbab1601e61a';
// Header / form
const logo = document.querySelector('.logo');
const textInput = document.querySelector('#text');
const languageSelect = document.querySelector("#language");
const searchButton = document.querySelector('#search-weather-btn');
// Spinners
const spinnerDiv = document.querySelector('.spinner-wrapper');
const spinnerLogoDiv = document.querySelector('.logo-spinner-wrapper');
const logoAnim = document.querySelector('.logo-anim'); 
// Results
const dateInfoDiv = document.querySelector('#date-info-div');
const weatherPosDiv = document.querySelector('#weather-position-container');
const weatherCurDiv = document.querySelector('#weather-currently-container');
const weatherDailyDiv = document.querySelector('#weather-daily-container');
// Message modal
const messageModal = document.querySelector("#message-modal");
const closeMessageModal = document.querySelector("#error-close");
const okButton = document.querySelector(".message-button");
const message = document.querySelector(".message");

// Value variables
let city;
let position;
let currentWeatherArr;
let dailyWeatherArr;
// Swedish language variables
let language = 'sv';
let todayName = 'Väder just nu, ';
let apparentName = 'Känns som: ';
let windName = 'Vind: ';
let pressureName = 'Lufttryck: ';
let humidityName = 'Luftfuktighet: ';
let dayNames = ['Söndag', 'Måndag', 'Tisdag', 'Onsdag','Torsdag', 'Fredag', 'Lördag'];

// Default settings
spinnerDiv.style.display = 'none';
weatherCurDiv.style.display = 'none';
weatherDailyDiv.style.display = 'none';

// Animations from anime.js
// Function for spinner animation when waiting for response
const setSpinner = () => {
    weatherCurDiv.style.display = 'none';
    weatherDailyDiv.style.display = 'none';
    anime ({
        targets: 'div.box',
        translateY: [
            {value: 200, duration: 500},
            {value:0, duration: 800}
        ],
        loop: true,
        rotate: {
        value: '1turn',
        },
        borderRadius: 50,
        elasticity: 200,
        direction: 'alternate',
        easing: 'easeInOutQuad',
        delay: function() {return anime.random(0, 1000); },
        loop: true
    });
}

// Function for logo spinner animation when page loaded
const animateLogoSpinner = () => {
    anime({
        targets: logoAnim,
        scale: 2,
        translateY: 150,
        easing: 'linear',
        direction: 'alternate',
        duration: 4000,
        loop: true
    })
}

// Function for title and logo animation when page loaded
const animateTitleAndLogo = () => {
    anime({
        targets: '.title, .logo',
        scale: 1.1,
        easing: 'linear',
        direction: 'alternate',
        duration: 4000,
        loop: true
    })
}

// Function for div with weather by current position animation
const animatePosWeather = () => {
    anime({
        targets: weatherPosDiv,
        loop: false,
        easing: 'easeInOutQuad',
        rotate: '1turn'
    })
}

// Function for date info animation
const animateDateInfo = () => {
    anime({
        targets: dateInfoDiv,
        color: '#002776',
        easing: 'linear',
        direction: 'alternate',
        duration: 10000,
        loop: true
    })
}

// Function for div with current weather animation
const animateCurrentWeather = () => {
    anime({
        targets: weatherCurDiv,
        width: ['0px', '18rem'],
        duration: 5000
    })
}

// Function for div with 5 days weather animation
const animateDailyWeather = () => {
    anime({
        targets: '.weather-day-container',
        backgroundColor: '#002776',
        duration: 5000
    })
}

// Animations that run when the page is loaded
animateLogoSpinner();
animateTitleAndLogo();
animateDateInfo();

// Function for getting coordinates
const getPositionAndWeather = (position) => {
    let lat = position.coords.latitude;
    let long = position.coords.longitude;
    // Get url for current weather by coordinates
    const urlPos =`https://api.weatherbit.io/v2.0/current?lat=${lat}&lon=${long}&key=${API_KEY}`;

    spinnerLogoDiv.style.display = 'none';
    deleteData();
    
    // Fetch url and get JSON-response
    fetch(urlPos).then(
        function(response){
            if (response.status >= 200 && response.status < 300) {
                return response.json(); 
            } else {
                message.innerText = 'Something went wrong! Please try again.';
                showMessageModal();
            }
        }
    ).then((data) => {
            let arrayWeather = data.data;           
            if (arrayWeather.length == 0){
                message.innerText = 'Something went wrong! Please try again.';
                showMessageModal();
            }
            displayCurrentPosWeather(arrayWeather);
        }
    ).catch((error) => {
        console.log(error);
        if (error == 'SyntaxError: Unexpected end of JSON input') {
            message.innerText = 'Wrong city name or country code. Try "London, GB".';
            showMessageModal();
        }
        else {
            message.innerText = 'Something went wrong! Please try again.';
            showMessageModal();
        }
    }
    )   
};

// Function for getting current position for update weather by current position 
const getLocation = () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(getPositionAndWeather);
    } else {
        message.innerHTML = 'Geolocation is not supported by this browser.';
        showMessageModal();
    }
}
getLocation();

// Function for getting parameter and displaying weather by current position
const displayCurrentPosWeather = (weatherParam) => {
    for (let i=0; i<weatherParam.length; i++) {
        let weatherCode = weatherParam[i].weather.code;
        let partOfDay = weatherParam[i].pod;
        setLogoIcon(weatherCode, partOfDay);
        let cityName = weatherParam[i].city_name;
        let countryCode = weatherParam[i].country_code;
        let cityEl = document.createElement('H4');
        cityEl.innerText = cityName + ', ' + countryCode;
        weatherPosDiv.appendChild(cityEl);
        let weatherIcon = weatherParam[i].weather.icon;
        let img = document.createElement('img');
        img.style.width = '2.5rem';
        img.style.height = '2.5rem';
        img.src = `https://www.weatherbit.io/static/img/icons/${weatherIcon}.png`;
        weatherPosDiv.appendChild(img);
        let temp = weatherParam[i].temp;
        let tempEl = document.createElement('H4');
        tempEl.innerText = temp + '°C';
        weatherPosDiv.appendChild(tempEl);
        animatePosWeather();
        getWeather(cityName + ', ' + countryCode);
    }
}

// Function to set logo icon depending on part of the day and weather condition 
// according to weather by current position
const setLogoIcon = (weatherCode, partOfDay) => {
    if (weatherCode >= 300 && weatherCode <= 302) {
        logo.src = 'img/drizzle_48.png';
    }
    else if (weatherCode >= 600 && weatherCode <= 623) {
        logo.src = 'img/snow_48.png';
    }
    else if (weatherCode >= 700 && weatherCode <= 751) {
        logo.src = 'img/fog_48.png';
    }
    if (partOfDay == 'd') {
        if (weatherCode >= 200 && weatherCode <= 233){
            logo.src = 'img/day_thunderstorm_48.png';
        }
        else if (weatherCode >= 500 && weatherCode <= 522){
            logo.src = 'img/day_rain_48.png';
        }
        else if (weatherCode == 800){
            logo.src = 'img/day_clear_sky_48.png';
        }
        else if (weatherCode >= 801 && weatherCode <= 804) {
            logo.src = 'img/day_clouds_48.png';
        }
    }
    else if (partOfDay == 'n') {
        if (weatherCode >= 200 && weatherCode <= 233){
            logo.src = 'img/night_thunderstorm_48.png';
        }
        else if (weatherCode >= 500 && weatherCode <= 522){
            logo.src = 'img/night_rain_48.png';
        }
        else if (weatherCode == 800){
            logo.src = 'img/night_clear_sky_48.png';
        }
        else if (weatherCode >= 801 && weatherCode <= 804) {
            logo.src = 'img/night_clouds_48.png';
        }
    }
}

// Function to get input and selected language when search-button is clicked
const getValues = (event) => { 
    event.preventDefault();  
    city = textInput.value;
    language = languageSelect.value;

    if (city === '') {
        message.innerText = 'Enter name of the city!';
        showMessageModal();
    }
    else {
        // Setting different values for variables depending on selected language
        if (language == 'sv') {
            todayName = 'Väder just nu, ';
            apparentName = 'Känns som: ';
            windName = 'Vind: ';
            pressureName = 'Lufttryck: ';
            humidityName = 'Luftfuktighet: ';
            dayNames = ['Söndag', 'Måndag', 'Tisdag', 'Onsdag','Torsdag', 'Fredag', 'Lördag']; 
        }
        else if (language == 'en') {
            todayName = 'Weather now, ';
            apparentName = 'Feels like: ';
            windName = 'Wind: ';
            pressureName = 'Pressure: ';
            humidityName = 'Humidity: ';
            dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday','Thursday', 'Friday', 'Saturday']; 
        }
        else if (language == 'pl') {
            todayName = 'Pogoda teraz, ';
            apparentName = 'Odczuwalna: ';
            windName = 'Wiatr: ';
            pressureName = 'Ciśnienie: ';
            humidityName = 'Wilgotność pow.: ';
            dayNames = ['Niedziela', 'Poniedziałek', 'Wtorek', 'Środa','Czwartek', 'Piątek', 'Sobota']; 
        }
        spinnerLogoDiv.style.display = 'none';
        getWeather(city);
        message.innerText = '';
    }
}

// Function for getting weather parameters by city name
const getWeather = (city) => {
    // Get url for current weather by city name
    const urlCurrent = `https://api.weatherbit.io/v2.0/current?&city=${city}&key=${API_KEY}&lang=${language}`;
    // Get url for 16 days weather by city name
    const urlDaily = `https://api.weatherbit.io/v2.0/forecast/daily?city=${city}&key=${API_KEY}&lang=${language}`;

    deleteData();
    setSpinner();
    spinnerDiv.style.display = 'flex';

    // Fetch both url
    Promise.all([
        fetch(urlCurrent),
        fetch(urlDaily)
    ]).then((responses) => {
        // Get JSON object from each of the responses
        return Promise.all(responses.map((response) => {
            if (response.status >= 200 && response.status < 300) {
                return response.json(); 
            } else {
                message.innerText = 'Something went wrong! Please try again.';
                showMessageModal();
            }
        }));
    }).then((data) => {
        let weatherArrays = data;
        if (weatherArrays.length == 0){
            message.innerText = 'Something went wrong! Please try again.';
            showMessageModal();
        }
        // Get separate data from each of the responses
        for (let i=0; i<weatherArrays.length; i++) {
            currentWeatherArr = weatherArrays[0];
            dailyWeatherArr = weatherArrays[1];
        }
        // Go to separate functions to display data for current weather and daily weather 
        displayCurrentWeather(currentWeatherArr.data);
        displayDailyWeather(dailyWeatherArr.data);
        spinnerDiv.style.display = 'none';
    }).catch((error) => {
        console.log(error);
        if (error == 'SyntaxError: Unexpected end of JSON input') {
            message.innerText = 'Wrong city name or country code. Try "London, GB".';
            showMessageModal();
        }
        else {
            message.innerText = 'Something went wrong! Please try again.';
            showMessageModal();
        }
        weatherCurDiv.style.display = 'none';
        weatherDailyDiv.style.display = 'none';
    }); 
    textInput.value = '';
    message.innerText = '';
}

// Function for getting parameter and displaying current weather 
const displayCurrentWeather = (weatherParam) => {
    for (let i=0; i<weatherParam.length; i++) {
        let cityName = weatherParam[i].city_name;
        let countryCode = weatherParam[i].country_code;
        let cityEl = document.createElement('p');
        cityEl.className = 'city-name';
        cityEl.innerText = cityName + ', ' + countryCode;
        weatherCurDiv.appendChild(cityEl);
        let weatherIcon = weatherParam[i].weather.icon;
        let iconCurrent = document.createElement('img');
        iconCurrent.className = 'icon-current-weather';
        iconCurrent.src = `https://www.weatherbit.io/static/img/icons/${weatherIcon}.png`;
        let div = document.createElement('div');
        div.className = 'row-current';
        div.appendChild(iconCurrent);
        let temp = weatherParam[i].temp;
        let tempEl = document.createElement('p');
        tempEl.className = 'temp';
        tempEl.innerText = temp + '°C';
        div.appendChild(tempEl);
        weatherCurDiv.appendChild(div);
        let tempApparent = weatherParam[i].app_temp;
        let tempAppEl = document.createElement('p');
        tempAppEl.innerText = apparentName + tempApparent + '°C';
        weatherCurDiv.appendChild(tempAppEl);
        let description = weatherParam[i].weather.description;
        let descriptionEl = document.createElement('p');
        descriptionEl.className = 'info';
        descriptionEl.innerText = description;
        weatherCurDiv.appendChild(descriptionEl);
        let wind = Math.round(weatherParam[i].wind_spd);
        let windEl = document.createElement('p');
        windEl.innerText = windName + wind + ' m/s';
        weatherCurDiv.appendChild(windEl);
        let pressure = Math.round(weatherParam[i].pres);
        let pressureEl = document.createElement('p');
        pressureEl.innerText = pressureName + pressure + ' hPa';
        weatherCurDiv.appendChild(pressureEl);
        let humidity = Math.round(weatherParam[i].rh);
        let humidityEl = document.createElement('p');
        humidityEl.innerText = humidityName + humidity +'%';
        weatherCurDiv.appendChild(humidityEl);
        weatherCurDiv.style.display = 'flex';
        animateCurrentWeather();
    }
}

// Function for getting parameter and displaying 5-days weather 
const displayDailyWeather = (weatherParam) => {
    let todayDate = weatherParam[0].valid_date;
    let dateInfo = document.createElement('H3');
    dateInfo.className = 'date-info';
    dateInfo.innerText = todayName + todayDate;
    dateInfoDiv.appendChild(dateInfo);
    for (let i=1; i<6; i++) {
        let containter = document.createElement('div');
        containter.className = 'weather-day-container';
        let date = weatherParam[i].valid_date;
        let day = new Date(date);
        let dayName = dayNames[day.getDay()];
        let dayEl = document.createElement('H2');
        dayEl.innerText = dayName;
        containter.appendChild(dayEl);
        let weatherIcon = weatherParam[i].weather.icon;
        let iconDaily = document.createElement('img');
        iconDaily.className = 'icon-daily-weather';
        iconDaily.src = `https://www.weatherbit.io/static/img/icons/${weatherIcon}.png`;
        containter.appendChild(iconDaily);
        let temp = weatherParam[i].temp;
        let tempEl = document.createElement('p');
        tempEl.className = 'temp-day';
        tempEl.innerText = temp + '°C';
        containter.appendChild(tempEl);
        let description = weatherParam[i].weather.description;
        let descriptionEl = document.createElement('p');
        descriptionEl.className = 'info-day';
        descriptionEl.innerText = description;
        containter.appendChild(descriptionEl);
        weatherDailyDiv.appendChild(containter);  
        weatherDailyDiv.style.display = 'flex';
        animateDailyWeather();
    }
}

// Function for deleting resultats
const deleteData = () => {
    let currentlyWeather = document.querySelectorAll('#weather-currently-container *');
    for (let i=0; i<currentlyWeather.length; i++){
        currentlyWeather[i].remove();
    }
    let dailyWeather = document.querySelectorAll('#weather-daily-container *');
    for (let i=0; i<dailyWeather.length; i++){
        dailyWeather[i].remove();
    }
    let todayInfo = document.querySelectorAll('#date-info-div *');
    for (let i=0; i<todayInfo.length; i++){
        todayInfo[i].remove();
    }
}

// Function for event for enter-key (if pressed, search-button click-event runs)
const enterTextEvent = (event) => {
    if (event.keyCode === 13 || event.code === 'Enter') {
        event.preventDefault();
        searchButton.click();
    }
}

// Function for showing modal with error-message
const showMessageModal = () => {    
    messageModal.style.display = 'block';
    okButton.setAttribute('onclick', 'hideModal(messageModal)');
    closeMessageModal.setAttribute('onclick', 'hideModal(messageModal)');
    // When wherever on the page clicked - modal closes
    window.onclick = (event) => {
        if (event.target === messageModal) {
            hideModal(messageModal);
        }
    }
}

// Function for hiding modal
const hideModal = (modal) => {
    modal.style.display = 'none';
    spinnerDiv.style.display = 'none';
}

// Event listeners
// Event listener for search-button to get input and selected language
searchButton.addEventListener('click', getValues);
// Event listener for text input when enter-key used
textInput.addEventListener("keydown", enterTextEvent);