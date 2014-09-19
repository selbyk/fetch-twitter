
var http = require('http');
var fs = require('fs');

function PostTweet(tweet) {
  // Build the post string from an object
  var text = tweet.text.replace(/[^a-zA-Z ]/g, "");
  var influxPost = '[\
{\
"name" : "tweets",\
"columns" : ["time", "user_id", "user_name", "id", "text", "sentiment", "positivity", "negativity",\
"points" : [\
[' + tweet.timestamp_ms + ', '
   + tweet.user.id + ', '
   + '"' + tweet.user.screen_name + '", '
   + tweet.id + ', '
   + '"' + text + '", '
   + analyze(text).score + ', '
   + positivity(text).score + ', '
   + negativity(text).score + ']\
]\
}\
]';
  // An object of options to indicate where to post to
  var post_options = {
      host: 'localhost',
      port: '8086',
      path: "/db/bitcoin/series?u=root&p=root",
      method: 'POST',
      headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': influxPost.length
      }
  };
  // Set up the request
  var post_req = http.request(post_options, function(res) {
      res.setEncoding('utf8');
      res.on('data', function (chunk) {
          console.log('Response: ' + chunk);
      });
  });
  // post the data
  post_req.write(influxPost);
  post_req.end();
}

var util = require('util'),
    twitter = require('twitter');
var twit = new twitter({
    consumer_key: process.argv[2],
    consumer_secret: process.argv[3],
    access_token_key: process.argv[4],
    access_token_secret: process.argv[5]
});
var analyze = require('Sentimental').analyze,
    positivity = require('Sentimental').positivity,
    negativity = require('Sentimental').negativity;

twit.stream('statuses/filter', {track:'bitcoin,btc,bitcoin wallet,coinbase,Satoshi,51% Attack,btce,campbx,bitstamp'}, function(stream) {
  stream.on('data', function(data) {
  	PostTweet(data);
  	var text = data.text.replace(/[^a-zA-Z ]/g, "");
    	var influxPost = '[\
{\
"name" : "tweets",\
"columns" : ["time", "user_id", "user_name", id", "text", "sentiment", "positivity", "negativity",\
"points" : [\
[' + data.timestamp_ms + ', '
   + data.user.id + ', '
   + '"' + data.user.screen_name + '", '
   + data.id + ', '
   + '"' + text + '", '
   + analyze(text).score + ', '
   + positivity(text).score + ', '
   + negativity(text).score + ']\
]\
}\
]';
        console.log(influxPost);
    });
});
