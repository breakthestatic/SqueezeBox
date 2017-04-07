var jayson = require('jayson/promise');
var Fuse = require('fuse.js');
var SqueezePlayer = require('./squeeze-player');
var log = require('../log');

function SqueezeServer (host, port) {
    this.host = host;
    this.port = port;
    this.address = this.host + ':' + this.port + '/jsonrpc.js';

    var players = null;
    var client = jayson.client.http(this.address);
    client.options.version = 1;

    this.ready = function () {
        var self = this;

        return new Promise(function (resolve, reject) {
            getPlayers.call(self).then(function () {
                resolve();
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

    this.searchArtists = function (query) {
        return new Promise((resolve, reject) => {
            this.getArtists().then((list) => {
                var artists = this.search(query, ['artist'], list);
                resolve(artists[0]);
            });
        });
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
                    resolve(getPlayerByName(name));
                });
            } else {
                resolve(getPlayerByName(name));
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
        var foundPlayer = null;
        for (var player in players) {
            if (players[player].properties.name.toLowerCase() === name.toLowerCase()) {
                foundPlayer = players[player];
            }
        }
        return foundPlayer;
    }
}

module.exports = SqueezeServer;