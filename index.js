var Alexa = require('alexa-sdk');
var SqueezeServer = require('./squeeze-interface/squeeze-server');
var log = require('./log');

var squeezeServer = new SqueezeServer(process.env.HOST, process.env.PORT, process.env.SECRET);

exports.handler = function (event, context, callback){
    var alexa = Alexa.handler(event, context);

    var playerSuffixedHandlers = {
        'PlayArtistWithPlayerIntent': function () {
            log.info('Intent: ' + this.event.request.intent.name);
            this.attributes['currentPlayer'] = this.event.request.intent.slots.Player.value;
            this.emit('PlayArtistIntent');
        },
        'PowerOnIntent': function () {
            log.info('Intent: ' + this.event.request.intent.name);
            this.attributes['currentPlayer'] = this.event.request.intent.slots.Player.value;
            squeezeServer.getPlayerByName(this.attributes['currentPlayer']).then((player) => {
                player.power(true).then(() => {
                    this.emit(':tell', 'Turning on ' + this.attributes['currentPlayer'] + '.');
                });
            });
        },
        'PowerOffIntent': function () {
            log.info('Intent: ' + this.event.request.intent.name);
            this.attributes['currentPlayer'] = this.event.request.intent.slots.Player.value;
            squeezeServer.getPlayerByName(this.attributes['currentPlayer']).then((player) => {
                player.power(false).then(() => {
                    this.emit(':tell', 'Turning off ' + this.attributes['currentPlayer'] + '.');
                });
            });
        },
        'PlayMusicIntent': function () {
            this.attributes['currentPlayer'] = this.event.request.intent.slots.Player.value;
            squeezeServer.getPlayerByName(this.attributes['currentPlayer']).then((player) => {
                player.play().then(() => {
                    this.emit(':tell', 'Sure.');
                });
            });
        }
    };

    var handlers = {
         'SkipIntent': function () {
            log.info('Intent: ' + this.event.request.intent.name);
            squeezeServer.getPlayerByName(this.attributes['currentPlayer']).then((player) => {
                player.skip().then(() => {
                    this.emit(':tell', 'Sure.');
                });
            });
        },
        'VolumeIntent': function () {
            log.info('Intent: ' + this.event.request.intent.name);
            squeezeServer.getPlayerByName(this.attributes['currentPlayer']).then((player) => {
                player.volume(this.event.request.intent.slots.Volume.value).then(() => {
                    this.emit(':tell', 'Sure.');
                });
            });
        },
        'MuteIntent': function () {
            log.info('Intent: ' + this.event.request.intent.name);
            squeezeServer.getPlayerByName(this.attributes['currentPlayer']).then((player) => {
                player.mute().then(() => {
                    this.emit(':tell', 'Sure.');
                });
            });
        },
        'UnMuteIntent': function () {
            log.info('Intent: ' + this.event.request.intent.name);
            squeezeServer.getPlayerByName(this.attributes['currentPlayer']).then((player) => {
                player.unmute().then(() => {
                    this.emit(':tell', 'Sure.');
                });
            });
        },
        'PlayArtistIntent': function () {
            log.info('Intent: ' + this.event.request.intent.name);
            squeezeServer.getPlayerByName(this.attributes['currentPlayer']).then((player) => {
                player.playArtist(this.event.request.intent.slots.Artist.value, this).then(() => {
                    this.emit(':tell', 'Sure.');
                });
            });
        },
        'PlayGenreIntent': function () {
            log.info('Intent: ' + this.event.request.intent.name);
            squeezeServer.getPlayerByName(this.attributes['currentPlayer']).then((player) => {
                player.playGenre(this.event.request.intent.slots.Genre.value).then(() => {
                    this.emit(':tell', 'Sure.');
                });
            });
        },
        'StopMusicIntent': function () {
            log.info('Intent: ' + this.event.request.intent.name);
            squeezeServer.getPlayerByName(this.attributes['currentPlayer']).then((player) => {
                player.stop().then(() => {
                    this.emit(':tell', 'Sure.');
                });
            });
        },
        'PowerOffAllIntent': function () {
            log.info('Intent: ' + this.event.request.intent.name);
            squeezeServer.ready.then((players) => {
                for (player in players) {
                    players[player].power(false).then(() => {
                        this.emit(':tell', 'Sure.');
                    });
                }
            });
        }
    };

    alexa.appId = process.env.APP_ID;
    alexa.dynamoDBTableName = 'squeezebox';
    alexa.registerHandlers(playerSuffixedHandlers, handlers);
    alexa.execute();
};

