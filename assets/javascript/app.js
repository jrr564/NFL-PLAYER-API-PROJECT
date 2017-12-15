// SETUP VARIABLES
// ==========================================================

var gameQueryURL = "http://www.nfl.com/liveupdate/scores/scores.json";
var idQueryURL = "http://www.nfl.com/liveupdate/scorestrip/ss.json";
var playerQueryURL = "http://api.suredbits.com/nfl/v0/players/";
var weatherAddress = "http://api.openweathermap.org/data/2.5/forecast?mode=json&";
var ticketQueryURL = "https://app.ticketmaster.com/discovery/v2/events.json?keyword=NFL&apikey=Woz0yAkff0NLy3N8cRrg7O7nd3x7qr8l&sort=date,asc"
var venueQueryURL = "https://app.ticketmaster.com/discovery/v2/venues.json?apikey=Woz0yAkff0NLy3N8cRrg7O7nd3x7qr8l&sort=distance,asc"

var playerQueryURL04 = "http://api.fantasy.nfl.com/players/stats?statType=seasonStats&season=2017&format=json"
var playerQueryURL = "http://api.fantasy.nfl.com/v1/players/researchinfo?count=9999&format=json"


var gamesId = [];
var gamesTime = [];

var gameMoment;
var gameLocation;

var playerName = "";
var playerTeam = "DET";

var map;
var marker;

// FUNCTIONS
// ==========================================================

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
// --- Player Search API

//NFL Schedule Search API
function runIdQuery(queryURL) {

  $.ajax({
    url: queryURL,
    method: "GET"
  }).done(function(response) {

    //console.log("URL: " + queryURL);
    //console.log(response.gms);

    for (var i = 0; i < response.gms.length; i++) {
      gamesId.push(response.gms[i].eid);
      gamesTime.push(response.gms[i].t + response.gms[i].q)
    }

    });

  runGameQuery(gameQueryURL);
}

function runGameQuery(queryURL) {

  $.ajax({
    url: queryURL,
    method: "GET"
  }).done(function(response) {

    //console.log("URL: " + queryURL);
    gameData.remove();

    for (var i = 0; i < gamesId.length; i++) {
      var game = response[gamesId[i]];
      var awayTeamScore = game.away.score.T;
      var homeTeamScore = game.home.score.T;
      var awayTeam = game.away.abbr;
      var homeTeam = game.home.abbr;
      var stadium = game.stadium;

      var date = moment((Math.round(gamesId[i]/100) + gamesTime[i]), "YYYYMMDD hh:mm A").format("YYYY-MM-DD HH:mm")
      
      var newGame = gameData.push();
      newGame.set({
        date: date,
        homeTeam: homeTeam,
        awayTeam: awayTeam,
        homeTeamScore: homeTeamScore,
        awayTeamScore: awayTeamScore,
        stadium: stadium
      });

      if(awayTeam === playerTeam || homeTeam === playerTeam) {
        var div = $("<div>").append(date);
        if(awayTeamScore){
          div.append("<div>" + awayTeamScore + " " + awayTeam + "   AT   " + homeTeam + " " + homeTeamScore + "</div>");
        } else {
          div.append("<div>" + " " + awayTeam + "   AT   " + homeTeam + " " + "</div>");
        }
        div.append("<div>" + stadium + "</div><br>");
        $("#schedule").append(div);
        gameMoment = date;
        gameLocation = stadium;
        searchAddress(stadium);
      }
    }
  });

}
// --- NFL Schedule Search API


//Open Weather API
function searchWeather(lat, lon){
  var apiKey = "&APPID=493a894db54ba08c27fb676a7311eb9e";
  var queryURL = weatherAddress + apiKey + "&lat=" + lat + "&lon=" + lon;
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
    var div = $("<div>").text( Math.round(((weather.main.temp - 273.15) * 1.8 + 32)) + "°F");
    div.append(icon);
    $("#weather").text("GameDay Weather: ").append("<div>" + response.city.name + "</div>").append(div);

    console.log(weather.weather[0].description);
  })
}
// --- Open Weather API

// ticketMaster
function searchTicket(venueId) {
  var time = moment(gameMoment, "YYYY-MM-DD HH:mm").format("YYYY-MM-DDTHH:mm:ss[Z]");
  console.log(time);
  var queryURL = ticketQueryURL + "&venueId=" + venueId + "&startDateTime=" + time;
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
    $("#ticket").html("<p>TicketMaster: </p>");
    var link = $("<a>").attr("href", event.url).attr("target", "_blank").text("Price Ranges: " + event.priceRanges[0].min + " USD to " + event.priceRanges[0].max + " USD");
    $("#ticket").append(link);
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
    searchTicket(venueId);
  })

}
// --- ticketMaster

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
      map.setCenter(myResult);
      map.setZoom(17);
    }
  });
}

function createMarker(latlng) {

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
runIdQuery(idQueryURL);
