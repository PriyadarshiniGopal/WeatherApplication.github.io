import { getData, dateTime } from "./utility.js";
let interval = [];

//retrieve json data
getData().then(function (data) {
    let card = document.querySelectorAll(".city-detail-card");   //list of all cards
    let arrowIcon = document.querySelectorAll(".center");        //scroll arrows
    let cityList = document.querySelector(".city-card-scroll"); // scroll bar contains city cards
    let preferenceIcons = document.getElementsByName('preference'); //preference icon sunny,rainy,snow
    let cityCount = document.getElementById("city-count");     //display top input value
    let currentCityCount = 10;                   //to fetch currenty displaying cities count

    //to disable arrows
    function arrow(cityCardCount) {
        if (cityCardCount <= 4) {
            arrowIcon[0].style.display = 'none';
            arrowIcon[1].style.display = 'none';
        }
        else if (currentCityCount > 4) {
            arrowIcon[0].style.display = 'initial';
            arrowIcon[1].style.display = 'initial';
        }
    }

    //to change list of city cards based on display top value
    function changeCardList(e) {
        if (e.target.value < 3) {
            e.target.value = 3;
        }
        for (let count = 0; count < e.target.value && count < currentCityCount; count++)
            card[count].style.display = 'initial';

        for (let count = e.target.value; count < 10 && count < currentCityCount; count++)
            card[count].style.display = 'none';
        arrow(e.target.value);
    }

    //function to scroll left city list
    function scrollLeft() {
        cityList.scrollLeft -= 1000;
    }

    //function to scroll right city list
    function scrollRight() {
        cityList.scrollLeft += 1000;
    }

    //clear previously setInterval values
    function clearsetInterval() {
        for (let index = 0; index < interval.length; index++)
            clearInterval(interval[index]);
    }

    //update details of each  cityCards in scroll
    function updateCityCard(resultCity, option) {
        clearsetInterval.call();
        let cityName = document.querySelectorAll(".bold.city-name");  // city Name of card
        let preferenceIcon = document.querySelectorAll(".preference-icon"); //preference icon sunny,snow and rany
        let temperature = document.querySelectorAll(".bold.temperature");   //temperature of the city
        let time = document.querySelectorAll(".bold.city-time");    //current time of city
        let date = document.querySelectorAll(".bold.city-date");    //date of city
        let humidity = document.querySelectorAll(".city-humidity-value");   //humidity value of city
        let precipitation = document.querySelectorAll(".precipitation-value");  //precipitation value for the city
        arrowIcon[0].style.display = 'initial';
        arrowIcon[1].style.display = 'initial';
        let index = 0;
        for (let cityCard of card) {    //toset display none to all city cards
            cityCard.style.display = "none";
        }
        for (let items in resultCity) {
            if (index >= 10)
                break;
            card[index].style.display = "initial";  //to make selected city cards to visible
            card[index].style.backgroundImage = "url(../assets/icons/Cities/" + items + ".svg)";    //set values from json data
            cityName[index].innerHTML = resultCity[items]['cityName'];
            preferenceIcon[index].src = "./assets/icons/weather/" + option + "Icon.svg"
            temperature[index].innerHTML = resultCity[items]['temperature'];
            let timezone = resultCity[items]['timeZone'];
            time[index].innerHTML = dateTime(timezone, 'time') + ' ' + (dateTime(timezone, 'period')).toUpperCase();
            (function (index) {             //to dynamically change time for city
                interval[index] = setInterval(() =>
                    time[index].innerHTML = dateTime(timezone, 'time') + ' ' + (dateTime(timezone, 'period')).toUpperCase(), 1000);
            })(index);
            date[index].innerHTML = dateTime(timezone, 'date');
            humidity[index].innerHTML = resultCity[items]['humidity'];
            precipitation[index].innerHTML = resultCity[items]['precipitation'];
            index++;
        }
        currentCityCount = index;
        cityCount.value = index;    //to set value for display top input box
        arrow(index);           //call arrow function to disappear or visible arrrow
    }

    //sort city based 
    function sortCities(e) {
        let resultCity = {};
        resultCity = Object.keys(data)
            .filter(function (key) {        //filter cities based on user preference
                let temp = Number(data[key].temperature.slice(0, -2));
                let humidity = Number(data[key].humidity.slice(0, -1));
                let precipitation = Number(data[key].precipitation.slice(0, -1));
                if (e.target.value === 'sunny' && temp >= 29 && humidity < 50 && precipitation >= 50) {
                    return key;
                }
                else if (e.target.value === 'snowflake' && temp > 20 && humidity > 50 && precipitation < 50)
                    return key;
                else if (e.target.value === 'rainy' && temp < 20 && humidity >= 50)
                    return key;
            }
            )
            .reduce((obj, key) => {
                obj[key] = data[key];
                return obj;
            }, {});

        //sort obtained cities based on property values(temperature ,precipitation,humidity) most to least
        const sortKeys = (obj, option) => {
            return Object.assign(...Object.entries(obj).sort((a, b) => {
                let t1 = a[1][option];
                let t2 = b[1][option];
                t1 = Number(t1.slice(0, -1));
                t2 = Number(t2.slice(0, -1));
                if (option == 'temperature') {
                    t1 = Number(t1 + ''.slice(0, -1));
                    t2 = Number(t2 + ''.slice(0, -1));
                }
                return t1 < t2 ? 1 : -1;
            }).map(([key, value]) => {
                return {
                    [key]: value
                }
            }));
        }

        if (e.target.value === 'sunny')
            Object.keys(sortKeys(resultCity, 'temperature'));
        else if (e.target.value === 'snowflake')
            Object.keys(sortKeys(resultCity, 'precipitation'));
        else if (e.target.value === 'rainy')
            Object.keys(sortKeys(resultCity, 'humidity'));
        updateCityCard(resultCity, e.target.value);
    }
    //adding event Listener to elements
    for (let icons of preferenceIcons) {
        icons.addEventListener('change', sortCities);
        icons.dispatchEvent(new Event("change"));   //to trigger programatically
    }
    cityCount.addEventListener('change', changeCardList);
    cityCount.addEventListener('input', changeCardList);
    arrowIcon[0].addEventListener('click', scrollLeft);
    arrowIcon[1].addEventListener('click', scrollRight);
});