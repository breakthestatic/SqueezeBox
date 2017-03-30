var jayson = require('jayson/promise');
var SqueezePlayer = require('./squeeze-player');

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