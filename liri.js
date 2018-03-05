require("dotenv").config();
var request = require("request");
var inquirer = require("inquirer");
var Spotify = require('node-spotify-api');
// var express = require("express");
var Twitter = require("twitter");
var keys = require("./keys.js");
var fs = require("fs");
var tweetArray = [];
var title = "";
var pick;

var start = function () {
    inquirer.prompt([
        {
            type   : "list",
            message: "Select one of the following options:",
            choices: ["my-tweets", "spotify-this-song", "movie-this", "do-what-it-says"],
            name   : "pick"
        }
    ]).then(function (user) {
        pick = user.pick;
        switch (pick) {
            case "my-tweets":
                console.log("test");
                inquirer.prompt([
                    {
                        type   : "input",
                        message: "What do you want to search for?",
                        name   : "query"
                    }
                ]).then(function (user) {
                    title = user.query;
                    twitterCall(user.query);
                });
                break;

            case "spotify-this-song":
                inquirer.prompt([
                    {
                        type   : "input",
                        message: "What song do you want to search for?",
                        name   : "query"
                    }
                ]).then(function (user) {
                    title = user.query;
                    spotifyCall(user.query);
                });
                break;

            case "movie-this":
                inquirer.prompt([
                    {
                        type   : "input",
                        message: "What movie do you want to search?",
                        name   : "query"
                    }
                ]).then(function (user) {
                    title = user.query;
                    if (!title) title = "Mr. Nobody";
                    var URL = "http://www.omdbapi.com/?apikey=74bccafa&t=" + title + "&y=&plot=short&r=json";
                    movieCall(URL);
                });
                break;

            case "do-what-it-says":
                fs.readFile("random.txt", "utf8", function (error, user) {
                    if (error) throw error;
                    spotifyCall(user.split(",")[1]);
                    // title = user.split(",")[1];
                    // if (!title) title = "Mr. Nobody";
                    // var URL = "http://www.omdbapi.com/?apikey=74bccafa&t=" + title + "&y=&plot=short&r=json";
                    // movieCall(URL);
                });
                break;
        }
    });
};
function twitterCall(tweet) {
    addToLog();
    var twitterClient = new Twitter(keys.twitter);
    twitterClient.get("statuses/user_timeline", {count: 20}, function (error, tweets, response) {
        if (error) {
            console.log("There was an error.");
        } else {
            for (var i = 0; i < tweets.length; i++) {
                var tweetObject = {};
                tweetObject.name = tweets[i].user.name;
                tweetObject.text = tweets[i].text;
                tweetObject.created = tweets[i].user.created_at;
                tweetArray.push(tweetObject);
            }
            console.log(tweetArray);
        }
    });
}
// function whatItSays(query, title) {
//     if (query === "movie-this") {
//         var URL = "http://www.omdbapi.com/?apikey=74bccafa&t=" + title;
//         movieCall(URL);
//         console.log(URL);
//         console.log(title);
//     } else if (query = "spotify-this-song") {
//         spotifyCall(title);
//     } else if (call = "my-tweets") {
//         twitterCall(tweet);
//     }
// }

function movieCall(URL) {
    addToLog();
    request(URL, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            console.log("Title: " + JSON.parse(body).Title);
            console.log("Year Released: " + JSON.parse(body).Year);
            console.log("imdb Rating: " + JSON.parse(body).imdbRating);
            console.log("Country Produced: " + JSON.parse(body).Country);
            console.log("Language: " + JSON.parse(body).Language);
            console.log("Plot: " + JSON.parse(body).Plot);
            console.log("Actors: " + JSON.parse(body).Actors);
        } else {
            console.log(response.statusCode);
        }
    });
}
function spotifyCall(title) {
    var spotify = new Spotify(keys.spotify);
    addToLog();
    spotify.search({
        type: 'track',
        query: title
    }, function(err, data) {
        if (err) throw err;
        console.log("Artist: " + data.tracks.items[0].artists[0].name);
        console.log("Song Name: " + data.tracks.items[0].name);
        console.log("Preview Link: " + data.tracks.items[0].album.artists[0].external_urls.spotify);
        console.log("Album: " + data.tracks.items[0].album.name);
    });
}
function addToLog() {
    fs.appendFile("log.txt", pick + ": " + title + "\n", function(err) {
        if (err) {
            console.log(err);
        } else {
            console.log("content added to log.txt");
        }
    });

}

start();