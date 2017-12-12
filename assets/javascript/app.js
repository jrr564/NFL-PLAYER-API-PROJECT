// SETUP VARIABLES
// ==========================================================

//var authKey = "b9f91d369ff59547cd47b931d8cbc56b:0:74623931";

var gameQueryURL = "http://www.nfl.com/liveupdate/scores/scores.json";
var idQueryURL = "http://www.nfl.com/liveupdate/scorestrip/ss.json";

var gamesId = [];

var gameCount = 0;

// FUNCTIONS
// ==========================================================

function runIdQuery(queryURL) {

  $.ajax({
    url: queryURL,
    method: "GET"
  }).done(function(response) {

    //console.log("URL: " + queryURL);
    //console.log(response.gms);

    for (var i = 0; i < response.gms.length; i++) {
      gamesId.push(response.gms[i].eid);
    }

    console.log(gamesId);

    });

  runGameQuery(gameQueryURL);

}

function runGameQuery(queryURL) {

  $.ajax({
    url: queryURL,
    method: "GET"
  }).done(function(response) {

    //console.log("URL: " + queryURL);

    for (var i = 0; i < gamesId.length; i++) {
      var game = $("<div>").append(Math.round(gamesId[i]/100));
      game.append("<div>" + response[gamesId[i]].away.score.T + " " + response[gamesId[i]].away.abbr + " at " + response[gamesId[i]].home.abbr + " " + response[gamesId[i]].home.score.T + "</div>");
      game.append("<div>" + response[gamesId[i]].stadium + "</div><br>");
      $("#schedule").append(game);
    }

    });
}

runIdQuery(idQueryURL);
