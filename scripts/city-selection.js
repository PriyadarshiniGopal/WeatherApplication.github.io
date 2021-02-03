import { celciusToFahrenheit, dateTime, getData } from "./utility.js";
let repeat, weatherForecastInterval;

//retrieve json data
getData().then(function (data) {

    //values fetched
    let cityinput = document.getElementById("city");
    let form = document.getElementById("city-name-form");
    let cityList = document.getElementById("city-list"); //datalist element
    let previousCityName;
    list();

    //dynamic datalist option
    function list() {
        let cities = Object.keys(data);
        for (let city of cities) {
            let option = document.createElement('option');
            option.value = data[city]['cityName'];  //update options from json key value
            cityList.appendChild(option);
        }
    }

    //validate city Name input 
    function inputValidation() {
        let inputText = cityinput.value;
        let icon = document.querySelectorAll(".next-weather-icon");
        for (let City in data) {
            if (data[City]['cityName'] === inputText) {
                cityinput.style.border = "none";
                for (let index = 0; index < icon.length; index++) {
                    document.getElementById("error-msg").innerHTML = "";
                    icon[index].style.visibility = "initial";
                    document.getElementById("selected-city-icon").style.display = "initial";
                    cityinput.style.border = "none";
                }
                return true;
            }
        }

        //set all values to NIL if city name is null or wrong
        cityinput.style.border = "2px solid red";
        document.getElementById("error-msg").innerHTML = "Invalid CityName";
        document.getElementById("selected-city-icon").style.display = "none";
        document.getElementById("celcius").innerHTML = 'NIL';
        document.getElementById("fahrenheit").innerHTML = 'NIL';
        document.getElementById("city-humidity").innerHTML = 'NIL';
        document.getElementById("city-precipitation").innerHTML = 'NIL';
        let time = document.querySelectorAll(".forecast-time");
        let temp = document.querySelectorAll(".next-temp");
        for (let child of time) {
            if (child !== time[0]) {
                child.textContent = 'NIL';
            }
        }
        for (let index = 0; index < temp.length; index++) {
            temp[index].innerHTML = 'NIL';
            icon[index].style.visibility = "hidden";
        }
        return false;
    }

    //update current date time and state icon
    function clock(timezone) {
        document.querySelector(".date").innerHTML = (dateTime(timezone, 'date'));
        document.querySelector(".time").innerHTML = (dateTime(timezone, 'time'));
        document.querySelector(".sec").innerHTML = " : " + (dateTime(timezone, 'seconds'));
        let period = dateTime(timezone, 'period');
        document.getElementById("period").src = "./assets/icons/general/" + period + "State.svg";
    }

    //next 5 hour weather update
    function nextHour(hour) {
        let hr = hour.slice(0, -2); //get number from hour
        let state = hour.slice(-2); //get state from hour
        hr = Number(hr);        //convert string to number
        if (hr == 11)
            state = state === 'AM' ? 'PM' : 'AM';   //to change AM PM values after 12 hours
        hr = hr >= 12 ? hr - 12 + 1 : hr + 1;
        return hr + state;      //return time with state
    }

    // find icon for  next fivehours weather
    function weatherIcon(temp) {
        temp = temp.slice(0, -2);
        temp = Number(temp);
        return temp > 29 ? "sunny" : temp >= 23 ? "cloudy" : temp >= 18 ? "rainy" : "windy";
    }

    //weather forecast
    function weather(cityName, timezone) {
        let hour = (dateTime(timezone, 'hour')) + "" + (dateTime(timezone, 'period')).toUpperCase();
        let time = document.querySelectorAll(".forecast-time");
        let icon = document.querySelectorAll(".next-weather-icon");
        let temp = document.querySelectorAll(".next-temp");
        for (let child of time) {
            if (child !== time[0]) {
                hour = nextHour(hour);  //find next hour
                child.textContent = hour;
            }
        }
        let temperature;
        for (let index = 0; index < temp.length; index++) { //update temperature for next hours
            if (index == 0)
                temperature = data[cityName]['temperature'];
            else
                temperature = data[cityName]['nextFiveHrs'][index - 1];
            temp[index].innerHTML = temperature.slice(0, -2);
            let weather = weatherIcon(temperature); //update icon based on temperature
            icon[index].src = "./assets/icons/weather/" + weather + "Icon.svg";
        }
    }

    //event Handler to change topsection 
    function topSection() {
        //fetch all DOM elements
        let cityName = cityinput.value;
        cityName = cityName.toLowerCase();
        if (!inputValidation()) {
            cityinput.addEventListener('mouseout', () => {
                cityinput.value = previousCityName.charAt(0).toUpperCase() + previousCityName.slice(1);
                topSection();
            });
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
        repeat = setInterval(clock, 1000, timezone);    //set interval to update time
        if (weatherForecastInterval) {
            clearInterval(weatherForecastInterval);
        }
        weatherForecastInterval = setInterval(weather(cityName, timezone), 1000, timezone);
        previousCityName = cityName;
    }

    //event listener to all elements
    cityinput.addEventListener('input', inputValidation)
    form.addEventListener('input', topSection);
    form.dispatchEvent(new Event("input"));
});