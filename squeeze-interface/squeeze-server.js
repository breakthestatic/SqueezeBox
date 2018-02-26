var jayson = require('jayson/promise');
var Fuse = require('fuse.js');
var SqueezePlayer = require('./squeeze-player');
var log = require('../log');
var moment = require('moment');

function SqueezeServer (host, port, secret) {
    this.host = host;
    this.port = port;
    this.address = this.host + ':' + this.port + '/jsonrpc.js';
    this.secret = secret;

    var players = null;
    var client = jayson.client.http(this.address);
    client.options.version = 1;

    this.ready = function () {
        var self = this;

        return new Promise(function (resolve, reject) {
            getPlayers.call(self).then(function (players) {
                resolve(players);
            });
        });
    };

    this.getArtists = function (start, count, list) {
        var deferred = Promise.defer();

        start = start || 0;
        count = count || 100;
        list = list || [];
        
        this.request(null, ['artists', start, count]).then((reply) => {
            var artists = reply.result.artists_loop;
            for (var i = 0; i < artists.length; i++) {
                list.push(artists[i]);
            }

            if (reply.result.count > list.length) {
                this.getArtists(start + count, count, list).then(() => {
                    deferred.resolve(list);
                });
            } else {
                deferred.resolve(list);
            }
        });
        
        return deferred.promise;
    }

    this.searchArtists = function (query, context) {
        return new Promise((resolve, reject) => {
            if (context && context.attributes['artists'] && (moment().diff(moment(context.attributes['lastArtistListSync'], 'x'), 'days')) < 2) {
                log.info('Loading artist list from cache');
                var artists = this.search(query, ['artist'], context.attributes['artists']);
                resolve(artists[0]);
            } else {
                this.getArtists().then((list) => {
                    if (context) {
                        log.info('Caching artist list');
                        context.attributes['artists'] = list;
                        context.attributes['lastArtistListSync'] = moment().format('x');
                    }

                    var artists = this.search(query, ['artist'], list);
                    resolve(artists[0]);
                });
            }
        });
    };

    this.searchTitles = function (query, tags, start, count, list) {
		var deferred = Promise.defer();

        start = start || 0;
        count = count || 100;
        list = list || [];
        
        this.request(null, ['titles', start, count, 'search:' + query, tags || '']).then((reply) => {
            var titles = reply.result.titles_loop;
            for (var i = 0; i < titles.length; i++) {
                list.push(titles[i]);
            }

            if (reply.result.count > list.length) {
                this.searchTitles(query, tags, start + count, count, list).then(() => {
                    deferred.resolve(list);
                });
            } else {
                deferred.resolve(list);
            }
        });
        
        return deferred.promise;
    };

    this.search = function (query, fields, list) {
        var options = {
            shouldSort: true,
            threshold: 0.6,
            location: 0,
            distance: 100,
            maxPatternLength: 32,
            minMatchCharLength: 1,
            keys: fields
        };

        var fuse = new Fuse(list, options); // "list" is the item array
        var result = fuse.search(query);

        return result;
    };
    
    this.request = function (player, params) {
        var finalParams = [];
        finalParams.push(player);
        finalParams.push(params);
        finalParams.push(this.secret);
        return client.request('slim.request', finalParams, null);
    };

    this.getPlayers = function () {
        var self = this;

        return new Promise(function (resolve, reject) {
            if (players === null) {
                getPlayers.call(self).then(function (reply) {
                    resolve(players);
                });
            } else {
                resolve(players);
            }
        });
    };

    this.getPlayerByName = function (name) {
        var self = this;

        log.info('Searching for player: ' + name);
        return new Promise(function (resolve, reject) {
            if (players === null) {
                getPlayers.call(self).then(function (reply) {
                    resolve(getPlayerByName.call(self, name));
                });
            } else {
                resolve(getPlayerByName.call(self, name));
            }
        });
    };

    function getPlayers () {
        var self = this;

        log.info('Fetching players');
        return new Promise(function (resolve, reject) {
            self.request(null, ['players', 0, 100]).then(function (reply) {
                var playerList = reply.result.players_loop;
                players = [];
                for (var i = 0; i < playerList.length; i++) {
                    players.push(new SqueezePlayer(self, playerList[i]));
                }
                resolve(players);
            });
        });
    }

    function getPlayerByName (name) {
        var results = this.search(name, ['properties.name'], players);

        return results.length ? results[0] : null;
    }
}

module.exports = SqueezeServer;