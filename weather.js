const HISTORY_KEY = "weatherCitySearchHistory";
const HISTORY_BTN_BS_CLASSES = "btn btn-light border text-left px-3 py-2";
const HISTORY_DATA_CITY_ATTR = "data-city";
const API_KEY = "d77358b957f48bb5e0d0bc47f76aad4e";

let history = JSON.parse(localStorage.getItem(HISTORY_KEY));
if (!history) {
  history = [];
}

// init
$(init);

function init() {
  // render search history
  renderHistory();
  // register search form event handler
  $("#search-form").on("submit", handleSearch);
  // register history item event handler
  $("#search-history").on("click", handleHistoryItemClick);

  // render last searched city
  if (history.length > 0) {
    renderCityWeather(history[history.length - 1])
  }
}

function renderCityWeather(city) {
  // hide weather divs on html page
  $("#current-weather").attr("style", "display: none;")
  $("#current-uv-element").attr("style", "display: none;")
  $("#future-weather").attr("style", "display: none;")

  // get current weather
  let currentQueryURL = "https://api.openweathermap.org/data/2.5/weather?units=imperial&appid=" + API_KEY + "&q=" + city;
  $.ajax({
    url: currentQueryURL,
    method: "GET"
  }).then(function(response) {
    // start the UV index ajax call first (need lat and lon from weather call)
    let uvQueryURL = "https://api.openweathermap.org/data/2.5/uvi?appid=" + API_KEY + "&lat=" + response.coord.lat + "&lon=" + response.coord.lon;
    $.ajax({
      url: uvQueryURL,
      method: "GET"
    }).then(function(response) {
      let uvIndex = response.value;
      $("#current-uv").text(uvIndex)
      // set background color and text color based on uv index
      $("#current-uv").attr("style", getUVColorStyle(uvIndex))

      // show uv element
      $("#current-uv-element").attr("style", "display: block;")
    });

    // update current weather on page
    $("#current-city").text(response.name + " (" + moment().format("l") + ")")
    $("#current-icon").attr("src", getWeatherIconURL(response.weather[0].icon))
    $("#current-temp").text(response.main.temp.toFixed(1));
    $("#current-humidity").text(response.main.humidity);
    $("#current-wind").text(response.wind.speed);

    // show current weather div
    $("#current-weather").attr("style", "display: block;");
  });

  // get 5-day forecast weather
  let forecastQueryURL = "https://api.openweathermap.org/data/2.5/forecast?units=imperial&appid=" + API_KEY + "&q=" + city;
  $.ajax({
    url: forecastQueryURL,
    method: "GET"
  }).then(function(response) {
    let listIndex = findGoodStartIndex(response);
    let list = response.list;

    // update all 5 cards
    for (let i = 1; i <= 5; i++) {
      let dayCard = $("#forecast-day-" + i);

      // get the day but account for timezone offset
      dayCard.find("h5").text(moment(list[listIndex].dt * 1000).format("l"));
      dayCard.find("img").attr("src", getWeatherIconURL(list[listIndex].weather[0].icon));
      dayCard.find(".temp").text(list[listIndex].main.temp.toFixed(1));
      dayCard.find(".humidity").text(list[listIndex].main.humidity);

      // items in the response are 3-hours apart so +8 is 24 hours later
      listIndex += 8;
    }

    // show forecast weather on page
    $("#future-weather").attr("style", "display: block;")
  });
}

function handleSearch(event) {
  event.preventDefault();

  // get the input from search box
  let city = $("#search-input").val().trim();
  // clear out the search box
  $("#search-input").val("");
  // add the city to our search history
  addHistoryItem(city);
  // render the city's weather
  renderCityWeather(city);
}

function handleHistoryItemClick(event) {
  if (event.target.matches("button")) {
    renderCityWeather($(event.target).attr(HISTORY_DATA_CITY_ATTR));
  }
}

function renderHistory() {
  // empty out previous search history
  let searchHistory = $("#search-history").empty();

  // for each item in history array
  history.forEach(city => {
    // create a button and add classes/attributes
    let btn = $("<button>").addClass(HISTORY_BTN_BS_CLASSES);
    btn.attr(HISTORY_DATA_CITY_ATTR, city);
    btn.text(city);
    // append button to search history
    searchHistory.append(btn);
  });
}

function addHistoryItem(city) {
  // only add to history if city isn't already in history
  if (!history.includes(city)) {
    history.push(city);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    renderHistory();
  } 
}

// this function finds a good starting index in the list of 40 items (5-day 3-hour forecasts)
function findGoodStartIndex(response) {
  let list = response.list;
  let startIndex = 8;
  do {
    startIndex--;
    indexHour = parseInt(moment(list[startIndex].dt * 1000).format("H"));
  } while (indexHour >= 15 && startIndex > 0)

  return startIndex;
}

function getUVColorStyle(uvIndex) {
  if (uvIndex <= 2) {
    return "background-color: green; color: white;";
  } else if (uvIndex <= 5) {
    return "background-color: gold; color: black";
  } else if (uvIndex <= 7) {
    return "background-color: goldenrod; color: black;";
  } else if (uvIndex <= 10) {
    return "background-color: firebrick; color: white;";
  } else {
    return "background-color: violet; color: black;";
  }
}

function getWeatherIconURL(iconCode) {
  return "https://openweathermap.org/img/w/" + iconCode + ".png";
}
