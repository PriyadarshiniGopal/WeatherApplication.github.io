import { getData, dateTime } from "./utility.js";
let interval = [];

//retrieve json data
getData().then(function (data) {

    let sortIcon = document.getElementsByName('sort-icon');  //fetch sorting icons
    let cityList = JSON.parse(JSON.stringify(data));

    //clear previously setInterval values
    function clearsetInterval() {
        for (let index = 0; index < interval.length; index++)
            clearInterval(interval[index]);
    }

    //sort cities based on continent or temperature
    function sortCity(e) {
        let continentName = document.querySelectorAll('.continent-name.medium'); //continent Name
        let cityName = document.getElementsByName('continent-city-name');         //City name 
        let time = document.getElementsByName('continent-city-time');              //city time
        let temperature = document.querySelectorAll('.bold.continent-city-temperature'); //temperature of city
        let humidity = document.getElementsByName('continent-city-humidity');             //humidity of city
        let sortImage = document.getElementsByName('sort-icon');        //sorting icon 
        let indexOfImage = [].indexOf.call(sortIcon, e.target);       //image of clicked icon
        let sortingArrow = sortImage[indexOfImage].alt;               //icon to find ascending or descending order
        const sortByContinent = (obj, option, order) => {
            return Object.assign(...Object.entries(obj).sort((a, b) => {
                let timeZone1 = [], timeZone2 = [];
                timeZone1 = (a[1]['timeZone']).split('/');
                timeZone2 = b[1]['timeZone'].split('/');
                if (option === 'continent') {
                    if (order === 'downarrow')
                        return timeZone1[0] < timeZone2[0] ? -1 : 1;
                    else
                        return timeZone1[0] > timeZone2[0] ? -1 : 1;
                }
                else if (option === 'temperature' && timeZone1[0] === timeZone2[0]) {
                    let t1 = a[1]['temperature'];
                    let t2 = b[1]['temperature'];
                    t1 = Number(t1.slice(0, -2));
                    t2 = Number(t2.slice(0, -2));
                    if (order === 'downarrow')
                        return t1 > t2 ? 1 : -1;
                    else
                        return t1 < t2 ? 1 : -1;
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
        for (let items in cityList) {
            if (index > 11)
                break;
            let timezone = cityList[items]['timeZone'];
            let continent = timezone.split('/');
            continentName[index].innerHTML = continent[0];
            cityName[index].innerHTML = cityList[items]['cityName'] + ',';
            time[index].innerHTML = dateTime(timezone, 'time') + ' ' + (dateTime(timezone, 'period')).toUpperCase();
            (function (index) {             //to dynamically change time for city
                interval[index] = setInterval(() =>
                    time[index].innerHTML = dateTime(timezone, 'time') + ' ' + (dateTime(timezone, 'period')).toUpperCase(), 1000);
            })(index);
            temperature[index].innerHTML = cityList[items]['temperature'];
            humidity[index].innerHTML = cityList[items]['humidity'];
            index++;
        }
    }
    for (let icon of sortIcon) {
        icon.addEventListener('click', sortCity);      //add event listener of icons
        icon.dispatchEvent(new Event('click'));
    }
});