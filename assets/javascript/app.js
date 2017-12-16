// SETUP VARIABLES
// ==========================================================


var weatherAddress = "http://api.openweathermap.org/data/2.5/forecast?mode=json&";
var ticketQueryURL = "https://app.ticketmaster.com/discovery/v2/events.json?apikey=Woz0yAkff0NLy3N8cRrg7O7nd3x7qr8l&sort=date,asc"
var venueQueryURL = "https://app.ticketmaster.com/discovery/v2/venues.json?apikey=Woz0yAkff0NLy3N8cRrg7O7nd3x7qr8l&sort=distance,asc"

var scheduleQueryURL = "https://api.mysportsfeeds.com/v1.1/pull/nfl/2017-regular/full_game_schedule.json?date=since-yesterday"

var playerQueryURL04 = "http://api.fantasy.nfl.com/players/stats?statType=seasonStats&season=2017&format=json"
var playerQueryURL = "http://api.fantasy.nfl.com/v1/players/researchinfo?count=9999&format=json"

var gameMoment;
var gameLocation;

var playerName = "";
var playerTeam = "OAK";

var home;

var map;
var marker;

// FUNCTIONS
// ==========================================================

//Google Map API

function searchAddress(addressInput) {

  var geocoder = new google.maps.Geocoder();

  geocoder.geocode({address: addressInput}, function(results, status) {
    if (status == google.maps.GeocoderStatus.OK) {
      var myResult = results[0].geometry.location;
      console.log(myResult.lat());
      console.log(myResult.lng());
      searchWeather(myResult.lat(), myResult.lng());
      var latlng = (myResult.lat()+","+myResult.lng());
      venueSearch(latlng);
      createMarker(myResult);
      map = new google.maps.Map(document.getElementById('map'), {
        zoom: 15,
        center: myResult
      });
    }
  });
}

function createMarker(latlng) {

  //console.log(latlng);

  if(marker != undefined && marker != ''){
    marker.setMap(null);
    marker = '';
  }
  marker = new google.maps.Marker({
    map: map,
    position: latlng
  });
}

function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 30.287033, lng: -97.729152},
    zoom: 13,
    mapTypeId: 'roadmap'
  });
}
// --- Google Map API

//Player Search API
function playerSearch(name) {
  var nameArray = name.split(" ");
  var queryURL = playerQueryURL + nameArray[1] + "/" + nameArray[0];

  $.ajax({
    url: queryURL,
    method: "GET",
  }).done(function(response) {
    console.log(response);
    playerName = response[0].fullName;
    console.log(playerName);
    playerTeam = response[0].team;
  });

}

// Team schedule search
function gameScheduleQuery(team) {
  var queryURL = scheduleQueryURL + "&team=" + team;

  $.ajax({
    type: "GET",
    url: queryURL,
    dataType: 'json',
    async: false,
    headers: {
    "Authorization": "Basic " + btoa("chen" + ":" + "testing")
    }
  }).done(function(response) {

    console.log(queryURL);

    var game = response.fullgameschedule.gameentry[0];

    var awayTeam = game.awayTeam.City + " " + game.awayTeam.Name;
    var homeTeam = game.homeTeam.City + " " + game.homeTeam.Name;
    var stadium = game.location;

    home = homeTeam;

    var gameTime = game.date + " " + game.time;

    var date = moment(gameTime, "YYYY-MM-DD hh:mm A").format("YYYY-MM-DD HH:mm");

    $("#schedule").html("<h4>Next Game: </h4>");


    var div = $("<div>").append(date);
 
    div.append("<div>" + awayTeam + "&nbsp&nbsp@&nbsp&nbsp" + homeTeam + "</div>");
    
    div.append("<div>" + stadium + "</div><br>");
    $("#schedule").append(div);
    gameMoment = date;
    gameLocation = stadium;
    searchAddress(stadium);
      
  });

}
//

//Open Weather API
function searchWeather(lat, lon){
  var apiKey = "&APPID=493a894db54ba08c27fb676a7311eb9e";
  var queryURL = weatherAddress + apiKey + "&lat=" + lat + "&lon=" + lon + "&units=imperial";
   $.ajax({
    url: queryURL,
    method: "GET"
  }).done(function(response) {
    var index = 0;
    for (var i = 0; i < response.list.length - 1; i++) {
      if(response.list[i].dt_txt < gameMoment && response.list[i+1].dt_txt > gameMoment) {
        index = i;
        break;
      }
    }
    var weather = response.list[index];
    var icon = $("<img>").attr("src", "http://openweathermap.org/img/w/" + weather.weather[0].icon + ".png");
    var city = $("<strong>").text(response.city.name);
    city.append(icon);
    var div = $("<div>").text();
    //div.append(icon);
    $("#weather").html("<h4>GameDay Weather: </h4>");
    $("#weather").append(city);
    $("#weather").append("<div>Feels like&nbsp&nbsp&nbsp&nbsp" + Math.round(weather.main.temp) + "°F </div>");
    $("#weather").append("<div>Wind&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp" + weather.wind.speed + "&nbspmph</div>");
    $("#weather").append("<div>Humidity&nbsp&nbsp&nbsp" + weather.main.humidity + "%</div><br>");

    console.log(weather.weather[0].description);
  })
}
// --- Open Weather API

// ticketMaster
function searchTicket() {
  var time = moment(gameMoment, "YYYY-MM-DD HH:mm").format("YYYY-MM-DDTHH:mm:ss[Z]");
  console.log(time);
  var queryURL = ticketQueryURL + "&startDateTime=" + time + "&keyword=" + home;
  console.log(queryURL);
  $.ajax({
    url: queryURL,
    method: "GET"
  }).done(function(response) {
    console.log(response._embedded.events[0].name);
    //console.log(response._embedded.events[0].url);
    //console.log(response._embedded.events[0].priceRanges[0].min);
    //console.log(response._embedded.events[0].priceRanges[0].max);
    var event = response._embedded.events[0];
    $("#ticket").html("<h4>TicketMaster: </h4>");
    var link = $("<a>").attr("href", event.url).attr("target", "_blank").text("Buy Tickets");
    $("#ticket").append(link);

    var price = $("<div>").text("Price Ranges: " + event.priceRanges[0].min + " USD to " + event.priceRanges[0].max + " USD");
    $("#ticket").append(price);

  });
}
function venueSearch(latlong) {
  var queryURL = venueQueryURL + "&latlong=" + latlong + "&keyword=" + gameLocation;
  //console.log(queryURL);
  $.ajax({
    url: queryURL,
    method: "GET"
  }).done(function(response) {
    //console.log(response);
    var venueId = response._embedded.venues[0].id;
    searchTicket();
  })

}
// --- ticketMaster

//arrestRecord
function arrestRecord() {

  var queryURL = "http://nflarrest.com/api/v1/player/arrests/Marshawn+Lynch";
   //var queryURL = "http://nflarrest.com/api/v1/player/arrests/" + firstName "%20"+ lastName;
  $.ajax({
    url: queryURL,
    method: "GET"
  }).done(function(response) {
    console.log(response);
    var results = response;
    for (var i = 0; i < results.length; i++) {
        //var crimeDiv = $("<div>");
        //crimeDiv.addClass("crime");
        var p1 = $("<h4>").text("CRIME: " + results[i].Crime_category);
        var p2 = $("<h5>").text("YEAR: " + results[i].Year);
        var p = $("<p>").text("ARREST DESCRIPTION: " + results[i].Description);
        // var p3 = $("<p>").text("Outcome: " + results[i].Outcome);
        // $(".container").prepend(p3);
        $("#arrestRecord").prepend(p);
        $("#arrestRecord").prepend(p2);
        $("#arrestRecord").prepend(p1);
    }
  });
}
// arrestRecord

//function to search player name
function runPlayerQuery(queryURL) {
  $.ajax({
    url: queryURL,
    method: "GET"
  }).done(function(response) {

    playerSearch = "Tom"

    var playerPath = response.players

    for (var i = 0; i < playerPath.length; i++) {
      
      if (playerPath[i].firstName == playerSearch) {
        console.log(playerPath[i])
        var teamAbbr = playerPath[i].teamAbbr;
        var playerID = playerPath[i].id;
        console.log(teamAbbr);
        console.log(playerID);
      } else {
        console.log("nothing found");
      } 
    }

    var newsQueryURL = "http://api.fantasy.nfl.com/v1/players/details?playerId=" + playerID + "&statType=seasonStatsformat=json"
    runNewsQuery(newsQueryURL);
  })

}


//function to pull player news
function runNewsQuery(queryURL, id) {
  $.ajax({
    url: queryURL,
    method: "GET"
  }).done(function(response) {
    console.log(response);
    // for (var i = 0; i < playerNews.length; i++) {
    //   console.log("Player News " + playerNews[i].analysis);
    // }
  })

}



// Initialize Firebase
var config = {
  apiKey: "AIzaSyA_kJWy8ut3lcZVcJ-PfZIjm_S4OMj3qUQ",
  authDomain: "nfl-project-f85c0.firebaseapp.com",
  databaseURL: "https://nfl-project-f85c0.firebaseio.com",
  projectId: "nfl-project-f85c0",
  storageBucket: "",
  messagingSenderId: "634584486283"
};
firebase.initializeApp(config);

var gameData = firebase.database().ref("/games");

//Main program
$( document ).ready(function() {
  gameScheduleQuery(playerTeam);
});

