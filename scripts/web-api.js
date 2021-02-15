/**
 * To get all the city Details like cityName,dateAndTime,timeZone,temperature,humidity,precipitation
 */
export const getCityData = async () => {
    let cityData;
    var requestOptions = {
        method: 'GET',
        redirect: 'follow'
    };

    await fetch("https://soliton.glitch.me/all-timezone-cities", requestOptions)
        .then(response => response.text())
        .then((result) => cityData = result)
        .catch((error) => console.error(error));
    return cityData;
}

/**
 * To get date and time for given city
 */
export const getCityDateAndTime = async (cityName) => {
    let dateAndTime;
    var requestOptions = {
        method: 'GET',
        redirect: 'follow'
    };

    await fetch(`https://soliton.glitch.me?city=${cityName}`, requestOptions)
        .then(response => response.text())
        .then((result) => dateAndTime = result)
        .catch(error => console.log('error', error));
    return dateAndTime;
}

/**
 * To get weather for next N hours
 */
export const getWeather = async (cityDateTimeName, N) => {
    let weather;
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    var raw = JSON.stringify({ "city_Date_Time_Name": cityDateTimeName, "hours": N });

    var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow'
    };

    await fetch("https://soliton.glitch.me/hourly-forecast", requestOptions)
        .then(response => response.text())
        .then((result) => weather = result)
        .catch(error => console.log('error', error));
    return weather;
}