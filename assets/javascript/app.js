// SETUP VARIABLES
// ==========================================================

var gameQueryURL = "http://www.nfl.com/liveupdate/scores/scores.json";
var idQueryURL = "http://www.nfl.com/liveupdate/scorestrip/ss.json";
var playerQueryURL = "http://api.suredbits.com/nfl/v0/players/";

var gamesId = [];
var gamesTime = [];

var playerName = "";
var palyerTeam = "";

var map;
var marker;

// FUNCTIONS
// ==========================================================

//Player Search API

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

    console.log(gamesTime);

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
      var div = $("<div>").append(date);
      if(awayTeamScore){
        div.append("<div>" + awayTeamScore + " " + awayTeam + "   AT   " + homeTeam + " " + homeTeamScore + "</div>");
      } else {
        div.append("<div>" + " " + awayTeam + "   AT   " + homeTeam + " " + "</div>");
      }
      div.append("<div>" + stadium + "</div><br>");
      $("#schedule").append(div);
      var newGame = gameData.push();
      newGame.set({
        date: date,
        homeTeam: homeTeam,
        awayTeam: awayTeam,
        homeTeamScore: homeTeamScore,
        awayTeamScore: awayTeamScore,
        stadium: stadium
      });
      searchAddress(stadium);
    }
  });

}
// --- NFL Schedule Search API


//Open Weather API

// --- Open Weather API


//Google Map API

function searchAddress(addressInput) {

  var geocoder = new google.maps.Geocoder();

  geocoder.geocode({address: addressInput}, function(results, status) {
    if (status == google.maps.GeocoderStatus.OK) {
      var myResult = results[0].geometry.location;
      console.log(myResult.lat());
      console.log(myResult.lng());
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

