import { dateTime } from "./utility.js";
import { getWeather, getCityDateAndTime } from "./web-api.js";
/**
 * class for a list cities having methods
 * @param {Object} data -cityName, date, time, timeZone, humidity, precipitation, temperature, nextFiveHrs
 */
export class cityDetails {
    constructor(data) {
        this.cityName = data.cityName;
        this.dateAndTime = data.dateAndTime;
        this.timeZone = data.timeZone;
        this.temperature = data.temperature;
        this.humidity = data.humidity;
        this.precipitation = data.precipitation;
    }
    sortingCity(e) {
        let temperature = Number(this.temperature.slice(0, -2));
        let humidity = Number(this.humidity.slice(0, -1));
        let precipitation = Number(this.precipitation.slice(0, -1));
        if (e.target.value === 'sunny' && temperature >= 29 && humidity < 50 && precipitation >= 50) {
            return this;
        }
        else if (e.target.value === 'snowflake' && temperature >= 20 && humidity > 50 && precipitation < 50)
            return this;
        else if (e.target.value === 'rainy' && temperature < 20 && humidity >= 50)
            return this;
    }
}

/**
 * Inherit the properties of cityDetails to selected City
 */
export class selectedCity extends cityDetails {
    constructor(city) {
        super(city);
    }

    /**
     * to update next 5 hours weather forecast details
     */
    async weather(time, nextTemperature, icon) {
        let hour = (dateTime(this.timeZone, 'hour')) + "" + (dateTime(this.timeZone, 'period')).toUpperCase();
        for (let child of time) {
            if (child !== time[0]) {
                hour = this.nextHour(hour); // find next hour
                child.textContent = hour;
            }
        }
        let temperature, dateAndTime;
        await getCityDateAndTime(this.cityName).then((CityDateAndTime) => {
            dateAndTime = JSON.parse(CityDateAndTime).city_Date_Time_Name;
        });
        await getWeather(dateAndTime, 5).then((nextFiveHrsdata) => {
            let nextFiveHrs = JSON.parse(nextFiveHrsdata).temperature;
            for (let index = 0; index < nextTemperature.length; index++) { // update temperature for next hours
                if (index == 0)
                    temperature = this.temperature;

                else
                    temperature = nextFiveHrs[index - 1];
                nextTemperature[index].innerHTML = temperature.slice(0, -2);
                let weather = this.weatherIcon(temperature); // update icon based on temperature
                icon[index].src = "./assets/icons/weather/" + weather + "Icon.svg";
            }
        });
    }

    /**
     * To find next 5 hour weather
     * @param {String} hour
     */
    nextHour(hour) {
        let nextHour = hour.slice(0, -2); // get number from hour
        let state = hour.slice(-2); // get state from hour
        nextHour = Number(nextHour); // convert string to number
        if (nextHour == 11)
            state = state === 'AM' ? 'PM' : 'AM'; // to change AM PM values after 12 hours
        nextHour = nextHour >= 12 ? nextHour - 12 + 1 : nextHour + 1;
        return nextHour + state; // return time with state
    }

    /**
     * To find icon for  next fivehours weather
     * @param {String} temperature
     */
    weatherIcon(temperature) {
        temperature = temperature.slice(0, -2);
        temperature = Number(temperature);
        return temperature > 29 ? "sunny" : temperature >= 23 ? "cloudy" : temperature >= 18 ? "rainy" : "windy";
    }

    /**
    * To update current date time and state icon
    * @param {String} timezone
    */
    clock() {
        let period = dateTime(this.timeZone, 'period');
        document.querySelector(".date").innerHTML = (dateTime(this.timeZone, 'date'));
        document.querySelector(".time").innerHTML = (dateTime(this.timeZone, 'time'));
        document.querySelector(".sec").innerHTML = " : " + (dateTime(this.timeZone, 'seconds'));
        document.getElementById("period").src = "./assets/icons/general/" + period + "State.svg";
    }
}