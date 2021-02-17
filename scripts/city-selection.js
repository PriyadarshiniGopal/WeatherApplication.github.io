import { celciusToFahrenheit } from "./utility.js";
import { cityDetails, selectedCity } from "./classes.js";
import { getCityData } from "./web-api.js";

let repeat, weatherForecastInterval, previousCityName;
let cities = [];
let data;
let cityInput = document.getElementById("city");
let form = document.getElementById("city-name-form");
let cityList = document.getElementById("city-list");
let time = document.querySelectorAll(".forecast-time");
let icon = document.querySelectorAll(".next-weather-icon");
let nextTemperature = document.querySelectorAll(".next-temperature");

/**
 * To retrieve all city details -cityName,dateAndTime,timeZone,temperature,humidity,precipitation,nextFiveHrs
 * @param {JSON} data
 */
getCityData().then(function (retrieveData) {
    data = JSON.parse(retrieveData);

    /**
     * To add option dynamically for city selection input
     */
    for (let city of data) {
        let eachCity = new cityDetails(city);
        cities.push(eachCity);
        let option = document.createElement('option');
        option.value = cities[cities.length - 1].cityName;  // update options from json key value
        cityList.appendChild(option);
    }

    /**
     * event Handler to change topsection 
     */
    function topSection() {
        let city, cityObject;
        let cityName = cityInput.value;
        for (let city of data) {
            if (city.cityName == cityName) {
                cityObject = city;
            }
        }
        if (!inputValidation()) {
            return;
        }
        city = new selectedCity(cityObject);
        cityName = cityName.toLowerCase();
        document.getElementById("celcius").innerHTML = city.temperature;
        document.getElementById("selected-city-icon").src = (`./assets/icons/Cities/${cityName}.svg`);
        document.getElementById("fahrenheit").innerHTML = celciusToFahrenheit(city.temperature);
        document.getElementById("city-humidity").innerHTML = city.humidity;
        document.getElementById("city-precipitation").innerHTML = city.precipitation;
        if (repeat) {
            clearInterval(repeat);
        }
        city.clock();
        repeat = setInterval(() => city.clock(), 1000);    // set interval to update time
        if (weatherForecastInterval) {
            clearInterval(weatherForecastInterval);
        }
        city.weather(time, nextTemperature, icon);
        weatherForecastInterval = setInterval(() => city.weather(time, nextTemperature, icon), 3600000);
        previousCityName = cityInput.value;
    }


    /**
     * To validate city name input box
     */
    function inputValidation() {
        let inputText = cityInput.value;
        for (let index = 0; index < cities.length; index++) {
            if (cities[index].cityName === inputText) {
                cityInput.style.border = "none";
                for (let imageIndex = 0; imageIndex < icon.length; imageIndex++) {
                    icon[imageIndex].style.visibility = "initial";
                }
                document.getElementById("error-msg").innerHTML = "";
                document.getElementById("selected-city-icon").style.display = "initial";
                document.getElementById("period").style.display = 'initial';
                cityInput.style.border = "none";
                return true;
            }
        }
        // set all values nil and input error message
        cityInput.style.border = "4px solid red";
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
     * set previous city name if current city name is invalid
     */
    function setPreviousCityName() {
        if (!inputValidation()) {
            cityInput.value = previousCityName;
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
        cityInput.setAttribute('placeholder', previousCityName);
        cityInput.value = '';
    }

    cityInput.addEventListener('blur', setPreviousCityName);
    cityInput.addEventListener('click', listCity);
    cityInput.addEventListener('input', inputValidation);
    form.addEventListener('input', topSection);
    form.dispatchEvent(new Event("input"));
});
