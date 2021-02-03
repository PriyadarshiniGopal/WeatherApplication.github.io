import { getData, dateTime } from "./utility.js";
let interval = [];

//retrieve json data
getData().then(function (data) {

    let sortIcon = document.getElementsByName('sort-icon');  //fetch sorting icons
    let cityList = JSON.parse(JSON.stringify(data));
    let continentCityCards = document.querySelector('.continent-city-list');
    //clear previously setInterval values
    function clearsetInterval() {
        for (let index = 0; index < interval.length; index++)
            clearInterval(interval[index]);
    }

    //sort cities based on continent or temperature
    function sortCity(e) {

        //change each continent city cards
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

        const sortByContinent = (obj, option, order) => {
            return Object.assign(...Object.entries(obj).sort((object1, object2) => {
                let timeZone1 = [], timeZone2 = [];
                timeZone1 = (object1[1]['timeZone']).split('/');
                timeZone2 = object2[1]['timeZone'].split('/');
                if (option === 'continent') {
                    if (order === 'downarrow')
                        return timeZone1[0] < timeZone2[0] ? -1 : 1;
                    else
                        return timeZone1[0] > timeZone2[0] ? -1 : 1;
                }
                else if (option === 'temperature' && timeZone1[0] === timeZone2[0]) {
                    let temperature1 = object1[1]['temperature'];
                    let temperature2 = object2[1]['temperature'];
                    temperature1 = Number(temperature1.slice(0, -2));
                    temperature2 = Number(temperature2.slice(0, -2));
                    if (order === 'downarrow')
                        return temperature1 > temperature2 ? 1 : -1;
                    else
                        return temperature1 < temperature2 ? 1 : -1;
                }
                else
                    return null;
            })
                .map(([key, value]) => {
                    return {
                        [key]: value
                    }
                }));
        }
        cityList = sortByContinent(cityList, e.target.getAttribute('value'), e.target.alt);
        if (e.target.alt === 'downarrow') {
            e.target.alt = 'uparrow';
            e.target.src = './assets/icons/general/arrowUp.svg';
            e.target.setAttribute('title', 'descending order');
        }
        else {
            e.target.alt = 'downarrow';
            e.target.src = './assets/icons/general/arrowDown.svg';
            e.target.setAttribute('title', 'ascending order');
        }
        clearsetInterval();
        let index = 0;
        continentCityCards.innerHTML = '';
        for (let items in cityList) {
            if (index > 11)
                break;
            updateContinentCity.apply(cityList[items], [index]);
            index++;
        }
    }
    for (let icon of sortIcon) {
        icon.addEventListener('click', sortCity);
        icon.dispatchEvent(new Event('click'));
    }
});