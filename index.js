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
