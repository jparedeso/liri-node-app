require("dotenv").config();
var request = require("request");
var inquirer = require("inquirer");
var spotify = require('node-spotify-api');
var express = require("express");
var Twitter = require("twitter");
var keys = require("./keys.js");
var fs = require("fs");
var tweetArray = [];
var title = "";


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
                    twitterCall(user.query);
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
                    switch (user.split(",")[0]) {
                        case "my-tweets":
                            showTweets("breaking");
                            break;

                        case "spotify-this-song":
                            spotifyThis("track", user.split(",")[1]);
                            break;

                        case "movie-this":
                            movieCall(user.split(",")[1]);
                            break;
                    }
                });
                break;
        }
    });
};

function twitterCall(tweet) {
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
function movieCall(URL) {
    // addToLog();
    request(URL, function (error, response, body) {
        console.log("movie Call");
        if (!error && response.statusCode === 200) {

            console.log("*Title: " + JSON.parse(body).Title);
            console.log("*imdb Rating: " + JSON.parse(body).imdbRating);
            console.log("*Year Released: " + JSON.parse(body).Year);
            console.log("*Country Produced: " + JSON.parse(body).Country);
            console.log("*Language: " + JSON.parse(body).Language);
            console.log("*Actors: " + JSON.parse(body).Actors);
            console.log("*Plot: " + JSON.parse(body).Plot);
        } else {
            console.log(response.statusCode);
        }
    });
}

start();
// whatItSays("movie-this","matrix");