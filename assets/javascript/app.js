// SETUP VARIABLES
// ==========================================================

var weatherAddress = "https://cors-anywhere.herokuapp.com/http://api.openweathermap.org/data/2.5/forecast?mode=json&";
var ticketQueryURL = "https://app.ticketmaster.com/discovery/v2/events.json?apikey=Woz0yAkff0NLy3N8cRrg7O7nd3x7qr8l&sort=date,asc"
var venueQueryURL = "https://app.ticketmaster.com/discovery/v2/venues.json?apikey=Woz0yAkff0NLy3N8cRrg7O7nd3x7qr8l&sort=distance,asc"
var scheduleQueryURL = "https://api.mysportsfeeds.com/v1.1/pull/nfl/2017-regular/full_game_schedule.json?date=since-yesterday"



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


    
    // playerseachMSF();
    playerSearch();
  })
})






function playerSearch() {
  queryURL = "https://api.fantasydata.net/v3/nfl/stats/JSON/Players";
  var searchPlayerFN = $("#searchFN").val().trim(); 
  var searchPlayerLN = $("#searchLN").val().trim();


  // Capitalize First Letter and Lower Case rest  
  searchPlayerFN = searchPlayerFN.toLowerCase().replace(/\b[a-z]/g, function(letter) {
    return letter.toUpperCase();
  });
  searchPlayerLN = searchPlayerLN.toLowerCase().replace(/\b[a-z]/g, function(letter) {
    return letter.toUpperCase();
  });


  $.ajax({
      url: queryURL,
      headers: {"Ocp-Apim-Subscription-Key": "1003f45d5a54415ca0fe1f426cb20e47"},
      type: "GET",
      data: "json",
  }).done(function(data) {
    console.log(data);

    if (searchPlayerLN == 0) {
      $("#tableSearchList")
      .append($("<tr>")
        .append( $("<td>").text("Enter Player Last Name"))
      )
    }


    if (searchPlayerFN == 0) {
      for (var i = 0; i < data.length; i++) {
        if (data[i].LastName === searchPlayerLN) {
            var playerResults_ID = data[i].PlayerID;
            var playerResults_FN = data[i].FirstName;
            var playerResults_LN = data[i].LastName;
            var playerResults_Position = data[i].Position;
            
            if (data[i].Team !== null) {
              var playerResults_Team = data[i].Team;
            }else {
              var playerResults_Team = "Free Agent";
            }

            addPlayersToTable();
        } //IF
      } //FOR
    } //FOR
    else {
      for (var i = 0; i < data.length; i++) {
        if (data[i].FirstName == searchPlayerFN && data[i].LastName == searchPlayerLN) {
            var playerResults_ID = data[i].PlayerID;
            var playerResults_FN = data[i].FirstName;
            var playerResults_LN = data[i].LastName;
            var playerResults_Position = data[i].Position;   

            if (data[i].Team !== null) {
              var playerResults_Team = data[i].Team;
            }else {
              var playerResults_Team = "Free Agent";
            }

            addPlayersToTable();                   
        } //IF
      } //FOR
    } //ELSE


      //adds players that match searched name to table
    function addPlayersToTable() { 
      $("#tableSearchList")
      .append($("<tr>")
          .attr("id", playerResults_ID)
          .attr("data-FN", playerResults_FN)
          .attr("data-LN", playerResults_LN)
          .attr("data-Team", playerResults_Team)
          .attr("data-Position", playerResults_Position)
          .attr("class", "players")
          .append( $("<td>").text(playerResults_FN + " " + playerResults_LN))
          .append( $("<td>").text(playerResults_Team))
          .append( $("<td>").text(playerResults_Position))
      ) //<tr> append
    }

        // on click for when a player is selected
    $(".players").on("click", function() {
      $("#resultsBox").show();
      $("#searchPanel").hide(1000);
      $("#arrestRecord").empty();
      $(".video").empty();
      $("#playerStats").empty();

      var playerID = $(this).attr("id");
      var playerFN = $(this).attr("data-FN");
      var playerLN = $(this).attr("data-LN");
      var playerTeam = $(this).attr("data-Team");
      var playerPosition = $(this).attr("data-Position");

      playerIndex(playerID);
      arrestRecord(playerFN, playerLN);


      updateDataBase(playerFN, playerLN, playerTeam, playerPosition, playerID);
      
    })

    $(".recentPlayers").on("click", function() {
      $("#resultsBox").show();
      $("#searchPanel").hide(1000);
      $("#arrestRecord").empty();
       $(".video").empty();
       $("#playerStats").empty();

      var playerID = $(this).attr("id");
      var playerFN = $(this).attr("data-FN");
      var playerLN = $(this).attr("data-LN");
      var playerTeam = $(this).attr("data-Team");
      var playerPosition = $(this).attr("data-Position");

      playerIndex(playerID);
      arrestRecord(playerFN, playerLN);

      //updateDataBase is not included since player already is in database
    })
  });

} //FUNCTION

function playerIndex(id) {
  queryURL = "https://api.fantasydata.net/v3/nfl/stats/JSON/Player/" + id;

  $.ajax({
    url: queryURL,
    headers: {"Ocp-Apim-Subscription-Key": "1003f45d5a54415ca0fe1f426cb20e47"},
    type: "GET",
    data: "json",
  }).done(function(data) {
    console.log(data);

    var ftsy = data.PlayerSeason;

    var player_ID = data.PlayerID;
    var player_FN = data.FirstName;
    var player_LN = data.LastName;
    var player_ID = data.PlayerID;
    var player_Num = data.Number
    var player_Position = data.Position;
    var player_Height = data.Height;
    var player_Weight = data.Weight;
    var player_Age = data.Age;
    var player_IMG = data.PhotoUrl;
    var player_TeamAbbr = data.CurrentTeam;
    var player_College = data.College;
    var player_Season = data.ExperienceString;
    var player_FantasyPoints = ftsy.FantasyPoints;
    var player_Receiving = ftsy.ReceivingYards;
    var player_Rushing = ftsy.RushingYards;
    var player_Passing = ftsy.PassingYards;
    var player_Touchdowns = ftsy.Touchdowns;
    var player_PassingTDs = ftsy.PassingTouchdowns;
    var player_PassingPercentage = ftsy.PassingCompletionPercentage;
    var player_Interceptions = ftsy.PassingInterceptions;
    var player_QBrating = ftsy.PassingRating;

    var player_RushingAttempts = ftsy.RushingAttempts;

    var player_ReceptionPercentage = ftsy.ReceptionPercentage;
    var player_Receptions = ftsy.Receptions;

    var player_DefInterceptions = ftsy.Interceptions;

    var player_Tackles = ftsy.Tackles;
    var player_TacklesForLoss = ftsy.TackesForLoss;
    var player_Sacks = ftsy.Sacks;

    var player_ExtraPoints = ftsy.ExtraPointsMade;
    var player_FieldGoal = ftsy.FieldGoalsMade;

    var player_GameCount = ftsy.Played;


    if (player_IMG === null) {
      $("#headshot").attr("src", "assets/images/placeholder.png");
    }else {
      $("#headshot").attr("src", player_IMG);
    }


    $("#playerName").text(player_FN + " " + player_LN);
    $("#playerTeam").text("Team: " + player_TeamAbbr);
    $("#playerPosition").text("Position: " + player_Position);
    $("#playerNum").text("#" + player_Num);
    $("#playerHeight").text("Height " + player_Height);
    $("#playerWeight").text("Weight " + player_Weight);
    $("#playerAge").text(player_Age + " Years Old");

    $("#playerStats").append("<div>Total Fantasy Points: " + player_FantasyPoints + "</div>");
    

    if (player_Position === "QB") {
      $("#playerStats").append("<div>Passing Completion Percentage: " + player_PassingPercentage + "%</div>")
      $("#playerStats").append("<div>Passing Touchdowns: " + player_PassingTDs + "</div>");
      $("#playerStats").append("<div>Passing Yards: " + player_Passing + "</div>");
      $("#playerStats").append("<div>Interceptions: " + player_Interceptions + "</div>");
      $("#playerStats").append("<div>QB Rating: " + player_QBrating + "</div>");
    }else if (player_Position === "RB" || player_Position === "FB") {
      $("#playerStats").append("<div>Total Touchdown: " + player_Touchdowns + "</div>");
      $("#playerStats").append("<div>Total Rushing Attempts: " + player_RushingAttempts + "</div>");
      $("#playerStats").append("<div>Total Rushing Yards: " + player_Rushing + "</div>");
      $("#playerStats").append("<div>Total Receiving Yards: " + player_Receiving + "</div>");
    }else if (player_Position === "WR" || player_Position === "TE") {
      $("#playerStats").append("<div>Total Touchdown: " + player_Touchdowns + "</div>");
      $("#playerStats").append("<div>Total Rushing Yards: " + player_Rushing + "</div>");
      $("#playerStats").append("<div>Total Receiving Yards: " + player_Receiving + "</div>");
      $("#playerStats").append("<div>Receptions: " + player_Receptions + "</div>");
      $("#playerStats").append("<div>Reception Percentage: " + player_ReceptionPercentage + "%</div>");
    }else if (player_Position === "OLB" || player_Position ===  "ILB" || player_Position === "LB" || player_Position === "DE" || player_Position === "DT" || player_Position === "NT" || player_Position === "SS" || player_Position === "FS" || player_Position === "CB" || player_Position === "DST") {
      $("#playerStats").append("<div>Interceptions: " + player_DefInterceptions + "</div>");
      $("#playerStats").append("<div>Total Tackles: " + player_Tackles + "</div>");
      $("#playerStats").append("<div>Total Sacks: " + player_Sacks + "</div>");
    }else if (player_Position === "K") {
      $("#playerStats").append("<div>Extra Points Made: " + player_ExtraPoints + "</div>");
      $("#playerStats").append("<div>Field Goals Made: " + player_FieldGoal + "</div>");
   }else if (player_Position === "G" || player_Position === "OT") {
      $("#playerStats").append("<div>Number of Games Played: " + player_GameCount + "</div>");
   }

    runPlayerNews(player_ID);
    searchAddress(player_TeamAbbr);
    gameScheduleQuery(player_TeamAbbr);

  }) //DONE

} //FUNCTION

function runPlayerNews(id) {
  queryURL = "https://api.fantasydata.net/v3/nfl/stats/JSON/NewsByPlayerID/" + id;

  $.ajax({
    url: queryURL,
    headers: {"Ocp-Apim-Subscription-Key": "1003f45d5a54415ca0fe1f426cb20e47"},
    type: "GET",
    data: "json",
  }).done(function(data) {
    console.log(data);

    for (var i = 0; i < 10; i++) {
      var newsTitle = data[i].Title;
      var newsURL = data[i].Url;
      var newsTime = data[i].TimeAgo;

      $("#playerNewsContainer").append("<a id='title' target='_blank' href=" + "'" + newsURL + "'" + ">" + newsTitle + "</a>");
      $("#playerNewsContainer").append("<div>" + newsTime  + "</div>");
      $("#playerNewsContainer").append("<br>");
    } //FOR


  }) //DONE
} //FUNCTION



//Player Seach API
// function playerseachMSF() {
//   var searchPlayerFN = $("#searchFN").val().trim(); 
//   var searchPlayerLN = $("#searchLN").val().trim();
//   var searchedPlayer = "";

//   //allows user to only search for last name and have fist name be optional
//   if (searchPlayerFN == 0) {
//     var searchedPlayer = searchPlayerLN;
//   } else {
//     var searchedPlayer = searchPlayerFN + "-" + searchPlayerLN;
//   }

//   var playerQueryURL = "https://api.mysportsfeeds.com/v1.1/pull/nfl/2017-regular/active_players.json?" + "player=" + searchedPlayer;
//   var playerQueryURL02 = "https://api.mysportsfeeds.com/v1.1/pull/nfl/2017-regular/cumulative_player_stats.JSON";
//   var playerQueryURL03 = "https://api.fantasydata.net/v3/nfl/stats/JSON/NewsByPlayerID/{playerid}"

//   $.ajax({
//     type: "GET",
//     url: playerQueryURL,
//     dataType: 'json',
//     async: true,
//     headers: {
//     "Authorization": "Basic " + btoa("chen" + ":" + "testing")
//   },
//   }).done(function(response) {
//     console.log("PlayerSearch MSF - " + playerQueryURL);

//   }) //done 
// }






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

    $("#schedule").html("<h4>Next Game </h4>");


    var div = $("<div>").append(date);
 
    div.append("<div>" + awayTeam + "&nbsp@&nbsp" + homeTeam + "</div>");
    
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
    var icon = $("<img>").attr("src", "http://openweathermap.org/img/w/" + weather.weather[0].icon + ".png");
    var city = $("<strong>").text(response.city.name);
    city.append(icon);
    var div = $("<div>").text();
    //div.append(icon);
    $("#weather").html("<h4>Gameday Weather</h4>");
    $("#weather").append(city);
    $("#weather").append("<div>Temperature: " + Math.round(weather.main.temp) + "°F </div>");
    $("#weather").append("<div>Wind Speed: " + weather.wind.speed + "&nbspmph</div>");
    $("#weather").append("<div>Humidity: " + weather.main.humidity + "%</div><br>");

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

    var price = $("<div>").text("Price Range: $" + event.priceRanges[0].min + " to $" + event.priceRanges[0].max);
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

  var queryURL = "https://cors-anywhere.herokuapp.com/http://nflarrest.com/api/v1/player/arrests/" + firstName +"%20"+ lastName;   //var queryURL = "http://nflarrest.com/api/v1/player/arrests/" + firstName "%20"+ lastName;
  $.ajax({
    url: queryURL,
    method: "GET"
  }).done(function(response) {
    console.log("Arrest - " + queryURL);
    var results = response;
    for (var i = 0; i < results.length; i++) {
        //var crimeDiv = $("<div>");
        //crimeDiv.addClass("crime");
        var p1 = $("<h4>").text("Violation: " + results[i].Crime_category);
        var p2 = $("<h5>").text("Year: " + results[i].Year);
        var p = $("<p>").text("Arrest Description: " + results[i].Description);
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

var gameData = firebase.database();

function updateDataBase(firstName, lastName, team, position, playerID) {
  console.log(firstName);
  var newPlayer = {
    firstName: firstName,
    lastName: lastName,
    team: team,
    position: position,
    playerID: playerID
  }
  console.log(newPlayer);

  // if ( $("#tableBody.tr.td" == firstName + " " + lastName) ) {
  //   console.log("name already exists akdfj;k aldkj f")
  // }

  gameData.ref().push(newPlayer);
  

}

gameData.ref().on("child_added", function(childSnapshot, prevChildKey) {
  var firstName = childSnapshot.val().firstName;
  var lastName = childSnapshot.val().lastName;
  var team = childSnapshot.val().team;
  var position = childSnapshot.val().position;
  var playerID = childSnapshot.val().playerID;



  $("#tableBody")
    .append($("<tr>")
      .attr("id", playerID)
      .attr("data-FN", firstName)
      .attr("data-LN", lastName)
      .attr("data-Team", team)
      .attr("data-Position", position)
      .attr("class", "recentPlayers")
      .append( $("<td>").text(firstName + " " + lastName))
      .append( $("<td>").text(team))
      .append( $("<td>").text(position))
    );
});