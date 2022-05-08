var searchForm = $('#searchForm');
var locationSearch = $('.formInput');
var searchBtn = $('.searchBtn');
var APIkey = "5a33353110d7881b95923f11c001428d"
var outPutEl = document.querySelector(".forecastCard")
var mainCity = document.querySelector("#location")
var weatherForecast = document.querySelector("#dayForecast")
var todayForecast = document.querySelector("#weatherInfo")
var hidden = document.querySelector(".hidden");
var todayWeather = document.createElement("div");
var weatherCard = document.createElement("div");
var listofSearch = document.querySelector(".searchHistory")
var uv = '';
var cities = [];

//main function for creating weather forecast and search history
function init(e) {
    e.preventDefault();
    var locationRequest = locationSearch.val();
    if (checkCity(locationRequest)) {
        savedCities();
        createSearchResults();
    }

    //initiating innerHTML on todayWeather and weatherForecast to 
    todayWeather.innerHTML = '';
    weatherForecast.innerHTML = '';

    //utilizing fetch to get weather info from users request input
    fetch(`http://api.openweathermap.org/geo/1.0/direct?q=${locationRequest}&limit=1&appid=${APIkey}`)
        .then(function (response) {

            //json the response and reads it
            return response.json();
        })
        .then(function (result) {
            console.log(result)

            //takes the latitude and longitude and and assign it to appropriate variables
            var lat = result[0].lat
            var lon = result[0].lon

            //uses previous acquire lat and lon as input to utilize weather API and gather appropriate information
            fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&units=imperial&exclude=alerts,minutely,hourly&appid=${APIkey}`)
                .then(function (response) {
                    return response.json();
                })
                .then(function (result) {
                    console.log(result);

                    createCityElements(result, locationRequest);
                })
        })
}

function uvIndex() {

    //changes color of uvContainer to match the associated warning level
    var uvContainer = document.querySelector(".uvClass");
    if (uv < 2.00) {
        uvContainer.style.backgroundColor = "green";
    } else if (uv >= 2.00 && uv < 3.00) {
        uvContainer.style.backgroundColor = "yellow";
    } else if (uv >= 3.00 && uv < 7.00) {
        uvContainer.style.backgroundColor = "orange";
    } else if (uv >= 8.00 && uv < 10.00) {
        uvContainer.style.backgroundColor = "pink";
    } else if (uv >= 8.00) {
        uvContainer.style.backgroundColor = "purple";
    }
}

//takes input from user as argument for function to determine if it has already been searched before
function checkCity(locationRequest) {
    console.log(locationRequest)

    //loops thorugh the searched cities array and returns false if there is any duplicate
    for (let index = 0; index < cities.length; index++) {
        if (cities[index].toLowerCase() === locationRequest.toLowerCase()) {
            return false;
        }
    }

    return true
}

function savedCities() {
    console.log(cities);
    //store value of location input into locationRequest variable
    var locationRequest = locationSearch.val();
    //push the locationRequest to cities array
    cities.push(locationRequest);
    //store the cities array into local storage with the object key of search cities
    localStorage.setItem("Searched Cities", JSON.stringify(cities));
    //clear out cities array
    cities = [];
}

function createCityElements(result, locationRequest) {
    //stores all the appropriate date, iconURL, temp, wind, humid, and uv in appropriate var
    var date = moment().format('MMMM Do YYYY');
    var icon = result.current.weather[0].icon;
    var iconURL = `<img src="https://openweathermap.org/img/w/${icon}.png">`
    var temp = result.current.temp;
    var wind = result.current.wind_speed;
    var humid = result.current.humidity;
    var uv = result.current.uvi;
    //create literal template of the data to be appended to forecast
    todayWeather.innerHTML = `<h1>${locationRequest} (${date}) ${iconURL} </h1><br>
                            Temp: ${temp} °F <br>
                            Wind: ${wind} MPH <br>
                            Humidity: ${humid} % <br>
                            <p> UV Index: <span class="uvClass">${uv}</span></p>`;
    todayForecast.append(todayWeather);

    uvIndex();

    //loop through 5 times and create weather cars for different days of week
    for (let index = 0; index < 5; index++) {
        //create div element and store into variable weatherCard
        var weatherCard = document.createElement("div")
        date = moment(moment().add(index + 1, 'days')).format('MMMM Do YYYY');
        //store all the appropriate weather icon, image, temp, windspeed, and humidity in appropriate variable
        icon = result.daily[index].weather[0].icon;
        iconURL = `<img src="https://openweathermap.org/img/w/${icon}.png">`
        temp = result.daily[index].temp.day;
        wind = result.daily[index].wind_speed;
        humid = result.daily[index].humidity;
        //create literal template of information to be appended to the weatherCard
        weatherCard.innerHTML = `<h2>${date}</h2>
                                ${iconURL} <br> 
                                Temp: ${temp} °F <br> 
                                Wind: ${wind} MPH <br> 
                                Humidity: ${humid} %`;
        $("#dayForecast div").addClass("forecastWidth");
        // weatherCard.addClass("col-2");
        weatherForecast.append(weatherCard);
        hidden.classList.remove('hidden');
    }
}

function createSearchResults() {
    //create div element and store it into historyResult variable
    var historyResult = document.createElement("div")
    //remove previous historyResult divs
    historyResult.remove();
    //get search cities data from local storage and store it into cities
    cities = JSON.parse(localStorage.getItem("Searched Cities"));
    //loop through and append each searched cities into the search history
    for (let index = 0; index < cities.length; index++) {
        historyResult.innerHTML = cities[index];
        listofSearch.append(historyResult);


    }

}

searchForm.on('submit', init);