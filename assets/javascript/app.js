// SETUP VARIABLES
// ==========================================================

var weatherAddress = "https://cors-anywhere.herokuapp.com/http://api.openweathermap.org/data/2.5/forecast?mode=json&";
var ticketQueryURL = "https://app.ticketmaster.com/discovery/v2/events.json?apikey=Woz0yAkff0NLy3N8cRrg7O7nd3x7qr8l&sort=date,asc"
var venueQueryURL = "https://app.ticketmaster.com/discovery/v2/venues.json?apikey=Woz0yAkff0NLy3N8cRrg7O7nd3x7qr8l&sort=distance,asc"
var scheduleQueryURL = "https://api.mysportsfeeds.com/v1.1/pull/nfl/2017-regular/full_game_schedule.json?date=since-today"


// var playerQueryURL04 = "http://api.fantasy.nfl.com/players/stats?statType=seasonStats&season=2017&format=json"


var gameMoment;
var gameLocation;

var home;

var map;
var marker;

// FUNCTIONS
// ==========================================================






$(document).ready(function() {
  $("#searchPanel").hide();
  $("#resultsBox").hide();

  $("#submit-Button").on("click", function(event) {
    event.preventDefault();

    $("#resultsBox").hide();
    $("#searchPanel").show();

    //clears table with list of names from previous search
    $("#tableSearchList").empty();
    $("#playerNewsContainer").empty();
    $("#arrestRecord").empty()


    
    playerseachMSF();
    playerSearchESPN();
  })
})



// CORS API - does not currently work
function playerSearch() {
  var queryURL = "https://api.sportradar.us/nfl-ot2/players/0acdcd3b-5442-4311-a139-ae7c506faf88/profile.xml?api_key=y8k4vea62ypyg6us7vjp4nhm"

  $.ajax({
    url: queryURL,
    method: "GET"
  }).done(function(respone) {
    console.log(queryURL)
  })
}




function playerSearchESPN() {
  var queryURL = "https://cors-anywhere.herokuapp.com/http://api.fantasy.nfl.com/v1/players/researchinfo?count=9999&format=json";
  var searchPlayerFN = $("#searchFN").val().trim(); 
  var searchPlayerLN = $("#searchLN").val().trim();

  $.ajax({
    url: queryURL,
    method: "GET"
  }).done(function(respone) {

    console.log("PlayerSearch ESPN - " + queryURL);

///// IF searchPlayerFN is empty
    var players = respone.players;
    if (searchPlayerFN == 0) {
      for (var i = 0; i < players.length; i++) {
        if (players[i].lastName === searchPlayerLN) {
          var playerResults_LN = players[i].lastName;
          var playerResults_FN = players[i].firstName;
          var playerResults_ID = players[i].id;
          var playerResults_Abbr = players[i].teamAbr;
          var playerResults_Position = players[i].position;
          
          playerInfo(playerResults_FN, playerResults_LN);
        } 
      }
    } 
    else {// IF searchPlayerFN has content
      for (var i = 0; i < respone.players.length; i++) {
        if (respone.players[i].lastName === searchPlayerLN && respone.players[i].firstName === searchPlayerFN) {
          var playerResults_LN = respone.players[i].lastName;
          var playerResults_FN = respone.players[i].firstName;

          playerInfo(playerResults_FN, playerResults_LN);
        }
      }
    }

    function playerInfo(FN, LN) {
      
    }


  })
}





//Player Seach API
function playerseachMSF() {
  var searchPlayerFN = $("#searchFN").val().trim(); 
  var searchPlayerLN = $("#searchLN").val().trim();
  var searchedPlayer = "";

  //allows user to only search for last name and have fist name be optional
  if (searchPlayerFN == 0) {
    var searchedPlayer = searchPlayerLN;
  } else {
    var searchedPlayer = searchPlayerFN + "-" + searchPlayerLN;
  }

  var playerQueryURL = "https://api.mysportsfeeds.com/v1.1/pull/nfl/2017-regular/active_players.json?" + "player=" + searchedPlayer;
  

  $.ajax({
    type: "GET",
    url: playerQueryURL,
    dataType: 'json',
    async: true,
    headers: {
    "Authorization": "Basic " + btoa("chen" + ":" + "testing")
  },
  }).done(function(response) {
    console.log("PlayerSearch MSF - " + playerQueryURL);

    var playerResults = response.activeplayers.playerentry;

    for (var i = 0; i < playerResults.length; i++) {

      //removes any variables with undifined results
      if (playerResults[i].team !== undefined) {
        var playerResults_FN = playerResults[i].player.FirstName;
        var playerResults_LN = playerResults[i].player.LastName;
        var playerResults_Position = playerResults[i].player.Position;
        var playerResults_Team = playerResults[i].team.Name;
        var playerResults_City = playerResults[i].team.City;
        var playerResults_CityAbbr = playerResults[i].team.Abbreviation;
        var playerResults_IMG = playerResults[i].player.officialImageSrc;
      }
      if (playerResults[i].player.externalMapping !== null) {
        var playerResults_ID = playerResults[i].player.externalMapping.ID;
      }

      //adds players that match searched name to table
      $("#tableSearchList")
        .append($("<tr>")
          .attr("id", playerResults_ID)
          .attr("data-FN", playerResults_FN)
          .attr("data-LN", playerResults_LN)
          .attr("class", "players")
          .append( $("<td>").text(playerResults_FN + " " + playerResults_LN))
          .append( $("<td>").text(playerResults_Team))
          .append( $("<td>").text(playerResults_Position))
        ) //<tr> append
    } //for loop


    // on click for when a player is selected
    $(".players").on("click", function() {
      $("#resultsBox").show();
      $("#searchPanel").hide(1000);
      $("#arrestRecord").empty();

      var playerID = $(this).attr("id");
      var playerFN = $(this).attr("data-FN");
      var playerLN = $(this).attr("data-LN");

      arrestRecord(playerFN, playerLN);
      playerDisplay(playerID);
      displayPlayerStats(playerFN, playerLN);
      playerFantasyStats(playerFN, playerLN)
    })




  }) //done 
}

function playerFantasyStats(firstName, lastName) {
  var queryURL = "https://api.mysportsfeeds.com/v1.1/pull/nfl/2017-regular/cumulative_player_stats.json?" + "player=" + firstName + "-" + lastName;
  var queryURL02 = "https://api.mysportsfeeds.com/v1.0/pull/nfl/2017-regular/cumulative_player_stats.json?playerstats=Att,Comp,Yds,TD&" + "player=" + firstName + "-" + lastName;

    $.ajax({
    type: "GET",
    url: queryURL02,
    dataType: 'json',
    async: true,
    headers: {
    "Authorization": "Basic " + btoa("chen" + ":" + "testing")
  },
  }).done(function(response) {
    // console.log("Player Stats - " + queryURL02);

    // var playerJSON = JSON.stringify(response.cumulativeplayerstats.playerstatsentry[0].stats[0]);


    // console.log(response.cumulativeplayerstats.playerstatsentry[0].stats);


    // for (var i = 0; i < playerJSON.length; i++) {
      
    // }
  })
}



function displayPlayerStats(firstName, lastName) {
  var playerQueryURL = "https://api.mysportsfeeds.com/v1.1/pull/nfl/2017-regular/active_players.json?" + "player=" + firstName + "-" + lastName;
  

  $.ajax({
    type: "GET",
    url: playerQueryURL,
    dataType: 'json',
    async: true,
    headers: {
    "Authorization": "Basic " + btoa("chen" + ":" + "testing")
  },
  }).done(function(response) {
    console.log("Player Stats - " + playerQueryURL);

    var playerResults = response.activeplayers.playerentry[0];
    var player_Num = playerResults.player.JerseyNumber;
    var player_Position = playerResults.player.Position;
    var player_Height = playerResults.player.Height;
    var player_Weight = playerResults.player.Weight;
    var player_Age = playerResults.player.Age;
    var player_IMG = playerResults.player.officialImageSrc;
    var player_TeamCity = playerResults.team.City;
    var player_TeamName = playerResults.team.Name;

    $("#headshot").attr("src", player_IMG);
    $("#playerName").text(firstName + " " + lastName);
    $("#playerTeam").text(player_TeamCity + " " + player_TeamName);
    $("#playerPosition").text("Position " + player_Position);
    $("#playerNum").text("#" + player_Num);
    $("#playerHeight").text("Height " + player_Height);
    $("#playerWeight").text("Weight " + player_Weight + " lbs");
    $("#playerAge").text(player_Age + " Years Old");


  })

}

function playerDisplay(playerID) {
  var queryURL = "https://cors-anywhere.herokuapp.com/http://api.fantasy.nfl.com/v1/players/details?playerId=" + playerID + "&statType=seasonStatsformat=json";
  $.ajax({
    url: queryURL,
    method: "GET"
  }).done(function(response) {
    console.log("PlayerDisplay ESPN - " + queryURL);

    playerTeam = response.players[0].teamAbbr;
    gameScheduleQuery(playerTeam);

    

    for (var i = 0; i < response.players[0].notes.length; i++) {
      var playerNews = response.players[0].notes;
      var playerNewsBody = playerNews[i].body;
      var playerAnalysis = playerNews[i].analysis;
      



      $("#playerNewsContainer").append("<div class='headline'>" + playerNewsBody + "</div>");
      // $("#playerNewsContainer").append("<br>");
      $("#playerNewsContainer").append("<div class='news'>" + playerAnalysis + "</div>");
      $("#playerNewsContainer").append("<br>");
      // $("#playerNewsContainer").append("<div>" + "-------------------------------------------------" + "</div>");
      // $("#playerNewsContainer").append("<div>" + "-------------------------------------------------" + "</div>");
    }


  })
}


//Google Map API
function searchAddress(addressInput) {

  var geocoder = new google.maps.Geocoder();

  geocoder.geocode({address: addressInput}, function(results, status) {
    if (status == google.maps.GeocoderStatus.OK) {
      var myResult = results[0].geometry.location;
      // console.log(myResult.lat());
      // console.log(myResult.lng());
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

    console.log("GameSchedule - " + queryURL);

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
    console.log("Weather - " + queryURL);

    var index = 0;
    for (var i = 0; i < response.list.length - 1; i++) {
      if(response.list[i].dt_txt < gameMoment && response.list[i+1].dt_txt > gameMoment) {
        index = i;
        break;
      }
    }
    var weather = response.list[index];
    var icon = $("<img>").attr("src", "https://cors-anywhere.herokuapp.com/http://openweathermap.org/img/w/" + weather.weather[0].icon + ".png");
    var city = $("<strong>").text(response.city.name);
    city.append(icon);
    var div = $("<div>").text();
    //div.append(icon);
    $("#weather").html("<h4>GameDay Weather: </h4>");
    $("#weather").append(city);
    $("#weather").append("<div>Feels like&nbsp&nbsp&nbsp&nbsp" + Math.round(weather.main.temp) + "°F </div>");
    $("#weather").append("<div>Wind&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp" + weather.wind.speed + "&nbspmph</div>");
    $("#weather").append("<div>Humidity&nbsp&nbsp&nbsp" + weather.main.humidity + "%</div><br>");

    // console.log(weather.weather[0].description);
  })
}
// --- Open Weather API

// ticketMaster
function searchTicket() {
  var time = moment(gameMoment, "YYYY-MM-DD HH:mm").format("YYYY-MM-DDTHH:mm:ss[Z]");
  // console.log(time);
  var queryURL = ticketQueryURL + "&startDateTime=" + time + "&keyword=" + home;
  
  $.ajax({
    url: queryURL,
    method: "GET"
  }).done(function(response) {
    console.log("Ticket - " + queryURL);
    // console.log(response._embedded.events[0].name);
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
    console.log("Venue Search - " + queryURL);
    var venueId = response._embedded.venues[0].id;
    searchTicket();
  })

}
// --- ticketMaster


//arrestRecord
function arrestRecord(firstName, lastName) {


  var queryURL = "http://nflarrest.com/api/v1/player/arrests/" + firstName +"%20"+ lastName;

  $.ajax({
    url: queryURL,
    method: "GET"
  }).done(function(response) {
    console.log("Arrest - " + queryURL);
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
