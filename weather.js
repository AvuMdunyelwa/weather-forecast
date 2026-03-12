//dom elements
const searchCity = document.querySelector('#search_btn');
let city = document.querySelector('#city');
let day = document.querySelector('.day');
let todayDegrees = document.querySelector('#today_degrees');
let tomorrowDegrees = document.querySelector('#tomorrow_degrees');
let dayAfterDegrees = document.querySelector('#day_after_degrees');
let currentCondition = document.querySelector('#state');
let tomorrowCondition = document.querySelector('#state_1');
let thirdDayCondition = document.querySelector('#state_2');
let conditionIcon = document.querySelector('#currentIcon');
let conditionIcon2 = document.querySelector('#tomorrow_degrees_icon');
let conditionIcon3 = document.querySelector('#day_after_icon');
let backArrow = document.querySelector('#back_arrow');

//variables
let apiKey = 'e7d4545c40fa49e1bfe15822261802';
let imagesApi = 'UOR3qFeIGfMb3F8JwDVtZyumiBwJYy20gbS0sH1Dcms7wDq76QcWhyja';

//event listener
searchCity.addEventListener('click', (e) => {
    e.preventDefault()
    const cityInput = document.querySelector('#search_city');
    
    //input uppercase first letter for accurate results
    let inputValue = cityInput.value
    let finalInput = inputValue.charAt(0).toUpperCase() + inputValue.slice(1);

    //API url
    let weatherURL = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${finalInput}&days=7`;
    weatherData(weatherURL);
})

//loading state
function loadingAnimation(isLoading) {
    let form = document.querySelector('form');
    let weatherResults = document.querySelector('#results');
    let loadingAnimation = document.querySelector('#loading_state');

    //results display
    if(isLoading) {
        form.style.display = 'none';
        weatherResults.style.display = 'none';
        loadingAnimation.style.display = 'flex';
    }
    else{
        loadingAnimation.style.display = 'none';
        weatherResults.style.display = 'grid';
    }
}

// api
async function weatherData(url) {
    const weatherResults = document.querySelector('#results');
    const errorMessage = document.querySelector('#error');

    loadingAnimation(true);

    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error("City not found");
        }

        const data = await response.json();
        let city = data.location.name;

        errorMessage.textContent = '';

        displayWeatherData(data);
        getCityImg(city);

        backArrow.style.display = 'flex';
        loadingAnimation(false);
        
    } catch (error) {
        
        loadingAnimation(false);
        backArrow.style.display = 'none';
        weatherResults.style.display = 'none';
        errorMessage.textContent = 'No results found..';

    }
}

//go back to search form
backArrow.addEventListener('click', (e) => {
    location.reload()
})

function displayWeatherData(data) {
    let todaysDate = document.querySelector('.today_date');
    let sunrise = document.querySelector('.sunrise_time');
    let sunset = document.querySelector('.sunset_time');
    let country = document.querySelector('#country');

    //current weather
    city.innerHTML = data.location.name;
    todayDegrees.innerHTML = `${data.current.temp_c}`;
    conditionIcon.src = data.current.condition.icon;
    currentCondition.innerHTML = data.current.condition.text;
    country.innerHTML = `city in ${data.location.country}:`;

    //sunrise, sunset & date
    sunset.innerHTML = `Sunset: ${data.forecast.forecastday[1].astro.sunset}`;
    
    //change background based on conditions
    let conditionBg = currentCondition.innerHTML;
    changeBg(conditionBg);
    
    //following days weather
    forecastDays(data);

}

// get city image 
async function getCityImg(city) {
    let cityImage = document.querySelector('#image');

    try {
        const response = await fetch(`https://api.pexels.com/v1/search?query=${city} skyline&orientation=landscape&per_page=10`, {
            headers: {
                'Authorization': `${imagesApi}`
            }
        });
        
        const data = await response.json()
        cityImage.src = data.photos[0].src.landscape
    }
    catch(error) {
        return error;
    }

}

// day after tomorrow
function dayAfterTomorrow(date) {
    //get the date of the current weather
    const followingDate = new Date(date);
    const day = followingDate.getDay();
    const dayOfTheWeek = followingDate.toLocaleString('en-US', {weekday: 'short'});

    return dayOfTheWeek;
}

//change background image 
function changeBg(condition) {
    const wrapper = document.querySelector('#wrapper');
    const text = condition.toLowerCase();

    const weatherMap = {
        rain: ['rain', 'drizzle'],
        thunder: ['storm', 'thunder'],
        sunny: ['sunny', 'clear', 'partly cloudy'],
        snow: ['snow', 'snowy'],
        fog: ['mist', 'fog'],
        clear_night: ['clear night'],
        cloudy: ['cloudy', 'overcast']
    };

    for (let weather in weatherMap) {
        if (weatherMap[weather].some(word => text.includes(word))) {
            wrapper.className = ''; // remove previous weather classes
            wrapper.classList.add(weather);
            break;
        }
    }
}

//html template for forecast 7 days weather
function forecastDays(data) {
    const followingDays = document.querySelector('#following_days_results');

    const daysLength = data.forecast.forecastday.length;
    console.log(daysLength)
    
    for(let i = 1; i < daysLength; i++) {
        const daysWrapper = document.createElement('div');
        daysWrapper.classList.add('daysWrapper');
        const days = document.createElement('h4');
        days.classList.add('day');
        const forecastDegree = document.createElement('h2');
        forecastDegree.classList.add('day_after_degree');
        const img = document.createElement('img');
        img.classList.add('day_after_icon');

        forecastDegree.innerHTML = data.forecast.forecastday[i].day.maxtemp_c;
        img.src = data.forecast.forecastday[i].day.condition.icon;

        //day of the week
        let date = data.forecast.forecastday[i].date;
        days.innerHTML = dayAfterTomorrow(date);

        daysWrapper.append(days,img,forecastDegree)
        followingDays.appendChild(daysWrapper);
    }

}