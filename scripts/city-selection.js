import { celciusToFahrenheit, dateTime, getData } from "./utility.js";
let repeat, weatherForecastInterval;

/**
 * To retrieve all city details -cityName,dateAndTime,timeZone,temperature,humidity,precipitation,nextFiveHrs
 * @param {JSON} data
 */
getData().then(function (data) {

    let cityinput = document.getElementById("city");
    let form = document.getElementById("city-name-form");
    let cityList = document.getElementById("city-list"); // datalist element
    let previousCityName;
    let time = document.querySelectorAll(".forecast-time");
    let icon = document.querySelectorAll(".next-weather-icon");
    let nextTemperature = document.querySelectorAll(".next-temperature");
    list();

    /**
     * To add option dynamically for city selection input
     */
    function list() {
        let cities = Object.keys(data);
        for (let city of cities) {
            let option = document.createElement('option');
            option.value = data[city]['cityName'];  // update options from json key value
            cityList.appendChild(option);
        }
    }

    /**
     * To validate city name input box
     */
    function inputValidation() {
        let inputText = cityinput.value;
        for (let City in data) {
            if (data[City]['cityName'] === inputText) {
                for (let index = 0; index < icon.length; index++) {
                    icon[index].style.visibility = "initial";
                }
                document.getElementById("error-msg").innerHTML = "";
                document.getElementById("selected-city-icon").style.display = "initial";
                document.getElementById("period").style.display = 'initial';
                cityinput.style.border = "none";
                return true;
            }
        }

        // set all values nil and input error message
        cityinput.style.border = "4px solid red";
        clearInterval(repeat);
        clearInterval(weatherForecastInterval);
        document.getElementById("error-msg").innerHTML = "Invalid CityName";
        document.querySelector(".date").innerHTML = '-- - --- - ----';
        document.querySelector(".time").innerHTML = '-- : --';
        document.querySelector(".sec").innerHTML = ' : --';
        document.getElementById("period").style.display = 'none';
        document.getElementById("celcius").innerHTML = 'NIL';
        document.getElementById("selected-city-icon").style.display = 'none';
        document.getElementById("fahrenheit").innerHTML = 'NIL';
        document.getElementById("city-humidity").innerHTML = 'NIL';
        document.getElementById("city-precipitation").innerHTML = 'NIL';
        for (let index = 0; index < icon.length; index++) {
            icon[index].style.visibility = "hidden";
        }
        for (let index = 0; index < nextTemperature.length; index++) {
            nextTemperature[index].innerHTML = "NIL";
        }
        for (let index = 1; index < time.length; index++) {
            time[index].innerHTML = "NIL";
        }
        return false;
    }

    /**
     * To update current date time and state icon
     * @param {String} timezone 
     */
    function clock(timezone) {
        let period = dateTime(timezone, 'period');
        document.querySelector(".date").innerHTML = (dateTime(timezone, 'date'));
        document.querySelector(".time").innerHTML = (dateTime(timezone, 'time'));
        document.querySelector(".sec").innerHTML = " : " + (dateTime(timezone, 'seconds'));
        document.getElementById("period").src = "./assets/icons/general/" + period + "State.svg";
    }

    /**
     * To find next 5 hour weather 
     * @param {String} hour 
     */
    function nextHour(hour) {
        let nextHour = hour.slice(0, -2); // get number from hour
        let state = hour.slice(-2); // get state from hour
        nextHour = Number(nextHour);        // convert string to number
        if (nextHour == 11)
            state = state === 'AM' ? 'PM' : 'AM';   // to change AM PM values after 12 hours
        nextHour = nextHour >= 12 ? nextHour - 12 + 1 : nextHour + 1;
        return nextHour + state;      // return time with state
    }

    /**
     * To find icon for  next fivehours weather
     * @param {String} temperature 
     */
    function weatherIcon(temperature) {
        temperature = temperature.slice(0, -2);
        temperature = Number(temperature);
        return temperature > 29 ? "sunny" : temperature >= 23 ? "cloudy" : temperature >= 18 ? "rainy" : "windy";
    }

    /**
     * To Update weather forecast 
     * @param {String} cityName 
     * @param {String} timezone 
     */
    function weather(cityName, timezone) {
        let hour = (dateTime(timezone, 'hour')) + "" + (dateTime(timezone, 'period')).toUpperCase();
        for (let child of time) {
            if (child !== time[0]) {
                hour = nextHour(hour);  // find next hour
                child.textContent = hour;
            }
        }
        let temperature;
        for (let index = 0; index < nextTemperature.length; index++) { // update temperature for next hours
            if (index == 0)
                temperature = data[cityName]['temperature'];
            else
                temperature = data[cityName]['nextFiveHrs'][index - 1];
            nextTemperature[index].innerHTML = temperature.slice(0, -2);
            let weather = weatherIcon(temperature); // update icon based on temperature
            icon[index].src = "./assets/icons/weather/" + weather + "Icon.svg";
        }
    }

    /**
     * event Handler to change topsection 
     */
    function topSection() {
        let cityName = cityinput.value;
        cityName = cityName.toLowerCase();
        if (!inputValidation()) {
            return;
        }
        document.getElementById("celcius").innerHTML = (data[cityName]['temperature']);
        document.getElementById("selected-city-icon").src = (`./assets/icons/Cities/${cityName}.svg`);
        document.getElementById("fahrenheit").innerHTML = celciusToFahrenheit(data[cityName]['temperature']);
        document.getElementById("city-humidity").innerHTML = data[cityName]['humidity'];
        document.getElementById("city-precipitation").innerHTML = data[cityName]['precipitation'];
        if (repeat) {
            clearInterval(repeat);
        }
        let timezone = data[cityName]['timeZone'];
        clock(timezone);
        repeat = setInterval(clock, 1000, timezone);    // set interval to update time
        if (weatherForecastInterval) {
            clearInterval(weatherForecastInterval);
        }
        weather(cityName, timezone);
        weatherForecastInterval = setInterval(weather, 1000, cityName, timezone);
        previousCityName = cityinput.value;
    }

    /**
     * set previous city name if current city name is invalid
     */
    function setPreviousCityName() {
        if (!inputValidation()) {
            cityinput.value = previousCityName;
            topSection();
        }
    }

    /**
     * To list all options
     * @param {Event} e 
     */
    function listCity(e) {
        if (e.target.selectionStart !== 0)
            return;
        cityinput.setAttribute('placeholder', previousCityName);
        cityinput.value = '';
    }

    cityinput.addEventListener('blur', setPreviousCityName);
    cityinput.addEventListener('click', listCity);
    cityinput.addEventListener('input', inputValidation);
    form.addEventListener('input', topSection);
    form.dispatchEvent(new Event("input"));
});