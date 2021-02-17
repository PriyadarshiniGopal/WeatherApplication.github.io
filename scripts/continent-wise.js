import { dateTime } from "./utility.js";
import { cityDetails } from "./classes.js";
import { getCityData } from "./web-api.js";
let interval = [];
let cities = {};
let data;
/**
 * To retrieve json data
 * @param {JSON} data
 */
getCityData().then(function (retrieveData) {
    data = JSON.parse(retrieveData);
    let sortIcon = document.getElementsByName('sort-icon');  //fetch sorting icons
    let continentCityCards = document.querySelector('.continent-city-list');
    // storing all instances as array
    for (let city of data) {
        let eachCity = new cityDetails(city);
        cities[city.cityName] = eachCity;
    }

    /**
     * To clear previously setInterval values    
     */
    function clearsetInterval() {
        for (let index = 0; index < interval.length; index++)
            clearInterval(interval[index]);
    }

    /**
     * To sort cities based on continent or temperature
     * @param {Event} e 
     */
    function sortCity(e) {

        /**
         * To change each continent city cards
         * @param {Number} index 
         */
        function updateContinentCity(index) {
            let timezone = this.timeZone;
            let continent = timezone.split('/');
            let content = '';
            content += '<div class="continent-city">';
            content += '<div class="continent-city-name">';
            content += '<p class="continent-name medium">' + continent[0] + '</p>';
            content += '<div class="current-city-time">';
            content += '<p name="continent-city-name">' + this.cityName + '</p>';
            content += '<p name="continent-city-time">' + ', ' + dateTime(timezone, 'time') + ' ' + (dateTime(timezone, 'period')).toUpperCase(); +'</p>';
            content += '</div ></div ><div>';
            content += '<p class="bold continent-city-temperature">' + this.temperature + '</p>';
            content += '<div class="humidity">';
            content += '<img alt="humidity" src="./assets/icons/weather/humidityIcon.svg">';
            content += '<span name="continent-city-humidity">' + this.humidity + '</span>';
            content += ' </div></div></div>';
            continentCityCards.innerHTML += content;
            interval[index] = setInterval(() => {
                let time = ', ' + dateTime(timezone, 'time') + ' ' + (dateTime(timezone, 'period')).toUpperCase();
                document.getElementsByName('continent-city-time')[index].innerHTML = time;
            }, 10000)
        }

        /**
         * To sort cities of continent based on temperature
         * @param {Object} obj 
         * @param {String} option 
         * @param {String} order 
         */
        const sortByContinent = (obj, option, order) => {
            return Object.assign(...Object.entries(obj).sort((object1, object2) => {
                let timeZone1 = [], timeZone2 = [];
                timeZone1 = (object1[1]['timeZone']).split('/');
                timeZone2 = object2[1]['timeZone'].split('/');
                if (option === 'continent') {
                    if (order === 'uparrow')
                        return timeZone1[0] < timeZone2[0] ? -1 : 1;
                    else
                        return timeZone1[0] > timeZone2[0] ? -1 : 1;
                }
                else if (option === 'temperature' && timeZone1[0] === timeZone2[0]) {
                    let temperature1 = object1[1]['temperature'];
                    let temperature2 = object2[1]['temperature'];
                    temperature1 = Number(temperature1.slice(0, -2));
                    temperature2 = Number(temperature2.slice(0, -2));
                    if (order === 'uparrow')
                        return temperature1 > temperature2 ? 1 : -1;
                    else
                        return temperature1 < temperature2 ? 1 : -1;
                }
                return null;
            })
                .map(([key, value]) => {
                    return {
                        [key]: value
                    }
                }));
        }
        cities = sortByContinent(cities, e.target.getAttribute('value'), e.target.alt);
        if (e.target.alt === 'downarrow') {
            e.target.alt = 'uparrow';
            e.target.src = './assets/icons/general/arrowUp.svg';
            e.target.setAttribute('title', 'Toggle for descending order');
        }
        else {
            e.target.alt = 'downarrow';
            e.target.src = './assets/icons/general/arrowDown.svg';
            e.target.setAttribute('title', 'Toggle for ascending order');
        }
        clearsetInterval();
        let index = 0;
        continentCityCards.innerHTML = '';
        for (let items in cities) {
            if (index > 11)
                break;
            updateContinentCity.apply(cities[items], [index]);
            index++;
        }
    }
    for (let icon of sortIcon) {
        icon.addEventListener('click', sortCity);      //add event listener of icons
        icon.dispatchEvent(new Event('click'));
    }
});