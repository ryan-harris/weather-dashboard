const HISTORY_KEY = "weatherCitySearchHistory";
const HISTORY_BTN_BS_CLASSES = "btn btn-light border text-left px-3 py-2";
const HISTORY_DATA_CITY_ATTR = "data-city";

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
  // console.log(`Render city ${city}`);
}

function handleSearch(event) {
  event.preventDefault();

  // get the input from search box
  let city = $("#search-input").val().trim();
  // clear out the search box
  $(this).find("input").val("");
  // add the city to our search history
  addHistoryItem(city);
  // render the city's weather
  renderCityWeather(city);
}

function handleHistoryItemClick(event) {
  console.log(event.target);
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
  // else {
  //   cityHistory.push(cityHistory.splice(cityHistory.indexOf(city), 1)[0]);
  // }
}

function convertKelvinToFarenheit(kelvin) {
  return ((kelvin - 273.15) * 9/5 + 32).toFixed(1);
}
