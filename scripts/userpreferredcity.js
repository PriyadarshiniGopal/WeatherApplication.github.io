import { getData, dateTime } from "./utility.js";
let interval = [];

//retrieve json data
getData().then(function (data) {
    let arrowIcon = document.querySelectorAll(".center");           //scroll arrows
    let cityList = document.querySelector(".city-card-scroll");     // scroll bar contains city cards
    let preferenceIcons = document.getElementsByName('preference'); //preference icon sunny,rainy,snow
    let cityCount = document.getElementById("city-count");          //display top input value
    let currentCityCount = 10;                                      //to fetch currenty displaying cities count

    //restrict manual entry
    function restrictEntry(e) { e.preventDefault(); };

    //to disable arrows
    function arrow() {
        if (cityList.scrollWidth > cityList.clientWidth) {
            arrowIcon[0].style.display = 'initial';
            arrowIcon[1].style.display = 'initial';
        }
        else {
            arrowIcon[0].style.display = 'none';
            arrowIcon[1].style.display = 'none';
        }
    }

    //to change list of city cards based on display top value
    function changeCardList(e) {
        if (e.target.value < 3) {
            e.target.value = 3;
        }

        if (e.target.value > currentCityCount) {
            e.target.value = currentCityCount;
        }
        let card = document.querySelectorAll(".city-detail-card");       //list of all cards
        for (let count = 0; count < e.target.value && count < currentCityCount; count++)
            card[count].style.display = 'initial';

        for (let count = e.target.value; count < 10 && count < currentCityCount; count++)
            card[count].style.display = 'none';
        arrow(e.target.value);
    }

    //function to scroll left city list
    function scrollLeft() {
        this.scrollLeft -= cityList.clientWidth;
    }

    //function to scroll right city list
    function scrollRight() {
        this.scrollLeft += cityList.clientWidth;
    }

    //clear previously setInterval values
    function clearsetInterval() {
        for (let index = 0; index < interval.length; index++)
            clearInterval(interval[index]);
    }

    //assign all values to city cards
    function assignValues(cityItems, option) {
        let str = '<div class="city-detail-card" style="background-image:url(assets/icons/Cities/' + this.cityName.toLowerCase() + '.svg)">';
        str += '<span class="bold city-name">' + this.cityName + '</span>';
        str += '<span class="temperature-detail">';
        str += '<img alt="temperature" class="preference-icon" src="./assets/icons/weather/' + option + 'Icon.svg" >';
        str += '  <span class="bold temperature">' + this.temperature + '</span></span>';
        str += '<div  class="info" >';
        str += '<p class="bold city-time">';
        let timezone = this.timeZone;
        let time = dateTime(timezone, 'time') + ' ' + (dateTime(timezone, 'period')).toUpperCase();
        str += time;
        str += '</p > ';
        str += '<p class="bold city-date">' + dateTime(timezone, 'date') + '</p>';
        str += '<div class="humidity-image">';
        str += '<img alt="humidity" class="image-margin-right" src="./assets/icons/weather/humidityIcon.svg"> <span class="city-humidity-value">' + this.humidity + '</span>';
        str += '</div><div class="precipitation-image">';
        str += '<img alt="Precipitation" class="image-margin-right" src="./assets/icons/weather/precipitationIcon.svg"> <span class="precipitation-value"> ' + this.precipitation + '</span>';
        str += '</div></div></div > ';
        document.querySelector('.card-list').innerHTML += str;
        interval[cityItems] = setInterval(() =>
            document.querySelectorAll(".bold.city-time")[cityItems].innerHTML = dateTime(timezone, 'time') + ' ' + (dateTime(timezone, 'period')).toUpperCase(), 1000);
    }

    //update details of each  cityCards in scroll
    function updateCityCard(resultCity, option) {
        clearsetInterval.call();
        document.querySelector('.card-list').innerHTML = '';
        arrowIcon[0].style.display = 'initial';
        arrowIcon[1].style.display = 'initial';
        let cityItems = 0;
        for (let items in resultCity) {
            if (cityItems >= 10)
                break;
            assignValues.apply(resultCity[items], [cityItems, option]);
            cityItems++;
        }
        if (cityItems < 4)      //disable the spinner
            cityCount.disabled = 'disabled';
        else
            cityCount.disabled = '';
        currentCityCount = cityItems;
        cityCount.value = cityItems;    //to set value for display top input box
        arrow(cityItems);           //call arrow function to disappear or visible arrrow
    }

    //sort city based 
    function sortCities(e) {
        let resultCity = {};
        resultCity = Object.keys(data)
            .filter(function (key) {        //filter cities based on user preference
                let temperature = Number(data[key].temperature.slice(0, -2));
                let humidity = Number(data[key].humidity.slice(0, -1));
                let precipitation = Number(data[key].precipitation.slice(0, -1));
                if (e.target.value === 'sunny' && temperature >= 29 && humidity < 50 && precipitation >= 50) {
                    return key;
                }
                else if (e.target.value === 'snowflake' && temperature > 20 && humidity > 50 && precipitation < 50)
                    return key;
                else if (e.target.value === 'rainy' && temperature < 20 && humidity >= 50)
                    return key;
            }
            )
            .reduce((obj, key) => {
                obj[key] = data[key];
                return obj;
            }, {});

        //sort obtained cities based on property values(temperature ,precipitation,humidity) most to least
        const sortKeys = (obj, option) => {
            return Object.assign(...Object.entries(obj).sort((object1, object2) => {
                let optionValue1 = object1[1][option];
                let optionValue2 = object2[1][option];
                optionValue1 = Number(optionValue1.slice(0, -1));
                optionValue2 = Number(optionValue2.slice(0, -1));
                if (option == 'temperature') {
                    optionValue1 = Number(optionValue1 + ''.slice(0, -1));
                    optionValue2 = Number(optionValue2 + ''.slice(0, -1));
                }
                return optionValue1 < optionValue2 ? 1 : -1;
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
    let scrolleventleft = scrollLeft.bind(cityList);
    let scrolleventright = scrollRight.bind(cityList);
    arrowIcon[0].addEventListener('click', scrolleventleft);
    arrowIcon[1].addEventListener('click', scrolleventright);
    cityCount.addEventListener('keypress', restrictEntry);
});