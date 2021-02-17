import { dateTime } from "./utility.js";
import { cityDetails } from "./classes.js";
import { getCityData } from "./web-api.js";
let interval = [];
let cities = [];
let data;

/**
 * To retrive json data
 * @param {object} data
*/
getCityData().then(function (retrieveData) {
    try {
        let arrowIcon = document.querySelectorAll(".center");           //scroll arrows
        let cityList = document.querySelector(".city-card-scroll");     // scroll bar contains city cards
        let preferenceIcons = document.getElementsByName('preference'); //preference icon sunny,rainy,snow
        let cityCount = document.getElementById("city-count");          //display top input value
        let currentCityCount = 10;                                      //to fetch currenty displaying cities count
        function updateInstance() {
            data = JSON.parse(retrieveData);
            // storing all instances as array
            for (let city of data) {
                let eachCity = new cityDetails(city);
                cities.push(eachCity);
            }
        }
        updateInstance();
        // fetch city details every 4 hours
        setInterval(updateInstance, 14400000);

        /**
         * To restrict manual entry for display top input
         * @param {Event} e
        */
        function restrictEntry(e) {
            e.preventDefault();
        }

        /** 
         * To disable arraw when city cards not overflow
        */
        function arrow() {
            if (cityList.scrollWidth > cityList.clientWidth) {
                arrowIcon[0].style.visibility = 'initial';
                arrowIcon[1].style.visibility = 'initial';
            }
            else {
                arrowIcon[0].style.visibility = 'hidden';
                arrowIcon[1].style.visibility = 'hidden';
            }
        }

        /**
         * To update city cards list
         * @param {Event} e 
         */
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

        /**
         * To scroll left city list
         */
        function scrollLeft() {
            this.scrollLeft -= this.clientWidth;
        }

        /**
         * To scroll right city list
         */
        function scrollRight() {
            this.scrollLeft += this.clientWidth;
        }

        /**
         * To clear previously setInterval values
         */
        function clearsetInterval() {
            for (let index = 0; index < interval.length; index++)
                clearInterval(interval[index]);
        }

        /**
         * To assign all values to city cards
         * @param {number} cityItems 
         * @param {string} option 
         */
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

        /**
         * To update details of each  cityCards in scroll
         * @param {Object} resultCity 
         * @param {String} option 
         */
        function updateCityCard(resultCity, option) {
            clearsetInterval.call();
            document.querySelector('.card-list').innerHTML = '';
            arrowIcon[0].style.visibility = 'initial';
            arrowIcon[1].style.visibility = 'initial';
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

        /**
         * To sort City based on preference
         * @param {Event} e 
         */
        function sortCities(e) {
            let resultCity = {};
            resultCity = Object.keys(cities)
                .filter(function (key) {        //filter cities based on user preference
                    return cities[key].sortingCity(e);
                }
                )
                .reduce((obj, key) => {
                    obj[key] = data[key];
                    return obj;
                }, {});

            /**
             * To sort obtained cities based on property values(temperature ,precipitation,humidity) most to least
             * @param {Object} obj 
             * @param {String} option 
             */
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
    }
    catch (error) {
        alert("something went wrong" + error);
    }
});