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
        'VolumeUpIntent': function () {
            log.info('Intent: ' + this.event.request.intent.name);
            squeezeServer.getPlayerByName(this.attributes['currentPlayer']).then((player) => {
                player.volumeUp().then(() => {
                    this.emit(':tell', 'Sure.');
                });
            });
        },
        'VolumeDownIntent': function () {
            log.info('Intent: ' + this.event.request.intent.name);
            squeezeServer.getPlayerByName(this.attributes['currentPlayer']).then((player) => {
                player.volumeDown().then(() => {
                    this.emit(':tell', 'Sure.');
                });
            });
        },
        'VolumeUpRelativeIntent': function () {
            log.info('Intent: ' + this.event.request.intent.name);
            squeezeServer.getPlayerByName(this.attributes['currentPlayer']).then((player) => {
                player.volumeUpRelative(this.event.request.intent.slots.VolumeDelta.value).then(() => {
                    this.emit(':tell', 'Sure.');
                });
            });
        },
        'VolumeDownRelativeIntent': function () {
            log.info('Intent: ' + this.event.request.intent.name);
            squeezeServer.getPlayerByName(this.attributes['currentPlayer']).then((player) => {
                player.volumeDownRelative(this.event.request.intent.slots.VolumeDelta.value).then(() => {
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
                    this.emit(':tell', `Sure! Playing songs by ${this.event.request.intent.slots.Artist.value}`);
                });
            });
        },
        'PlayGenreIntent': function () {
            log.info('Intent: ' + this.event.request.intent.name);
            squeezeServer.getPlayerByName(this.attributes['currentPlayer']).then((player) => {
                player.playGenre(this.event.request.intent.slots.Genre.value).then(() => {
                    this.emit(':tell', `Sure! Playing some ${this.event.request.intent.slots.Genre.value} music.  Enjoy!`);
                });
            });
        },
        'PlaySongIntent': function () {
            log.info('Intent: ' + this.event.request.intent.name);
            squeezeServer.getPlayerByName(this.attributes['currentPlayer']).then((player) => {
                player.playSong(this.event.request.intent.slots.Song.value, this.event.request.intent.slots.Artist.value, this).then(() => {
                    this.emit(':tell', `Sure! Playing ${this.event.request.intent.slots.Song.value} by ${this.event.request.intent.slots.Artist.value}`);
                });
            });
        },
        'StopMusicIntent': function () {
            log.info('Intent: ' + this.event.request.intent.name);
            squeezeServer.getPlayerByName(this.attributes['currentPlayer']).then((player) => {
                player.stop().then(() => {
                    this.emit(':tell', 'Sure! Stopping playback.');
                });
            });
        },
        'PowerOffAllIntent': function () {
            log.info('Intent: ' + this.event.request.intent.name);
            squeezeServer.ready().then((players) => {
                var promises = [];
                for (player in players) {
                    promises.push(players[player].power(false));
                }

                Promise.all(promises).then(() => this.emit(':tell', 'Sure! Turning off all players.'));
            });
        }
    };

    alexa.appId = process.env.APP_ID;
    alexa.dynamoDBTableName = 'squeezebox';
    alexa.registerHandlers(playerSuffixedHandlers, handlers);
    alexa.execute();
};

