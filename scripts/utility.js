//fetch json data
export const getData = () => fetch('./data/data.json')
    .then(function (response) {
        return response.json();
    })

//convert temperature from celcius to fahrenheit
export function celciusToFahrenheit(temperature) {
    temperature = temperature.substring(0, temperature.length - 2);
    temperature = Number(temperature);
    let f = Math.round(temperature * 9 / 5 + 32) + " F";
    return f;
}

//current date
export function dateTime(timezone, option) {
    let options = {
        timeZone: `${timezone}`,
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
    };
    let date = new Date();
    date = date.toLocaleString('default', options);
    date = new Date(date);
    let hour = date.getHours();
    if (option === 'date') {
        const day = date.getDate();
        const month = date.toLocaleString('default', { month: 'short' });
        const year = date.getFullYear();
        return day + '-' + month + '-' + year;
    }
    else if (option === 'time' || option === 'hour' || option === "minutes") {
        let min = date.getMinutes();
        if (hour === 0)
            hour = 12;
        else if (hour > 12)
            hour = hour - 12;
        hour = hour < 10 ? '0' + hour : hour;
        min = min < 10 ? '0' + min : min;
        if (option == 'hour')
            return hour;
        if (option == 'minutes')
            return min;
        return hour + " : " + min;
    }
    else if (option === 'seconds') {
        let sec = date.getSeconds();
        sec = sec < 10 ? '0' + sec : sec;
        return sec;
    }
    else if (option === 'period') {
        const period = (hour >= 12) ? 'pm' : 'am';
        return period;
    }
}